const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { DEFAULT_BET, calculatePayout } from "../utils";
import { Event, Bet } from '../../app/types';
import { createClient  } from "@vercel/kv";

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

async function getEvent(eventName = "sblviii-ml") {
  let eventData: Event | null = await kv.hgetall(`${eventName}`);
  console.log(`Event: ${eventName}`);
  console.log(eventData);
  
  // Get all bets
  let betsData = (await kv.zscan("users", 0, { count: 150 }))
  let cursor = betsData[0]
  let bets : Bet[] = betsData[1] as unknown as Bet[]

  while (cursor) {
    betsData = (await kv.zscan("users", cursor, { count: 150 }))
    cursor = betsData[0]
    bets = bets.concat(betsData[1] as unknown as Bet[])
  }

  console.log(`Total bets: ${bets.length}`);

  if (eventData?.result !== -1) {
    let maxValue = 0;
    let fids: number[] = [];
    let streak = 0;
    let payout = 0;

    for (const bet of bets) {
      if (bet.prediction === eventData?.result) {
        streak = await kv.hget(`${bet.fid}`, 'streak') || 0;
        payout = calculatePayout(eventData?.multiplier || 1, eventData?.odds[eventData?.result] || 0.5, bet.stake, streak);

        if (payout > maxValue) {
          fids = [bet.fid];
          maxValue = payout;
        } else if (payout === maxValue) {
          fids.push(bet.fid);
        }
      }
    }

    console.log(`MAX WINNERS COUNT: ${fids.length}`);
    console.log(`MAX WINNERS: ${fids}`);
    console.log(`MAX WINNERS PAYOUT: ${maxValue}`);
  }
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

module.exports = getEvent