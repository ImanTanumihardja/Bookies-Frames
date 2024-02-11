const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

// Create a script that access kv storage and reset the hasClaimed value
async function resetHasClaimed() {
    const kv = createClient({
        url: process.env['KV_REST_API_URL'],
        token: process.env['KV_REST_API_TOKEN'],
      });

    const count = await kv.zcount("users", 0, 'inf')
    console.log(`Total users: ${count}`)

    let users = (await kv.zscan("users", 0, { count: count }))[1]

    // Filter out every other element
    users = users.filter((_, index) => index % 2 === 0)
    
    // Go through array and figure out how many unique users we have
    let uniqueUsers = []
    users.forEach(user => {
        if (!uniqueUsers.includes(user)) {
            uniqueUsers.push(user)
        }
    })

    // Check if we have any duplicate users
    if (uniqueUsers.length !== users.length) {
        console.log(`Have duplicate user: ${uniqueUsers.length} !== ${users.length}`)
    }

    // // Reset the hasClaimed value for each user
    // for (const user in uniqueUsers) {
    //     const user = uniqueUsers[i]
    //     await kv.hset(user.toString(), {'hasClaimed': false});
    // }
}   

if (require.main === module) {
    resetHasClaimed().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = resetHasClaimed