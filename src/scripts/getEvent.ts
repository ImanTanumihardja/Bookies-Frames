const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Accounts, DatabaseKeys, calculatePayout } from "../utils";
import { Event, Bet, User } from '../../app/types';
import { createClient  } from "@vercel/kv";

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

export default async function getEvent(eventName="") {
  let eventData: Event | null = await kv.hgetall(`${eventName}`);
  console.log(`Event: ${eventName}`);
  console.log(eventData);
  
  // Get all bets
  let betsData = (await kv.sscan(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`, 0, { count: 150 }))
  let cursor = betsData[0]
  let aleaFIDs : number[] = betsData[1] as unknown as number[]

  while (cursor) {
    betsData = (await kv.sscan(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`, cursor, { count: 150 }))
    cursor = betsData[0]
    aleaFIDs = aleaFIDs.concat(betsData[1] as unknown as number[])
  }

  betsData = (await kv.sscan(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, 0, { count: 150 }))
  cursor = betsData[0]
  let bookiesFIDs : number[] = betsData[1] as unknown as number[]

  while (cursor) {
    betsData = (await kv.sscan(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, cursor, { count: 150 }))
    cursor = betsData[0]
    bookiesFIDs = aleaFIDs.concat(betsData[1] as unknown as number[])
  }

  // Get poll data
  const pollData : Record<number, number> | null = await kv.hgetall(`${eventName}:${DatabaseKeys.POLL}`);
  if (pollData === null) {
    throw new Error(`Poll: ${eventName} does not exist`)
  }
  console.log(`Poll: ${pollData.toString()}`);

  console.log(`Total bets: ${aleaFIDs.length}`);

  if (eventData?.result != -1) {
    let maxValue = 0;
    let fids: number[] = [];
    let payout = 0;

    // Find the max winners
    for (const fid of fids) {
      const user : User | null = await kv.hgetall(fid.toString());

      if (user === null) {
        console.error(`User: ${fid} does not exist`)
        continue;
      } 

      const bets : Bet[] = user?.bets[eventName]
      for (const bet of bets) {
        if (bet.pick === eventData?.result) {
          payout = calculatePayout(eventData?.odds[eventData?.result] || 0.5, bet.stake);
  
          if (payout > maxValue) {
            fids = [fid];
            maxValue = payout;
          } else if (payout === maxValue) {
            fids.push(fid);
          }
        }
      }
    }

    console.log(`MAX WINNERS COUNT: ${fids.length}`);
    console.log(`MAX WINNERS: ${fids}`);
    console.log(`MAX WINNERS PAYOUT: ${maxValue}`);
  }

  return {...eventData, aleaBettors: aleaFIDs, bookiesBettors: bookiesFIDs, pollData: pollData}
}


if (require.main === module) {
  // Read in cli arguments
  const args = require('minimist')(process.argv.slice(2), {string: ['e']})
  getEvent(args['e']).then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
