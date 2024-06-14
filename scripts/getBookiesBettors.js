
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})
const { createClient  } = require("@vercel/kv");
import {Accounts, DatabaseKeys} from "@utils/constants"

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

// Create a script that access kv storage and reset the hasClaimed value
async function getBookiesBettors() {

  const bookiesEvents = ["G1-MIN-PHX-ML", "G1-LAC-DAL-ML", "G1-OKC-NO-ML", "G2-DEN-LAL-ML", "G2-NYK-PHI-ML", "G2-MIL-IND-ML", "G2-MIN-PHX-ML", "G2-LAC-DAL-ML", "G2-BOS-MIA-ML", "G2-OKC-NO-ML", "G3-DEN-LAL-ML", "G3-NYK-PHI-ML", "G3-MIL-IND-ML", "G3-LAC-DAL-ML", "G3-MIN-PHX-ML", "G4-CLE-ORL-ML", "G4-OKC-NO-ML", "G4-BOS-MIA-ML", "G4-DEN-LAL-ML", "G4-NYK-PHI-ML", "G4-MIL-IND-ML", "G4-LAC-DAL-ML", "G4-MIN-PHX-ML", "G4-BOS-MIA-SPREAD", "G4-OKC-NO-ML", "G5-DEN-LAL-ML", "G5-DEN-LAL-PROP", "G5-CLE-ORL-ML", "G5-NYK-PHI-PROP", "G5-LAC-DAL-ML", "G5-BOS-MIA-BROWN", "G6-NYK-PHI-ML", "G6-MIL-IND-PROP", "G6-CLE-ORL-ML", "G6-LAC-DAL-PROP", "G1-DEN-MIN-ML", "G1-DEN-MIN-PROP", "G2-DEN-MIN-ML", "G1-NYK-IND-SPREAD", "G1-OKC-DAL-ML", "G1-BOS-CLE-PROP", "REAL-BAY-ML", "G2-NYK-IND-ML", "G2-OKC-DAL-ML", "G2-BOS-CLE-PROP", "G3-DEN-MIN-ML", "G3-NYK-IND-PROP", "G3-DEN-MIN-PROP", "G3-OKC-DAL-ML", "G3-BOS-CLE-SPREAD", "G4-NYK-IND-ML", "G4-DEN-MIN-ML", "UTD-ARS-OU", "NYM-ATL-ML", "G4-OKC-DAL-ML", "G4-BOS-CLE-PROP", "G5-NYK-IND-ML", "G5-DEN-MIN-ML", "G5-OKC-DAL-ML", "G5-BOS-CLE-OU", "G6-DEN-MIN-ML", "G6-NYK-IND-ML", "G6-OKC-DAL-ML", "G7-NYK-IND-ML", "G7-DEN-MIN-ML", "G1-BOS-IND-SPREAD", "G1-MIN-DAL-ML", "G2-BOS-IND-SPREAD", "G2-MIN-DAL-ML", "G3-MIN-DAL-ML", "G4-BOS-IND-SPREAD", "G4-MIN-DAL-ML", "G5-MIN-DAL-ML", "G1-BOS-DAL-ML"]

  let bookiesFIDs = []
  // Go through all the bookies events and get the bettors
  for (const eventName of bookiesEvents) {
    console.log(`Getting bettors for event: ${eventName}`)
    // Get all alea bettors
    let cursor = null
    betsData = (await kv.sscan(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, 0, { count: 150 }))
    cursor = betsData[0]
    bookiesFIDs = bookiesFIDs.concat(betsData[1])

    while (cursor && cursor !== "0") {
      betsData = (await kv.sscan(`${Accounts.BOOKIES}:${eventName}:${DatabaseKeys.BETTORS}`, cursor, { count: 150 }))
      cursor = betsData[0]
      bookiesFIDs = bookiesFIDs.concat(betsData[1])
    }
  }

  // Remove duplicates
  bookiesFIDs = [...new Set(bookiesFIDs)]

  console.log(`Total bettors: ${bookiesFIDs.length}\n`)
  console.log(bookiesFIDs.toString())
}

if (require.main === module) {
  getBookiesBettors().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = getBookiesBettors