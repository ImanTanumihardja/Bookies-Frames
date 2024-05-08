const puppeteer = require('puppeteer-core');
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const dotenv = require("dotenv");
const {fids, message, executablePath, headless, userDataDirPath, profileName} = require('./config.json');

async function notifyDC(browserWSEndpoint="") {
  dotenv.config({ path: ".env"});
  console.log('Fids:', fids)
  console.log('Message:', message)

  // Get the username
  let usernames= [];
  
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

  let browser;
  if (!browserWSEndpoint)
  {
    // Launch the browser
    console.log('Launching browser');
    console.log('Executable Path:', executablePath);
    console.log('Headless:', headless);
    console.log('User Data Dir:', userDataDirPath);
    console.log('Profile Name:', profileName, "\n");
    browser = await puppeteer.launch({executablePath:executablePath, headless:headless, args:[`--user-data-dir=${userDataDirPath}`, `--profile-directory=${profileName}`]});
  }
  else 
  {
    // Connect to the browser
    console.log('Connecting to browser: ', browserWSEndpoint);
    browser = await puppeteer.connect({browserWSEndpoint});
  }

  const page = await browser.newPage();
  
  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    console.log(`Sending to ${username}`);
    // Navigate the page to a URL
    await page.goto(`https://warpcast.com/${username}`);

    // Set screen size
    // await page.setViewport({width: 1080, height: 1024});

    // Check if the button exists
    let dmButton;
    try {
      dmButton = await page.waitForSelector('#root > div > div > div > main > div > div > div.p-4 > div > div > div.flex.flex-row.items-center.justify-between > div.flex.flex-row.gap-1 > button:nth-child(1)', {timeout: 1000});
    }
    catch (error) {
      console.log('Cannot DC');
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
      console.log('Cannot DC');
    }
  }
}

(async () => {if (require.main === module) {
  // Read in cli arguments
  const args = require('minimist')(process.argv.slice(2), {string: ['b']})
  await notifyDC(args['b']).then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
})();