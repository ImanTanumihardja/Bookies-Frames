const dotenv = require("dotenv")
dotenv.config({ path: ".env"})

import { Accounts, DatabaseKeys, ODDS_DECIMALS, PICK_DECIMALS } from "../utils";
import { createClient  } from "@vercel/kv";
import { ethers } from "ethers";
import orderbookieABI from '../../app/contract-abis/orderBookie';
import erc20ABI from '../../app/contract-abis/erc20';

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

export default async function placeBet(bettorAddress:string, orderBookieAddress:string, fid:number, stake:number, pick:number, odd:number) {
  // Get orderbookie info
  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

  const orderBookie = new ethers.Contract(orderBookieAddress, orderbookieABI, signer)
  const orderBookieInfo = await orderBookie.getBookieInfo()

  // Get accpected token
  const acceptedToken = new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, signer)
  const decimals = await acceptedToken.decimals()

  // Check if there is allowance
  const allowance = await acceptedToken.allowance(orderBookieAddress, orderBookieAddress)
  if (allowance <= 100){
    // Approve orderbookie to spend accepted token
    await (await acceptedToken.approve(orderBookie.getAddress(),  ethers.MaxUint256)).wait()
  }

  const pickBigNum = ethers.parseUnits(pick.toString(), PICK_DECIMALS)
  const stakeBigNum = ethers.parseUnits(stake.toString(), decimals)
  const oddBigNum = ethers.parseUnits(odd.toString(), ODDS_DECIMALS)

  // Place bet
  const placeBetTransaction = await orderBookie.placeBetFor(bettorAddress, pickBigNum, stakeBigNum, oddBigNum)
  await placeBetTransaction.wait()

  // Add users connect address
  await kv.sadd(`${fid.toString()}:addresses`, bettorAddress).catch(async (e) => {
    console.log('Error adding address to kv: ', e)
    // Try again
    await kv.sadd(`${fid.toString()}:addresses`, bettorAddress)
  })

  // Add user to bettors list
  await kv.sadd(`${Accounts.BOOKIES}:${orderBookieInfo.eventName}:${DatabaseKeys.BETTORS}`, fid).catch(async (error) => {
    console.error('Error adding user to bettors list: ', error);
    // Try again
    await kv.sadd(`${Accounts.BOOKIES}:${orderBookieInfo.eventName}:${DatabaseKeys.BETTORS}`, fid).catch((error) => {
      throw new Error('Error creating bet');
    })
  })
}


// if (require.main === module) {
//   // Read in cli arguments
//   const args = require('minimist')(process.argv.slice(2), {})
//   placeBet().then(() => process.exit(0))
//     .catch(error => {
//       console.error(error)
//       process.exit(1)
//     })
// }
