// const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { calculatePayout } from "../utils";
import { Event, Bet, User } from '../../app/types';
import { createClient  } from "@vercel/kv";

const kv = createClient({
    url: process.env['KV_REST_API_URL'] || '',
    token: process.env['KV_REST_API_TOKEN'] || '',
  });

async function settleEvent(eventName="", result=-1) {
    let eventData: Event | null = await kv.hget(`events`, `${eventName}`);

    if (eventData === null) {
      throw new Error(`Event: ${eventName} does not exist`)
    }
    
    if (eventData?.startDate > new Date().getTime()) {
      throw new Error('Event has not started yet')
    }

    if (eventData?.result !== -1) {
      throw new Error('Event has already been settled')
    } 

    if (result === -1) {
      throw new Error('Result is invalid')
    }

    console.log(`Event: ${eventName}`)
    console.log(eventData)

    // Set the result of the event
    eventData.result = result

    let event: any = {}
    event[eventName] = eventData;
    await kv.hset(`events`, event);
    console.log(`Set result of event: ${eventName} to ${result}`)

    // Get all bets
    let betsData = (await kv.zscan("users", 0, { count: 150 }))
    let cursor = betsData[0]
    let bets : Bet[] = betsData[1] as unknown as Bet[]

    while (cursor) {
      betsData = (await kv.zscan("users", cursor, { count: 150 }))
      cursor = betsData[0]
      bets = bets.concat(betsData[1] as unknown as Bet[])
    }

    // Pay each user
    for (const bet of bets) {
      const user : User | null = await kv.hgetall(bet?.fid.toString());
      if (user !== null) {
        if (bet.prediction === result) {  
          // Pay out the user
          console.log(`Paying out user: ${bet?.fid} with wager: ${bet.stake}`)
          const payout = calculatePayout(eventData.multiplier, eventData.odds[result], bet.stake, user?.streak);

          user.balance = parseInt(user?.balance.toString()) + payout;
          user.streak = parseInt(user?.streak.toString()) + 1;
          user.numBets = parseInt(user?.numBets.toString()) + 1;
          user.wins = parseInt(user?.wins.toString()) + 1;
        }
        else if (parseInt(bet?.fid.toString())) {
          // User lost
          console.log(`User: ${bet?.fid} lost with wager: ${bet.stake}`)

          user.streak = 0;
          user.numBets = parseInt(user.streak.toString()) + 1;
          user.losses = parseInt(user.losses.toString()) + 1;
        }

        await kv.hset(bet.fid.toString(), user).then( async () => {
          console.log(`Settled user: ${bet.fid}`)
          // Update leaderboard;
          await kv.zadd('users', {score:user.balance, member:bet.fid});
        }).catch((error) => {
          throw new Error(`Error updating user: ${bet.fid}`)
        });
      }
  }
}

if (require.main === module) {
    // Read in cli arguments
    const args = require('minimist')(process.argv.slice(2), {string: ['e']})
    settleEvent(args['e'], args['r']).then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = settleEvent
