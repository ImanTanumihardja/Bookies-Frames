const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const dotenv = require("dotenv");
const {fids, message} = require('./config.json');

async function notifyDC() {
  dotenv.config({ path: ".env"});
  console.log('Fids:', fids)
  console.log('Message:', message)

  // Get the username
  let usernames = [];
  
  // Send in batchs of 100
  let fidIndex = 0;
  let batch = fids.slice(fidIndex, Math.min(100, fids.length));
  
  while (fidIndex < fids.length && batch.length > 0) {
    const neynarClient = new NeynarAPIClient(process.env['NEYNAR_API_KEY'] || "");
    await neynarClient.fetchBulkUsers(batch).then((result) => {
      // Appned usernames to the array
      usernames = usernames.concat(result.users.map((user) => user.username));
    })

    fidIndex += batch.length;
    batch = fids.slice(fidIndex, Math.min(100 + fidIndex, fids.length));
  }

  console.log('Number of Usernames: ', usernames.length);
  console.log('Usernames: ', usernames);

  // Send message to the users
  for (fid of fids) {
    const url = 'https://api.warpcast.com/v2/ext-send-direct-cast';
    const data = {
      recipientFid: fid,
      message: message,
      idempotencyKey: 'ed3d9b95-5eed-475f-9c7d-58bdc3b9ac00'
    };


    await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env['BOOKIES_API_KEY']}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }else {
        console.log('Message sent to user:', fid);
      }
    })
    .catch(error => console.error('There was a problem with your fetch operation:', error));
  }
}

(async () => {if (require.main === module) {
  // Read in cli arguments
  await notifyDC().then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
})();