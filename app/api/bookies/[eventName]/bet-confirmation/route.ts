import { FrameButtonsType, getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event } from '../../../../types';
import { Accounts, DatabaseKeys, FrameNames, RequestProps, generateUrl, getRequestProps, getFrameMessage, PICK_DECIMALS } from '../../../../../src/utils';
import {ethers} from 'ethers';
import orderbookieABI from '../../../../contract-abis/orderBookie';

export async function POST(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req);

  const {button, fid, transactionId} = message;

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
    await kv.sadd(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, fid).catch(async (error) => {
      console.error('Error adding user to bettors list:', error);
      // Try again
      await kv.sadd(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, fid).catch((error) => {
        throw new Error('Error creating bet');
      })
    })

    // Update poll
    await kv.hincrby(`${eventName}:${DatabaseKeys.POLL}`, `${pick}`, 1).catch(async (error) => {
      console.error('Error adding user to poll:', error);
      // Try again
      await kv.hincrby(`${eventName}:${DatabaseKeys.POLL}`, `${pick}`, 1).catch((error) => {
        throw new Error('Error creating bet');
      })
    })
  } 
  else if (transactionHash) 
  {
    txReceipt = await provider.getTransactionReceipt(transactionHash);
  }

  // Wait for both user to be found and event to be found
  let event : Event | null = null;

  await Promise.all([, kv.hgetall(eventName)]).then( (res) => {
    event = res[1] as Event || null;
  });

  event = event as unknown as Event || null;

  if (event === null) throw new Error('Event not found');

  console.log('FID: ', fid.toString())
  console.log('EVENT: ', eventName)

  const orderBookie = new ethers.Contract(event.address, orderbookieABI, provider)
  const orderBookieInfo = await orderBookie.getBookieInfo()
  const result = parseFloat(ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS))

  const now = new Date().getTime() / 1000;

  // Check if past startdate and event has not been settled
  if (now >= Number(orderBookieInfo?.startDate) || result !== -1) {
    pick = -1
    console.log('EVENT CLOSED')
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

  const imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.BUTTON_INDEX]: button, [RequestProps.FID]: fid, [RequestProps.ADDRESS]: event.address, [RequestProps.OPTIONS]: event.options, [RequestProps.RESULT]: result, [RequestProps.PROMPT]: event.prompt, [RequestProps.TRANSACTION_HASH]: transactionHash, [RequestProps.IS_MINED]: isMined}, true);

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
      target: generateUrl(`/api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.EVENT_NAME]: eventName, [RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.TRANSACTION_HASH]: !isMined ? transactionHash : ""}, false)
    },
  ];

  if (orderBookieInfo.startDate >= new Date().getTime() / 1000) {
    buttons.push({
      label: 'Place Another Bet', 
      action:'post', 
      target: generateUrl(`/api/bookies/${eventName}/${FrameNames.PLACE_BET}`, {[RequestProps.EVENT_NAME]: eventName}, false)
    })
  }

  // if (parseFloat(ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS)) !== -1) {
  //   buttons.push({
  //     label: 'Collect', 
  //     action:'post', 
  //     target: 'https://warpcast.com/bookies'
  //   })
  // }
  
  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: imageUrl,
      buttons: buttons,
      postUrl: `${process.env['HOST']}/api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}`,
    }),
  );
}


export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
