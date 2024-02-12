const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

function calculatePayout(multiplier, impliedProbability, stake, streak = 0){
    return multiplier * (1 / impliedProbability) * (stake + streak)
}

async function settleEvent(eventName="sblviii-ml", result=-1) {
    let eventData = await kv.hget(`events`, `${eventName}`);
    
    if (eventData.startDate > new Date().getTime()) {
      throw new Error('Event has not started yet')
    }

    console.log(`Event: ${eventName}`)
    console.log(eventData)

    // Set the result of the event
    eventData.result = result

    let event = {}
    event[eventName] = eventData;
    await kv.hset(`events`, event);
    console.log(`Set result of event: ${eventName} to ${result}`)

    // Pay each user
    const multi = await kv.multi();
    for (const fid in eventData.bets) {
      let bet = eventData.bets[fid]
      if (bet.prediction === result) {  
        // Pay out the user
        console.log(`Paying out user: ${fid} with wager: ${bet.stake}`)
        const user = await kv.hgetall(fid);
        const payout = calculatePayout(eventData.multiplier, eventData.odds[result], bet.stake, parseInt(user.streak.toString()));
        user.points = parseInt(user.points.toString()) + payout;
        user.streak = parseInt(user.streak.toString()) + 1;
        user.numBets = parseInt(user.numBets.toString()) + 1;
        user.wins = parseInt(user.wins.toString()) + 1;

        await multi.hset(fid.toString(), user);
        await multi.zincrby('users', payout, fid);
        await multi.exec();
      }
      else {
        // User lost
        // console.log(`User: ${fid} lost with wager: ${bet.stake}`)
        const user = await kv.hgetall(fid);
        user.streak = 0;
        user.numBets = parseInt(user.streak.toString()) + 1;
        user.losses = parseInt(user.losses.toString()) + 1;

        await multi.hset(fid.toString(), user);
        await multi.exec();
    }
  }
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
