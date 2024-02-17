const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Event, Bet } from '../../app/types';

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

// Create a script that access kv storage and reset the hasClaimed value
async function updateEventType() {
    // Get event
    const eventData : Event = await kv.hget(`events`, `sblviii-ml`);

    const bets = eventData.bets

    const newBets:any = {}

    // for each bet, update the type
    for (const fid in bets) {
        const bet = bets[fid]

        const updatedBet : Bet = {
            prediction: bet.prediction,
            odd: eventData.odds[bet.prediction],
            stake: bet.stake,
            timeStamp: bet.timeStamp,
        }

        newBets[fid] = updatedBet
    }
    console.log(newBets)

    // Update the event
    eventData.bets = newBets

    let event:any = {}
    event[`sblviii-ml`] = eventData
    await kv.hset(`events`, event);
}   

if (require.main === module) {
    updateEventType().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = updateEventType