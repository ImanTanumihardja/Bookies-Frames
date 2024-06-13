// const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Accounts, ALEA_FID, calculatePayout, DatabaseKeys, neynarClient } from "../utils";
import { Event, User } from '../../app/types';
import { createClient  } from "@vercel/kv";

const kv = createClient({
    url: process.env['KV_REST_API_URL'] || '',
    token: process.env['KV_REST_API_TOKEN'] || '',
  });

const REBATE = 0.10;

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

    // Get all casts from bookies account
    const casts = (await neynarClient.fetchAllCastsCreatedByUser(ALEA_FID, {limit: 150}))?.result?.casts;

    if (casts && casts.length === 0) {
        return Response.json({ message: 'No events found' });
    }
    
    // Find the cast associated with the event
    const cast = casts?.find((cast) => cast.text.includes(eventName));
    const castHash = cast?.hash;

    if (!castHash) {
        throw new Error(`Cast not found for event: ${eventName}`);
    }  

    let cursor = undefined;
    let likes: number[] = []
    let recasts: number[] = []

    while (cursor !== null) {
      await neynarClient.fetchReactionsForCast(castHash, 'all', {limit: 100, cursor: cursor}).then(async (result:any) => {
        const reactions = result.reactions

        // Loop through all reactions
        for (const reaction of reactions) {
          if (reaction.reaction_type === 'like') {
            likes.push(reaction.user.fid)
          }
          else if (reaction.reaction_type === 'recast') {
            recasts.push(reaction.user.fid)
          }
        }

        cursor = result.cursor
      }
      ).catch((error) => {
        throw new Error(`Error fetching reactions: ${error}`)
      });
    }

    // Set the result of the event
    event.result = result

    await kv.hset(`${eventName}`, event)
    console.log(`Set result of event: ${eventName} to ${result}`)

    // Get all bets
    let betsData = (await kv.sscan(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`, 0, { count: 150 }))
    cursor = betsData[0]
    let fids : number[] = betsData[1] as unknown as number[]

    while (cursor && cursor !== "0") {
      betsData = (await kv.sscan(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`, cursor, { count: 150 }))
      cursor = betsData[0]
      fids = fids.concat(betsData[1] as unknown as number[])
    }

    // // Filter out all fids that are not 313859
    // fids = fids.filter((fid:number) => fid === 313859) // Testing

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
            const payout = Math.ceil(calculatePayout(bet.odd, bet.stake));

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

            // Check if user is eligible for rebate
            if (likes.includes(fid) && recasts.includes(fid)) {
              console.log(`User: ${fid} is eligible for rebate`)

              const rebateAmount = Math.floor(bet.stake * REBATE);
              toWinAmount -= (bet.stake - rebateAmount);
              user.balance = Math.round(parseFloat(user?.balance.toString()) + rebateAmount)
            }
            else {
              console.log(`User: ${fid} is not eligible for rebate`)
              toWinAmount -= bet.stake;
            }
          }
          bet.settled = true;
          user.numBets = parseInt(user?.numBets.toString()) + 1;
        }
      }

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

    // Remove event from alea event list
    await kv.srem(`${Accounts.ALEA}:${DatabaseKeys.EVENTS}`, eventName).catch((error) => {
      throw new Error(`Error removing event from alea: ${error}`)
    })
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
