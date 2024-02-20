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
  let eventData: Event | null = await kv.hget(`events`, `${eventName}`);
  console.log(`Event: ${eventName}`);
  console.log(eventData);
  console.log(`Total bets: ${(Object.keys(eventData?.bets || {}).length)}`);

  if (eventData?.result !== -1) {
    let maxValue = 0;
    let fids: string[] = [];
    let bet: Bet;
    let streak = 0;
    let payout = 0;

    for (const fid in eventData?.bets as Record<string, Bet>) {
      bet = eventData?.bets[parseInt(fid)] || DEFAULT_BET

      if (bet.prediction === eventData?.result) {
        streak = await kv.hget(`${fid}`, 'streak') || 0;
        payout = calculatePayout(eventData?.multiplier || 1, eventData?.odds[eventData?.result] || 0.5, bet.stake, streak);

        if (payout > maxValue) {
          fids = [fid];
          maxValue = payout;
        } else if (payout === maxValue) {
          fids.push(fid);
        }
      }
    }

    console.log(`MAX WINNERS COUNT: ${fids.length}`);
    console.log(`MAX WINNERS: ${fids}`);
    console.log(`MAX WINNERS PAYOUT: ${maxValue}`);
  }

  let count = 0;
  for (const bet in eventData?.bets) {
    count++;
  }
  console.log(`Total bets: ${count}`);
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