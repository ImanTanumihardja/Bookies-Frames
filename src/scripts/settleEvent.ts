// const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Accounts, calculatePayout, DatabaseKeys } from "../utils";
import { Event, User } from '../../app/types';
import { createClient  } from "@vercel/kv";

const kv = createClient({
    url: process.env['KV_REST_API_URL'] || '',
    token: process.env['KV_REST_API_TOKEN'] || '',
  });

export default async function settleEvent(eventName="", result=-1) {
    let event: Event | null = await kv.hgetall(`${eventName}`);

    if (event === null) {
      throw new Error(`Event: ${eventName} does not exist`)
    }
    
    if (event?.startDate > new Date().getTime()) {
      throw new Error('Event has not closed yet')
    }

    if (parseFloat(event?.result.toString()) !== -1) {
      throw new Error('Event has already been settled')
    } 

    if (result === -1) {
      throw new Error('Result is invalid')
    }

    if (result >= event?.options.length) {
      throw new Error('Result is invalid')
    }

    console.log(`Event: ${eventName}`)
    console.log(event)

    // Set the result of the event
    event.result = result

    await kv.hset(`${eventName}`, event)
    console.log(`Set result of event: ${eventName} to ${result}`)

    // Get all bets
    let betsData = (await kv.sscan(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`, 0, { count: 150 }))
    let cursor = betsData[0]
    let fids : number[] = betsData[1] as unknown as number[]

    while (cursor) {
      betsData = (await kv.sscan(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`, cursor, { count: 150 }))
      cursor = betsData[0]
      fids = fids.concat(betsData[1] as unknown as number[])
    }

    // Filter out all fids that are not 313859
    // fids = fids.filter((fid:number) => fid === 241573) // Testing

    // Pay each user
    for (const fid of fids) {
      const user : User | null = await kv.hgetall(fid.toString());
      if (user === null) {
        console.log(`User: ${fid} does not exist`)
        continue
      }
      let toWinAmount = 0;
      for (const bet of user?.bets[eventName]) {
        if (!bet.settled) {
          // Check for Ties
          if (result === 0.5) {
            console.log(`Event settled with a tie: ${eventName}`)
            user.balance = Math.round(parseFloat(user?.balance.toString()) + bet.stake);
          }
          else if (bet.pick === result) {  // Won
            console.log(`User: ${fid} won bet: ${JSON.stringify(bet)}`)
            const payout = calculatePayout(bet.odd, bet.stake);

            console.log(`Payout: ${payout}`)

            user.balance = Math.round(parseFloat(user?.balance.toString()) + payout);
            toWinAmount += payout - bet.stake;
            user.streak = parseInt(user?.streak.toString()) + 1;
            user.wins = parseInt(user?.wins.toString()) + 1;
          }
          else { // Lost
            console.log(`User: ${fid} lost bet: ${JSON.stringify(bet)}`)
            user.streak = 0;
            user.losses = parseInt(user.losses.toString()) + 1;
            toWinAmount -= bet.stake;
          }
          bet.settled = true;
          user.numBets = parseInt(user?.numBets.toString()) + 1;
        }
      }
      // console.log(`Updated user: ${JSON.stringify(user)}`)

      // Update user and database
      await kv.hset(fid.toString(), user).then( async () => {
        console.log(`Settled user: ${fid}\n`)
        await kv.zincrby(DatabaseKeys.LEADERBOARD, toWinAmount, fid).catch((error) => {
          throw new Error(`Error updating leaderboard: ${fid}\n${error}`)
        })
      }).catch((error) => {
        throw new Error(`Error updating user: ${fid}\n${error}`)
      });
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
