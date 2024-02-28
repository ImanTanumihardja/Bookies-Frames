const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})
import { Event } from '../../app/types';

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

async function createEvent(eventName='lal-lac-ml', startDate=1709175600000, odds=[0.4202, 0.5798], multiplier=1, options=["LAL", "LAC"], prompt="Lakers vs Clippers") {
  // Check if event already exists
  const eventExists = await kv.exists(`${eventName}`)
  if (eventExists) {
    console.log(`Event ${eventName} already exists`)
    return
  }

  let event: Event = {startDate: startDate, result: -1, odds: odds, multiplier: multiplier, options: options, prompt: prompt} as Event;
  await kv.hset(`${eventName}`, event);

  // Create poll
  const poll = {0: 0, 1: 0, 2: 0, 3: 0} as Record<number, number>
  await kv.hset(`${eventName}:poll`, poll)

  // Create bets list 
  await kv.del(`${eventName}:bets`)

  event = await kv.hgetall(`${eventName}`)

  console.log(`Event: ${eventName}`)
  console.log(event)
  console.log(`Poll`, await kv.hgetall(`${eventName}:poll`))
  console.log(`Bets`, await kv.smembers(`${eventName}:bets`))
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
