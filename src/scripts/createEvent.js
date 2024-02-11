const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

async function createEvent(eventName='sblviii-ml', startDate=1707751800000, odds=[0.5, 0.5], multiplier=1, options=["Chiefs ML", "49ers ML"], prompt="Who will win the Super Bowl?") {
    const count = await kv.zcount("users", 0, 'inf')
    console.log(`Total users: ${count}`)

    let event = {}
    event[eventName] = {startDate: startDate, poll: [0, 0], bets: {}, result: -1, odds: odds, multiplier: multiplier, options: options, prompt: prompt};
    await kv.hset(`events`, event);

    event = await kv.hget(`events`, `${eventName}`)
    console.log(`Event: ${eventName}`)
    console.log(event)
}

if (require.main === module) {
    // Read in cli arguments
    const args = require('minimist')(process.argv.slice(2), {string: ['e']})
    createEvent().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = createEvent
