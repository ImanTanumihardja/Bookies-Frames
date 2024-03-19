const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

// Create a script that access kv storage and reset the hasClaimed value
async function resetHasClaimed() {
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
    users = users.filter((_ : any, index : number) => index % 2 === 0)

    // Reset the hasClaimed value for each user
    for (const fid of users) {
        await kv.hset(fid.toString(), {'hasClaimed': false});
        console.log(`Reset hasClaimed for user: ${fid}`)
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