const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: "../../.env"})
const {NeynarAPIClient} = require("@neynar/nodejs-sdk")

// Create a script that access kv storage and reset the hasClaimed value
async function resetHasClaimed() {

    // don't have an API key yet? get one at neynar.com
    const neynarClient = new NeynarAPIClient(process.env['NEYNAR_API_KEY'] || "");

    const kv = createClient({
        url: process.env['KV_REST_API_URL'],
        token: process.env['KV_REST_API_TOKEN'],
      });

    const count = await kv.zcount("users", 0, 'inf')
    console.log(`Total users: ${count}`)

    let users = (await kv.zscan("users", 0, { count: count }))[1]

    // Filter out every other element
    const fids = users.filter((_, index) => index % 2 === 0)

    for (const fid of fids) { 
        console.log(fid)
        const username = (await neynarClient.fetchBulkUsers([fid], { viewerFid: 244367})).users[0].username;

        if (username) {
            console.log(username)
            // await kv.del(username);
        }
        else {
            console.log("No username found")
        }
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