const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { neynarClient } from "../utils";
import { Event } from '../../app/types';

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

// Create a script that access kv storage and reset the hasClaimed value
async function resetHasClaimed() {
    // Get event
    const eventData : Event = await kv.hget(`events`, `sblviii-ml`);

    const count = await kv.zcount("users", 0, 'inf')
    console.log(`Total users: ${count}`)

    // Iteratively fetch all users
    let result = (await kv.zscan("users", 0, { count: 150 }))
    let cursor = result[0]
    let users = result[1]

    while (cursor) {
        result = (await kv.zscan("users", cursor, { count: 150 }))
        cursor = result[0]
        users = users.concat(result[1])
    }

    // Filter out every other element
    users = users.filter((_:any, index:number) => index % 2 === 0)

    const threshold = 0.5 
    
    let ratios = []
    let deleteUsers = []
    let deletedCount = 0;

    for (const fid of users) {
        console.log(`FID: ${fid}`)

        if (fid < 0) {
            console.log('Skipping...')
            continue
        }

        let result = null

        // Fetch all casts created by the user until cursor is null
        try {
            result = (await neynarClient.fetchAllCastsCreatedByUser(fid, {limit:150})).result
        } catch (error) {
            console.error('Error: ', error)
            continue
        }

        let cursor = result.next.cursor
        let castCount = result.casts.length
        let reactionCount = result.casts.reduce((acc, cast) => acc + cast.reactions.count, 0)
        let ratio = 0
        
        while (cursor) {
            try {
                result = (await neynarClient.fetchAllCastsCreatedByUser(fid, {cursor:cursor, limit:150})).result
            }
            catch (error) {
                console.error('Error: ', error)
                break
            }
            cursor = result.next.cursor
            castCount += result.casts.length
            reactionCount += result.casts.reduce((acc, cast) => acc + cast.reactions.count, 0)
        }

        console.log('Total Number of Cast: ', castCount)
        console.log('Total Number of Reactions: ', reactionCount)

        if (castCount === 0) {
            ratios.push(0)
            continue
        }

        ratio = reactionCount / castCount

        console.log('Ratio: ', ratio)
        ratios.push(ratio)

        if (ratio < threshold) {
            // Check if they have bet
            const hasBet = eventData.bets.hasOwnProperty(fid)
            console.log('Has Bet: ', hasBet)
            if (!hasBet) {
                const multi = kv.multi()
                // Delete ueser since they are bots
                console.log('Deleting user: ', fid)
                deletedCount++;
                deleteUsers.push(fid)
                await multi.zrem('users', fid)
                await multi.del(fid)
                await multi.exec()
            }
        }

        console.log('\n')
    }

    console.log('Deleted Count: ', deletedCount)
    console.log('Deleted Users: ', deleteUsers)

    // console.log(ratios)
    // console.log('Average Ratio: ', ratios.reduce((acc, ratio) => acc + ratio, 0) / ratios.length)
    // console.log('Max Ratio: ', Math.max(...ratios))
    // console.log('Min Ratio: ', Math.min(...ratios))

}   

if (require.main === module) {
    resetHasClaimed().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = resetHasClaimed