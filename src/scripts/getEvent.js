const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

async function getEvent(eventName="sblviii-ml") {
    let eventData = await kv.hget(`events`, `${eventName}`);
    console.log(`Event: ${eventName}`)
    console.log(eventData)

    // Log how many bets there are
    let count = 0
    for (const bet in eventData.bets) {
        count++
    }
    console.log(`Total bets: ${count}`)
}

if (require.main === module) {
    // Read in cli arguments
    const args = require('minimist')(process.argv.slice(2), {string: ['e']})
    getEvent(args['e']).then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = getEvent
