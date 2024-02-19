const dotenv = require("dotenv")
dotenv.config({ path: ".env"})
const fs = require('fs');

import { parse } from 'path';
import { Event, Bet, User } from '../../app/types';
import { createClient  } from "@vercel/kv";

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

async function getEvent(eventName = "nba-asg-ml") {
  // const filePath = './logs_result.json';
  // const logs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // // Get only the message data for each object in logs
  // const messages = logs.map((log: any) => log.message);

  // // Filter out all message that do not begin with NEW BET and grab the message after it aswell
  // let newBets = messages.map((message: string, index: number) => {
  //   if (message.includes('nba-asg-ou') && messages[index - 1].includes('FID:') && messages[index - 2].includes('NEW BET:')) {
  //     return {'FID': parseInt(messages[index - 1].replace('FID: ', '')), bet: messages[index - 2].replace('NEW BET:  ' , '').replace(new RegExp(',', 'g'), '').replace(new RegExp('\n', 'g'), '', ).replace(new RegExp('  ', 'g'), ' ').replace('{', '').replace('}', '')};
  //   }
  // });

  // // Remove all undefined values
  // newBets = newBets.filter((bet: any) => bet !== undefined);

  // //parse stringBets into JSON
  // const bets = newBets.reduce((acc:Record<number, Bet>, stringBet: any) => {
  //   // Split the string into an array
  //   const betValues = stringBet.bet.split(' ');
  //   console.log(stringBet)

  //   // Check if float if so ceil it to the nearest whole number
  //   const stake = parseFloat(betValues[6]);
  //   const stakeInt = Math.ceil(stake);

  //   const bet : Bet =  {
  //     prediction: parseInt(betValues[2]),
  //     odd: 0.5,
  //     stake: stakeInt,
  //     timeStamp: parseInt(betValues[8])
  //   }

  //   acc[stringBet.FID] = bet;
  //   return acc;
  // });

  // console.log(bets)
  // console.log(`Total new bets: ${(Object.keys(bets || {}).length)}`);

  let eventData: Event | null = await kv.hget(`events`, `${eventName}`);
  console.log(`Event: ${eventName}`);
  console.log(eventData);
  console.log(`Total bets: ${(Object.keys(eventData?.bets || {}).length)}`);

  // if (eventData !== null) {
  //   // Add new bets to the existing bets while checking for duplicate bets
  //   for (const [key, value] of Object.entries(bets)) {
  //     if (eventData.bets[Number(key)] === undefined) {
  //       eventData.bets[Number(key)] = value as Bet;
  //     }
  //     else {
  //       // Check if users bet is the same as the new bet
  //       if (JSON.stringify(eventData.bets[Number(key)]) === JSON.stringify(value)) {
  //         console.log(`Duplicate bet: ${key} is the same as the new bet`);
  //         // Dont add new bet
  //       }
  //       else {
  //         console.log(`Duplicate bet: ${key} is not the same as the new bet`);
  //         // Get the user data from kv database
  //         let user: User|null = await kv.hgetall(key.toString()) || null;
          
  //         // Combine stake of the new bet with the old bet and make new bet
  //         if (user) {
  //           console.log(`User: ${key} balance equal to combine bets`);
  //           let newStake = eventData.bets[Number(key)].stake + (value as Bet).stake;
  //           console.log('New Stake:', newStake);
  //           console.log('Available Bal: ', user?.availableBalance);
  //           console.log('Bal: ', user?.balance);
  //           eventData.bets[Number(key)].stake = newStake;
  //         }
  //       }
  //     }
  //   }

    // Go through whole bet and check if bet's stake is float
    if (eventData !== null) {
    for (const [key, value] of Object.entries(eventData.bets)) {
      const fid = Number(key);
      const bet = value as Bet;
      if (parseFloat(bet.stake.toString()) % 1 !== 0) {
        console.log(`User: ${fid} has a float stake: ${value.stake}`);
        let user: User|null = await kv.hgetall(fid.toString()) || null;
        if (user) {
          let newStake = Math.ceil(value.stake);
          console.log('New Stake:', newStake);
          console.log('Available Bal: ', user?.availableBalance);
          console.log('Bal: ', user?.balance);
          eventData.bets[Number(fid)].stake = newStake;
        }
      }
    }

    let event: any = {}
    event[eventName] = eventData
    await kv.hset(`events`, event);
  }

  // Get evetn data again to check if the new bets were added
  eventData = await kv.hget(`events`, `${eventName}`);
  console.log(`Event: ${eventName}`);
  console.log(eventData);
  console.log(`Total bets: ${(Object.keys(eventData?.bets || {}).length)}`);
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