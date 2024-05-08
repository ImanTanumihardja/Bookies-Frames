const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const dotenv = require("dotenv");
const {message, parentHash, eventName} = require('./config.json');
const fs = require("fs");
const path = require("path");
const ethers = require("ethers");
const { createClient  } = require("@vercel/kv");
const { OrderBookieABI } = require("../../../app/contract-abis/orderBookie.json");

(async () => {
  dotenv.config({ path: ".env"});
  
  const kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
  });

  const neynarClient = new NeynarAPIClient(process.env['NEYNAR_API_KEY']);

  let signerUUID = process.env['SIGNER_UUID']

  // Check signer uuid
  if (!signerUUID || (await neynarClient.lookupSigner(signerUUID)).status !== "approved"){
    console.log("SIGNER_UUID is not set in the environment or not valid. Need to generate");

    // Register signer
    const signer = await neynarClient.createSignerAndRegisterSignedKey("FDM", {deadline:Math.floor(Date.now() / 1000) + 31556926});

    console.log(`Please connect through warpcast to approve the signer. Go here: ${signer.signer_approval_url}`)

    while ((await neynarClient.lookupSigner(signer.signer_uuid)).status !== "approved") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Waiting for signer to be approved...");
    }

    // Add to env
    // Resolving the path to the .env file.
    const envPath = path.resolve(__dirname, "../../../.env");

    // Reading the .env file.
    fs.readFile(envPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading .env file:", err);
        return;
      }

      // Appending the SIGNER_UUID to the file content.
      const newContent = data + `\nSIGNER_UUID=${signer.signer_uuid}`;

      // Writing the updated content back to the .env file.
      fs.writeFile(envPath, newContent, "utf8", (err) => {
        if (err) {
          console.error("Error writing to .env file:", err);
          return;
        }
        console.log(
          "SIGNER_UUID appended to .env file.\n"
        );
      });
    });
    signerUUID = signer.signer_uuid;
  }

  console.log("Signer UUID: ", signerUUID);

  console.log("Event Name: ", eventName);

  // Get orderbookie smart contract
  const eventInfo = await kv.hgetall(`${eventName}`);

  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);
  const orderbookie = new ethers.Contract(eventInfo.address, OrderBookieABI, provider);

  // Get orderbookie info
  const orderBookieInfo = await orderbookie.getBookieInfo();

  // Check if the bookie is settled
  if (parseFloat(ethers.formatEther(orderBookieInfo.result)) === -1) {
    throw new Error("Bookie is not settled yet");
  }

  // Get the username
  let usernames = [];

  // Get bettors
  let result = await kv.sscan(`bookies:${eventName}:bettors`, 0);
  let cursor = result[0];
  let fids = result[1];

  while (cursor) {
    result = await kv.sscan(`bookies:${eventName}:bettors`, cursor);
    cursor = result[0];
    fids = fids.concat(result[1]);
  }
  
  console.log(`Bettors: ${fids.length}`);

  // Send in batchs of 100
  let fidIndex = 0;
  let batch = fids.slice(fidIndex, Math.min(100, fids.length));

  // Get usernames
  while (fidIndex < fids.length) {
    await neynarClient.fetchBulkUsers(fids).then((result) => {
      // Appned usernames to the array
      usernames = usernames.concat(result.users.map((user) => user.username));
    })

    fidIndex += batch.length;
    batch = fids.slice(fidIndex, Math.min(100, fids.length));
  }

  console.log(usernames);

  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    const fid = fids[i];

    // Get address from kv
    const addresses = (await kv.sscan(`${fid}:addresses`, 0))[1];

    console.log(`Sending to ${username} (${fid})`);

    for (let j = 0; j < addresses.length; j++) {
      const address = addresses[j];
      console.log(`Sending to ${username} (${fid}) (${address})`);

      // Check if they won
      const bets = (await orderbookie.getBets(address));

      console.log(bets)

      // Send notification
      // neynarClient.publishCast(signerUUID, `${message} \n@${username}`, {replyTo:parentHash})
    }
  }
})();