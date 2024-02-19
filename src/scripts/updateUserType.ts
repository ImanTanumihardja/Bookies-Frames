const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Event, User } from '../../app/types';

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

// Create a script that access kv storage and reset the hasClaimed value
async function updateUserType() {
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

    console.log(`Total users: ${users.length}`)

    // Get nba-asg-ou and nba-asg-ou events
    const eventData : Event | null = await kv.hget(`events`, `nba-asg-ou`)
    const eventData2 : Event | null = await kv.hget(`events`, `nba-asg-ml`)

    // users = users.filter((fid:number) => fid === 313859)
    let count = 0;

    if (eventData !== null || eventData2 !== null) {
      for (const fid of users) {
          const user : User | null = await kv.hgetall(fid)
          if (user === null) {
              console.log(`User: ${fid} does not exist`)
              // count++;
              continue
          }

          if (user.bets === undefined) {
              console.log(`User: ${fid} does not have any bets`, user)
              // count++;
              continue
          }

          const bets = user.bets

          // Check if user has a bet on nba-asg-ou if so check if they have bet in nba-asg-ou event
          if (bets.includes('nba-asg-ou')) {
            if (eventData?.bets[fid.toString()] === undefined) {
                console.log(`User: ${fid} does not have bet on nba-asg-ou event`)
                count++;
            }
          }

          // Check if user has a bet on nba-asg-ml if so check if they have bet in nba-asg-ml event
          if (bets.includes('nba-asg-ml')) {
            if (eventData2?.bets[fid.toString()] === undefined) {
                console.log(`User: ${fid} does not have bet on nba-asg-ml event`)
                count++;
            }
          }

          // Delete points
          // if (user.points !== undefined) {
          //     console.log(`Deleting points for User: ${fid}`)
          //     await kv.hdel(fid.toString(), 'points')
          // }
          
          // if (user.balance !== undefined) { // Check if user has already been updated
          //     console.log(`User: ${fid} already updated\n`)
          //     continue
          // }

          // // Convert old User object to new User object
          // const updatedUser : User = {
          //     balance: user.points,
          //     availableBalance: user.points,
          //     hasClaimed: user.hasClaimed,
          //     wins: user.wins,
          //     losses: user.losses,
          //     streak: user.streak,
          //     numBets: user.numBets,
          //     bets: []
          // }

          // if (eventData.bets[fid] !== undefined) {
          //     updatedUser.bets.push('sblviii-ml')
          // }

          // console.log(`Changed User: ${JSON.stringify(updatedUser)}\n`)
          
          // await kv.hset(fid.toString(), updatedUser)
      }
      console.log(`Total: ${count}`)
    }
}   

if (require.main === module) {
    updateUserType().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = updateUserType