const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

function calculatePayout(multiplier, impliedProbability, stake, streak = 0){
    return multiplier * (1 / impliedProbability) * (stake)
}

const result = 0

async function getEvent(eventName="sblviii-ml") {
    let eventData = await kv.hget(`events`, `${eventName}`);
    console.log(`Event: ${eventName}`)
    console.log(eventData)

    // Get all the fids that won the most
    let maxValue = 0
    let fids = []
    let bet;
    let streak = 0;
    let payout = 0;
    for (const fid in eventData.bets) {
        bet = eventData.bets[fid]
        if (bet.prediction === result) {
          // Get the user's streak
          streak = await kv.hget(`${fid}`, 'streak') || 0
          payout = calculatePayout(eventData.multiplier, eventData.odds[result], bet.stake, streak);
          if (payout > maxValue) {
            // Clear fids array and add the new fid
            fids.length = 0
            fids.push(fid)
            maxValue = payout
          }else if (payout === maxValue) {
            fids.push(fid)
          }
        }
    }

    console.log(`MAX WINNERS COUNT: ${fids.length}`)
    console.log(`MAX WINNERS: ${fids}`)
    console.log(`MAX WINNERS PAYOUT: ${maxValue}`)

    // Log how many bets there are
    let count = 0
    for (const bet in eventData.bets) {
        count++
    }
    console.log(`Total bets: ${(Object.keys(eventData.bets).length)}`)
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
