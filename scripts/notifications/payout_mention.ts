const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const ethers = require("ethers");
const { createClient  } = require("@vercel/kv");
const { orderBookieABI, erc20ABI } = require("@abis");

const dotenv = require("dotenv");
dotenv.config({ path: ".env"});

export async function payoutNotification(eventName:string, parentHash:string, tx_url:string) {
  
  const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

  const neynarClient = new NeynarAPIClient(process.env['NEYNAR_API_KEY']);

  let signerUUID = process.env['SIGNER_UUID']

  // Check signer uuid
  if (!signerUUID || (await neynarClient.lookupSigner(signerUUID)).status !== "approved"){
    throw new Error("Invalid signer uuid")
  }

  console.log("Signer UUID: ", signerUUID);

  console.log("Event Name: ", eventName);

  // Get orderbookie smart contract
  const eventInfo = await kv.hgetall(`${eventName}`);

  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);
  const orderbookie = new ethers.Contract(eventInfo.address, orderBookieABI, provider);

  // Get orderbookie info
  const orderBookieInfo = await orderbookie.getBookieInfo();

  // Get decimals for accpeted token
  const acceptedToken = await (new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider));
  const decimals = await acceptedToken.decimals();
  const symbol = (await acceptedToken.symbol()).toUpperCase();

  // Check if the bookie is settled
  if (parseFloat(ethers.formatEther(orderBookieInfo.result)) === -1) {
    throw new Error("Bookie is not settled yet");
  }

  // Get bettors
  let result = await kv.sscan(`bookies:${eventName}:bettors`, 0, {count: 100});
  let cursor = result[0];
  let fids = result[1];

  while (cursor && cursor !== "0") {
    result = await kv.sscan(`bookies:${eventName}:bettors`, cursor);
    cursor = result[0];
    fids = fids.concat(result[1]);
  }
  
  console.log(`Bettors: ${fids.toString()}`);

  // Send in batchs of 100
  let fidIndex = 0;
  let batch = fids.slice(fidIndex, Math.min(100, fids.length));

  // Get usernames for each fid
  let users = []
  while (fidIndex < fids.length) {
    await neynarClient.fetchBulkUsers(fids).then((result:any) => {
      // Appned usernames to the array
      users = users.concat(result.users);
    })

    fidIndex += batch.length;
    batch = fids.slice(fidIndex, Math.min(100, fids.length));
  }

  for (let i = 0; i < users.length; i++) {
    const username = users[i].username;
    const fid = users[i].fid;

    console.log(username, fid);

    if (fid === 391387 || fid === 313859 || fid === 241573 || fid === 244367) {
      continue;
    }

    // Get address from kv
    const addresses = (await kv.sscan(`${fid}:addresses`, 0))[1];

    let payout = 0;
    let unfilled = 0;
    for (let j = 0; j < addresses.length; j++) {
      const address = addresses[j];

      // Check if they won
      const bets = (await orderbookie.getBets(address));

      // Calculate how much they were paid out
      for (let k = 0; k < bets.length; k++) {
        const bet = bets[k];
        if (bet.pick === orderBookieInfo.result) {
          payout += parseFloat(ethers.formatUnits(bet.stakeUsed + bet.toWinFilled, decimals));
        }

        // Calculate how much was unfilled
        unfilled += parseFloat(ethers.formatUnits(bet.stake - bet.stakeUsed, decimals));
      }
    }
    

    if (payout !== 0) {
      // Send notification
      const message = `Congratulations @${username}! You won ${payout.toFixed(2).toLocaleString()} ${symbol}! ${tx_url}`;
      console.log(message +'\n');
      neynarClient.publishCast(signerUUID, message, {replyTo:parentHash})
    }
    
    if (unfilled >= 0.01) {
      // Send notification
      const message = `@${username} we were unable to match your bet with a counterparty to fully fill your bet. We have returned ${unfilled.toFixed(2).toLocaleString()} ${symbol} back to your wallet! ${tx_url}`;
      console.log(message +'\n');
      neynarClient.publishCast(signerUUID, message, {replyTo:parentHash})
    }
  }
}