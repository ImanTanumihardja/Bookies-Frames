const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Event } from '../../app/types';

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

// Create a script that access kv storage and reset the hasClaimed value
async function resetHasClaimed() {
    const count = await kv.zcount("users", 0, 'inf')
    console.log(`Total users: ${count}`)

    let users = (await kv.zscan("users", 0, { count: count }))[1]

    // Filter out every other element
    users = users.filter((_ : any, index : number) => index % 2 === 0)

    // // Reset the hasClaimed value for each user
    // for (const fid in users) {
    //     await kv.hset(fid.toString(), {'hasClaimed': false});
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