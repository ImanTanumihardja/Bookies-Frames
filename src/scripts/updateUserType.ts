const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Event, User } from '../../app/types';

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
    users = users.filter((fid:number, index:number) => index % 2 === 0)

    users = users.filter((fid:number) => fid === 313859)

    for (const fid of users) {
        console.log(`FID: ${fid}`)

        const user = await kv.hgetall(fid)

        if (user.balance !== undefined) { // Check if user has already been updated
            console.log(`User: ${fid} already updated`)
            continue
        }

        // Convert old User object to new User object
        const updatedUser : User = {
            balance: user.points,
            availableBalance: user.points,
            hasClaimed: user.hasClaimed,
            wins: user.wins,
            losses: user.losses,
            streak: user.streak,
            numBets: user.numBets,
            bets: []
        }

        if (eventData.bets[fid] !== undefined) {
            updatedUser.bets.push('sblviii-ml')
        }

        console.log(`Changed User: ${JSON.stringify(updatedUser)}`)
        
        await kv.hset(fid.toString(), updatedUser)
        break
    }
}   

if (require.main === module) {
    resetHasClaimed().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = resetHasClaimed