const puppeteer = require('puppeteer');
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const dotenv = require("dotenv");
const {fids, message, browserWSEndpoint} = require('./config.json');

(async () => {
  dotenv.config({ path: ".env"});
  console.log(fids, message)

  // Get the username
  let usernames= [];
  
  // Send in batchs of 100
  let fidIndex = 0;
  let batch = fids.slice(fidIndex, Math.min(100, fids.length));
  
  while (fidIndex < fids.length) {
    const neynarClient = new NeynarAPIClient(process.env['NEYNAR_API_KEY'] || "");
    await neynarClient.fetchBulkUsers(fids).then((result) => {
      // Appned usernames to the array
      usernames = usernames.concat(result.users.map((user) => user.username));
    })

    fidIndex += batch.length;
    batch = fids.slice(fidIndex, Math.min(100, fids.length));
  }

  console.log(usernames);

  const browser = await puppeteer.connect
  ({
    browserWSEndpoint: browserWSEndpoint,
  });

  const page = await browser.newPage();


  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    console.log(`Sending to ${username}`);
    // Navigate the page to a URL
    await page.goto(`https://warpcast.com/${username}`);

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    // Check if the button exists
    let dmButton;
    try {
      dmButton = await page.waitForSelector('#root > div > div > div > main > div > div > div.p-4 > div > div > div.flex.flex-row.items-center.justify-between > div.flex.flex-row.gap-1 > button:nth-child(1)', {timeout: 1000});
    }
    catch (error) {
      console.log('Button does not exist');
      continue;
    }
    

    if (dmButton) {
      // Click the button if it exists
      await dmButton.click();

      let input;
      try
      {
        input = await page.waitForSelector('.DraftEditor-editorContainer [contenteditable=true]', {timeout: 1000});
      }
      catch (error)
      {
        console.log('Input does not exist');
        continue;
      }
      await input.type(message);

      // Click enter
      await page.keyboard.press('Enter');
    } else {
      // Cannot direct message them
      console.log('Button does not exist');
    }
  }

})();