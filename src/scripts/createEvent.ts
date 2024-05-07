const { createClient  } = require("@vercel/kv");
const dotenv = require("dotenv")
const fs = require('fs')
const path = require('path');
dotenv.config({ path: ".env"})
import { Event } from '../../app/types';
import {Accounts, DatabaseKeys, Outcomes} from '../../src/utils'
import { ethers } from 'ethers';
import  orderBookieFactoryABI  from '../../app/contract-abis/orderBookieFactory';
import { ORDERBOOKIE_FACTORY_ADDRESS, USDC_ADDRESS } from '../../app/addresses'
import { Etherscan } from "@nomicfoundation/hardhat-verify/etherscan";
import { sleep } from '@nomicfoundation/hardhat-verify/internal/utilities';
import OrderBookieABI from '../../app/contract-abis/orderBookie';

const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

export default async function createEvent(eventName=``, startDate=0, odds=[0.5, 0.5], options=["", ""], prompt="", host="", description='', acceptedToken='') {
  if (startDate < new Date().getTime() / 1000) {
    throw new Error('Start date is invalid')
  }

  if (odds.length != options.length) {
    throw new Error('Odds and options length do not match')
  }

  // Check if any of the options are empty
  if (options.some((option) => option === "")) {
    throw new Error('Options cannot be empty')
  }

  if (odds.reduce((a, b) => a + b, 0) != 1 && odds.length === 2) {
    throw new Error('The sum of odds is not equal to 1')
  }

  // Check startDate is seconds not milliseconds
  if (startDate.toString().length > Math.ceil(new Date().getTime() / 1000).toString().length) {
    throw new Error('Start date is in milliseconds')
  }

  // Check if event already exists
  const eventExists = await kv.exists(`${eventName}`)
  if (eventExists) {
    throw new Error(`Event ${eventName} already exists`)
  }

  if (host !== Accounts.ALEA && host !== Accounts.BOOKIES && host !== Accounts.BOTH) {
    throw new Error('Invalid host')
  }

  // Deploy Orderbookie smart contract
  let address = ""
  if (host === Accounts.BOOKIES || host === Accounts.BOTH) { // If bookies is the host deploy smart contract
    if (description && acceptedToken) {
        const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
        const signerAddress = await signer.getAddress();
        const orderBookiefactory = new ethers.Contract(ORDERBOOKIE_FACTORY_ADDRESS, orderBookieFactoryABI, signer);

        console.log('Creating OrderBookie Contract...')

        // Create ancillary data
        const ancillaryData = {
          title: prompt,
          description: description,
          options: [[options[0], Outcomes.OUTCOME1.toString()], [options[1], Outcomes.OUTCOME2.toString()], ["Tie", Outcomes.TIE.toString()]],
        }

        console.log('Ancillary Data: ', ancillaryData)

        const tx = await orderBookiefactory.createOrderBookie(ethers.toUtf8Bytes(JSON.stringify(ancillaryData)),
                                                              startDate, // Convert from milli-seconds to seconds
                                                              0,
                                                              0,
                                                              1800,
                                                              USDC_ADDRESS,
                                                              acceptedToken,
                                                              ethers.encodeBytes32String("MULTIPLE_CHOICE_QUERY"),
                                                              signerAddress,
                                                              false)

        // Get address of create contract
        const txReceipt = await tx.wait()

        console.log('TX RECEIPT: ', txReceipt.hash)
        
        const logs:any = txReceipt?.logs.map((log:any) => orderBookiefactory.interface.parseLog(log))

        // Find event with Name OrderBookieEvent
        const event = logs?.find((log:any) => log?.name === "OrderBookieCreated")

        // Print the arg
        console.log('OrderBookie Address: ', event?.args[0])
        address = event?.args[0]

        // Get orderbookie contract
        const orderBookie = new ethers.Contract(address, OrderBookieABI, signer)
        const orderBookieInfo = await orderBookie.getBookieInfo()

        // Verify the contract on etherscan
        const instance = new Etherscan(
          process.env.BASESCAN_API_KEY || '', // Etherscan API key
          "https://api.basescan.org/api", // Etherscan API URL
          "https://basescan.org/" // Etherscan browser URL
        );

        // Read in json file
        const filePath = process.cwd() + '/app/json/orderbookieVerify.json';
        const contractSourceCode = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Encode parameters using orderbookie interface

        // convert eventID to hex number
        const abiCoder = new ethers.AbiCoder();
        let encodedConstructorArgs = abiCoder.encode(["bytes32", "uint256", "address", "address", "address"], [
          orderBookieInfo.eventID,
          startDate, // Convert from milli-seconds to seconds
          orderBookieInfo.owner,
          orderBookieInfo.settlementManagerAddress,
          orderBookieInfo.acceptedTokenAddress,
        ]);

        //drop "0x"
        encodedConstructorArgs = encodedConstructorArgs.slice(2);

        if (!(await instance.isVerified(address))) {
          console.log("Verifying: " + address)
          const { message: guid } = await instance.verify(
            // Contract address
            address,
            // Contract source code
            JSON.stringify(contractSourceCode),
            // Contract name
            "contracts/OrderBookie.sol:OrderBookie",
            // Compiler version
            "v0.8.19+commit.7dd6d404",
            // Encoded constructor arguments
            encodedConstructorArgs
          );
        
          await sleep(1000);
          const verificationStatus = await instance.getVerificationStatus(guid);
        
          if (verificationStatus.isSuccess()) {
            const contractURL = instance.getContractUrl(address);
            console.log(
              `Successfully verified contract "MyContract" on Etherscan: ${contractURL}`
            );
          }
          else {
            console.error(`Failed to verify contract: ${verificationStatus.message}`);
          
          }
        }
    }
    else {  
      throw new Error(`Ancillary data is required for bookies`)
    }
  }

  let event: Event = {startDate, result: -1, odds, options, prompt, host, address} as Event;
  await kv.hset(`${eventName}`, event);

  // Create poll
  const poll = {0: 0, 1: 0, 2: 0, 3: 0} as Record<number, number>
  await kv.hset(`${eventName}:${DatabaseKeys.POLL}`, poll)

  if (host === Accounts.ALEA || host === Accounts.BOTH) {
    // Create alea bets list 
    await kv.del(`${Accounts.ALEA}:${eventName}:${DatabaseKeys.BETTORS}`)
  }

  if (host === Accounts.BOOKIES || host === Accounts.BOTH) {
    // Create bookies bets list 
    await kv.del(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`)
  }

  event = await kv.hgetall(`${eventName}`)

  console.log(`Event: ${eventName}`)
  console.log(event)
}

if (require.main === module) {
  // Read event file using fs
  const filePath = path.join(__dirname, `../../event.json`);
  const eventData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (eventData === null) {
    throw new Error('Event data is null')
  }

  const eventName = eventData.eventName;
  const startDate = eventData.startDate;
  const odds = eventData.odds;
  const multiplier = eventData.multiplier;
  const options = eventData.options;
  const prompt = eventData.prompt;

  createEvent(eventName, startDate, odds, multiplier, options, prompt).then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
