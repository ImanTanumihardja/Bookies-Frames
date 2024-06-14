const dotenv = require("dotenv");

async function notifyDC() {
  const url = 'https://www.degen.tips/api/airdrop2/tip-allowances'

  // Fetch data from url
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Prase json response
  let data = await response.json()

  // Remove all users that have less than 100 tip allowances
  data = data.filter(user => user.tip_allowance >= 100)

  // Pick 50 random users
  const randomUsers = data.sort(() => 0.5 - Math.random()).slice(0, 50)

  // Log the random users' fids
  console.log('Random Users:', randomUsers.map(user => parseInt(user.fid)).toString())  
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