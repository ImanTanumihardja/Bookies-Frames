const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Accounts, DatabaseKeys, PICK_DECIMALS } from "@utils/constants";
import { Event } from '@types';
import { createClient  } from "@vercel/kv";
import { ethers } from "ethers";
import {OrderBookieABI} from '@contract-abis/orderBookie.json';
import {erc20ABI} from '@contract-abis/erc20.json';

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

export default async function getEvent(eventName="") {
  let eventData: Event | null = await kv.hgetall(`${eventName}`);
  console.log(`Event: ${eventName}`);
  console.log(eventData);
  
  // Get all alea bettors
  let betsData = (await kv.sscan(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`, 0, { count: 150 }))
  let cursor = betsData[0]
  let aleaFIDs : number[] = betsData[1] as unknown as number[]

  while (cursor && cursor !== "0") {
    betsData = (await kv.sscan(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`, cursor, { count: 150 }))
    cursor = betsData[0]
    aleaFIDs = aleaFIDs.concat(betsData[1] as unknown as number[])
  }

  // Get all bookies bettors
  betsData = (await kv.sscan(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, 0, { count: 150 }))
  cursor = betsData[0]
  let bookiesFIDs : number[] = betsData[1] as unknown as number[]

  while (cursor && cursor !== "0") {
    betsData = (await kv.sscan(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, cursor, { count: 150 }))
    cursor = betsData[0]
    bookiesFIDs = bookiesFIDs.concat(betsData[1] as unknown as number[])
  }

  // Get poll data
  const pollData : Record<number, number> | null = await kv.hgetall(`${eventName}:${DatabaseKeys.POLL}`);
  if (pollData === null) {
    throw new Error(`Poll: ${eventName} does not exist`)
  }

  console.log(`Total bets: ${aleaFIDs.length + bookiesFIDs.length}`);

  let orderBookieInfo = null
  if (eventData?.host === Accounts.BOOKIES || eventData?.host === Accounts.BOTH) {
    // Get orderbookie info
    const orderBookieAddress = eventData?.address || '';
    const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

    const orderBookie = new ethers.Contract(orderBookieAddress, OrderBookieABI, provider)
    orderBookieInfo = await orderBookie.getBookieInfo()

    // Get accpected token
    const decimals = await (new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider)).decimals();

    // Get bettors
    const bettors = await orderBookie.getBettors()
    console.log('Bettors: ', bettors, '\n')

    let numBets = 0;
    let totalStakedOutcome1 = BigInt(0);
    let totalStakedOutcome2 = BigInt(0);
    
    let totalUnfilledOutcome1 = BigInt(0);
    let totalUnfilledOutcome2 = BigInt(0);
    let unfilledBets = []

    for (const bettor of bettors) {
      const bets = await orderBookie.getBets(bettor);
      for (const bet of bets) {
        numBets += 1;
        const unfilled = bet.toWin - bet.toWinFilled;

        if (Number(ethers.formatUnits(bet.pick)) === 0) {
          totalStakedOutcome1 += bet.stake;

          if (unfilled > 0) {
            unfilledBets.push(bet);
            totalUnfilledOutcome1 += BigInt(unfilled);
          }
        } else if (Number(ethers.formatUnits(bet.pick)) === 1) {
          totalStakedOutcome2 += bet.stake;
          if (unfilled > 0) {
            unfilledBets.push(bet);
            totalUnfilledOutcome2 += BigInt(unfilled);
          }
        }
      }
    }
    console.log(`Number of Bets: ${numBets}\n`)

    console.log(`Total Staked Outcome 1: ${totalStakedOutcome1}`)
    console.log(`Total Staked Outcome 2: ${totalStakedOutcome2}\n`)

    console.log(`Total Unfilled Outcome 1: ${totalUnfilledOutcome1}`)
    console.log(`Total Unfilled Outcome 2: ${totalUnfilledOutcome2}`)

    console.log('Unfilled Bets: ', unfilledBets)
    
    console.log("result: ", orderBookieInfo?.result)

    orderBookieInfo = {
      // Decompose orderbookie info
      eventID : orderBookieInfo.eventID,
      result : ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS),
      startDate : orderBookieInfo.startDate,
      isCanceled : orderBookieInfo.isCancelled,
      owner : orderBookieInfo.owner,
      factoryAddress : orderBookieInfo.factoryAddress,
      settlementMangerAddress : orderBookieInfo.settlementManagerAddress,
      acceptedTokenAddress : orderBookieInfo.acceptedTokenAddress,
      totalStakedOutcome1: ethers.formatUnits(totalStakedOutcome1, decimals),
      totalStakedOutcome2: ethers.formatUnits(totalStakedOutcome2, decimals),
      totalUnfilledOutcome1: ethers.formatUnits(totalUnfilledOutcome1, decimals),
      totalUnfilledOutcome2: ethers.formatUnits(totalUnfilledOutcome2, decimals),
    }
    console.log('Order Bookie Info: ', orderBookieInfo)
  }

  return {...eventData, aleaBettors: aleaFIDs, bookiesBettors: bookiesFIDs, pollData: pollData, orderBookieInfo}
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
