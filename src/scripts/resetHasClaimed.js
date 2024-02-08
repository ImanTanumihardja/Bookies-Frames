const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: "../../.env"})

// Create a script that access kv storage and reset the hasClaimed value
async function resetHasClaimed() {
    console.log("Resetting hasClaimed")

    const kv = createClient({
        url: process.env['KV_REST_API_URL'],
        token: process.env['KV_REST_API_TOKEN'],
      });

    const count = await kv.zcount("users", 0, 'inf')
    console.log(`Total users: ${count}`)
    
    const users = (await kv.zscan("users", 0, { count: count }))[1]

    

    // for (let i = 0; i < users.length; i += 2) {
    //     console.log(users[i])
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