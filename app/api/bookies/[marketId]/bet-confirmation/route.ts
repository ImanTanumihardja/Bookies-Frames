import { FrameButtonsType, getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Market } from '@types';
import { generateUrl, getRequestProps, getFrameMessage } from '@utils';
import { FrameNames, RequestProps, DatabaseKeys, Accounts } from '@utils/constants';
import {ethers} from 'ethers';
import {orderBookieABI} from '@abis';

export async function POST(req: NextRequest, { params: { marketId } }: { params: { marketId: string } }): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req);

  const {button, fid, transactionId, casterFID} = message;

  console.log('FID: ', fid.toString())

  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

  // Get eventName from req
  let {stake, pick, transactionHash} = getRequestProps(req, [ RequestProps.STAKE, RequestProps.PICK, RequestProps.TRANSACTION_HASH]);

  let isMined = false;

  let txReceipt;
  if (transactionId) 
  {
    transactionHash = transactionId // Coming from betslip
    txReceipt = await provider.getTransactionReceipt(transactionId);
    
    // Add to bettors list
    await kv.sadd(`${Accounts.BOOKIES}:${marketId}:${DatabaseKeys.BETTORS}`, fid).catch(async (error) => {
      console.error('Error adding user to bettors list:', error);
      // Try again
      await kv.sadd(`${Accounts.BOOKIES}:${marketId}:${DatabaseKeys.BETTORS}`, fid).catch(() => {
        throw new Error('Error creating bet');
      })
    })

    // Add market to user's bet list
    await kv.sadd(`${fid}:${DatabaseKeys.BETS}`, marketId).catch(async (error) => {
      console.error('Error adding event to user:', error);
      // Try again
      await kv.sadd(`${fid}:${DatabaseKeys.BETS}`, marketId).catch(() => {
        throw new Error('Error creating bet');
      })
    })

    // Add to referral leaderboard
    if (casterFID && casterFID !== fid) {
      await kv.zincrby(`${DatabaseKeys.REFERRALS}`, stake, casterFID).catch(async (error) => {
        console.error('Error adding user to referral leaderboard:', error);
        // Try again
        await kv.zincrby(`${DatabaseKeys.REFERRALS}`, stake, casterFID).catch(() => {
          throw new Error('Error creating bet');
        })
      })
    }
  } 
  else if (transactionHash) 
  {
    txReceipt = await provider.getTransactionReceipt(transactionHash);
  }

  // Wait for both user to be found and event to be found
  let event : Market | null = null;

  await Promise.all([, kv.hgetall(marketId)]).then( (res) => {
    event = res[1] as Market || null;
  });

  event = event as unknown as Market || null;

  if (event === null) throw new Error('Event not found');
  
  // Get all bookies events and filter out this eventName
  let activeEvents = (await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.MARKETS}`, 0, {count: 150}))[1] as string[];
  activeEvents = activeEvents.filter((e) => e !== String(marketId));

  console.log('EVENT: ', marketId)

  const orderBookie = new ethers.Contract(event.address, orderBookieABI, provider)
  const orderBookieInfo = await orderBookie.getBookieInfo()

  const now = new Date().getTime() / 1000;

  // Check if past startdate and event has not been settled
  if (now >= Number(orderBookieInfo?.startDate)) {
    return new Response(JSON.stringify({ message: 'Market Closed' }), { status: 400, headers: { 'content-type': 'application/json' } }); 
  }
  else if (button !== 1 && transactionHash) { // Need to check bet not rejected
    if (txReceipt){
      console.log('PLACED BET')

      isMined = true
    }
    else {
      console.log('Waiting for transaction to be mined')
    }
  } 
  else if (button === 1) {
    // Rejected bet
    console.log('REJECTED BET')
  }

  const imageUrl = generateUrl(`api/bookies/${marketId}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.BUTTON_INDEX]: button, 
                                                                                                [RequestProps.PROMPT]: event.prompt, 
                                                                                                [RequestProps.TRANSACTION_HASH]: transactionHash, 
                                                                                                [RequestProps.IS_MINED]: isMined}, true);

  // Create buttons for frame
  let buttons : FrameButtonsType = [
    { 
      label: "/bookies!", 
      action: 'link', 
      target: 'https://warpcast.com/~/channel/bookies'
    },
    {
      label: 'Refresh', 
      action:'post', 
      target: generateUrl(`api/bookies/${marketId}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.EVENT_NAME]: marketId, [RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.TRANSACTION_HASH]: !isMined ? transactionHash : ""}, false)
    },
  ];

  if (activeEvents.length > 0) {
    buttons.push({
      label: 'Bet on Another Event', 
      action:'post', 
      target: generateUrl(`api/bookies/${activeEvents[Math.floor(Math.random() * activeEvents.length)]}`, {}, false)
    })
  }
  
  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: imageUrl,
      buttons: buttons,
      postUrl: `${process.env['HOST']}/api/bookies/${marketId}/${FrameNames.BET_CONFIRMATION}`,
    }),
  );
}


export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
