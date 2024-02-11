const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

async function settleEvent(eventName="sblviii-ml", result=-1) {
    const count = await kv.zcount("users", 0, 'inf')
    console.log(`Total users: ${count}`)

    let eventData = await kv.hget(`events`, `${eventName}`);
    console.log(`Event: ${eventName}`)
    console.log(eventData)

    // Set the result of the event
    eventData.result = result

    let event = {}
    event[eventName] = eventData;
    await kv.hset(`events`, event);

    console.log(`\nSettled event: ${eventName} with result: ${result}`)
    console.log(await kv.hget(`events`,  `${eventName}`))
}

if (require.main === module) {
    // Read in cli arguments
    const args = require('minimist')(process.argv.slice(2), {string: ['e']})
    settleEvent(args['e'], args['r']).then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = settleEvent
