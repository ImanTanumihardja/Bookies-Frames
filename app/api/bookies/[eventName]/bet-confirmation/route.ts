import { getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event } from '../../../../types';
import { Accounts, DatabaseKeys, FrameNames, RequestProps, generateUrl, getRequestProps, getFrameMessage } from '../../../../../src/utils';
import {ethers} from 'ethers';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req);

  const {button, fid, transactionId} = message;

  const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_PROVIDER_URL);

  // Get eventName from req
  let {eventName, stake, pick} = getRequestProps(req, [RequestProps.EVENT_NAME, RequestProps.STAKE, RequestProps.PICK]);

  const txReceipt = await provider.getTransactionReceipt(transactionId)

  // Check if mind
  if (!txReceipt) {
    // Redirect to not-mined frame
    
  }

  // Wait for both user to be found and event to be found
  let addresses : string[] | null = null;
  let event : Event | null = null;

  await Promise.all([kv.hgetall(`${fid.toString()}:addresses`), kv.hgetall(eventName)]).then( (res) => {
    addresses = res[0] as unknown as string[] || null;
    event = res[1] as Event || null;
  });

  event = event as unknown as Event || null;
  addresses = addresses as unknown as string[] || null;

  if (event === null) throw new Error('Event not found');

  console.log('FID: ', fid.toString())
  console.log('EVENT: ', event)

  const now = new Date().getTime();

  // Need to check bet does not exists, time is not past, and stake >= 1 and not rejected
  if (now < event?.startDate && stake > 0 && parseInt(event?.result.toString()) === -1 && button != 1 && txReceipt) {

    // Add users connect address
    await kv.sadd(`${fid.toString()}:addresses`, txReceipt.from).then( async () => {
      // Set event
      await kv.sadd(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, fid).catch(async (error) => {
        console.error('Error adding user to event:', error);
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

      // Add to event bettors list
    }).catch((error) => {
      throw new Error('Error creating bet');
    });   
  } 
  else {
    pick = -1
    console.log('FAILED TO PLACE BET')
  }

  const imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.BUTTON_INDEX]: button, [RequestProps.FID]: fid, [RequestProps.EVENT_NAME]: eventName, [RequestProps.OPTIONS]: event.options, [RequestProps.TIME]: now, [RequestProps.RESULT]: event.result}, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: imageUrl,
      buttons: 
      [
        { 
          label: "/bookies!", 
          action: 'link', 
          target: 'https://warpcast.com/~/channel/bookies'
        }, 
        {
          label: 'Place Another Bet', 
          action:'post', 
          target: generateUrl(`/api/bookies/${eventName}/${FrameNames.PLACE_BET}`, {[RequestProps.EVENT_NAME]: eventName}, false)}
        ],
      postUrl: `${process.env['HOST']}/api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}`,
    }),
  );
}


export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
