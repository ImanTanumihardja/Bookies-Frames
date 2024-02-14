const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

// Create a script that access kv storage and reset the hasClaimed value
async function test() {
   await kv.zincrby('users', -100, 313859);

   console.log(await kv.zscore('users', 313859))
}   

if (require.main === module) {
    test().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = test