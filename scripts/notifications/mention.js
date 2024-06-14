const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const dotenv = require("dotenv");
const {fids, message, parentHash} = require('./config.json');
const fs = require("fs");
const path = require("path");

(async () => {
  dotenv.config({ path: ".env"});
  console.log(fids, message)

  const neynarClient = new NeynarAPIClient(process.env['NEYNAR_API_KEY']);

  let signerUUID = process.env['SIGNER_UUID']

  // Check signer uuid
  if (!signerUUID || (await neynarClient.lookupSigner(signerUUID)).status !== "approved"){
    console.log("SIGNER_UUID is not set in the environment or not valid. Need to generate");

    // Register signer
    const signer = await neynarClient.createSignerAndRegisterSignedKey('fdm', {deadline:Math.floor(Date.now() / 1000) + 31556926});

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

  // Get the username
  let usernames = [];
  
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
    
    neynarClient.publishCast(signerUUID, `${message} \n@${username}`, {replyTo:parentHash})
  }
})();