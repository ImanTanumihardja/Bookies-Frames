const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

export function calculatePayout(multiplier, impliedProbability, stake, streak = 0){
    return multiplier * (1 / impliedProbability) * (stake + streak)
}

async function settleEvent(eventName="sblviii-ml", result=-1) {
    let eventData = await kv.hget(`events`, `${eventName}`);
    console.log(`Event: ${eventName}`)
    console.log(eventData)

    // Set the result of the event
    eventData.result = result

    let event = {}
    event[eventName] = eventData;
    await kv.hset(`events`, event);
    console.log(`Set result of event: ${eventName} to ${result}`)

    // Pay each user
    for (const bet of event.bets) {
      if (bet.prediction === result) {  
        // Pay out the user
        const user = await kv.hgetall(bet.fid);
        const payout = calculatePayout(eventData.multiplier, eventData.odds[result], bet.wager, user.streak);

        const userBets = await kv.hget();
        console.log
      }
    }


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
