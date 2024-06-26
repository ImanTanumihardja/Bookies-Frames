const { createClient } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

// Create a script that access kv storage and reset the hasClaimed value
async function updateHasClaimed() {
    // Iteratively fetch all users
    let result = (await kv.zscan("leaderboard", 0, { count: 150 }))
    let cursor = result[0]
    let users = result[1]

    while (cursor && cursor !== "0") {
        result = (await kv.zscan("leaderboard", cursor, { count: 150 }))
        cursor = result[0]
        users = users.concat(result[1])
    }

    // Filter out every other element
    users = users.filter((_:number, index:number) => index % 2 === 0)

    console.log(`Total users: ${users.length}\n`)

    // users = users.filter((fid:number) => fid === 313859) // Testing

      for (const fid of users) {
          const user = await kv.hgetall(fid)
          if (user === null) {
              console.log(`User: ${fid} does not exist`)
              continue
          }

          await kv.hset(fid, {hasClaimed: false}).catch((error:any) => {
              console.error(`Error updating user: ${fid}`, error)
              throw new Error('Error updating user')
          })
          console.log(`User: ${fid} has been updated`)
      }
    }

if (require.main === module) {
  updateHasClaimed().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = updateHasClaimed