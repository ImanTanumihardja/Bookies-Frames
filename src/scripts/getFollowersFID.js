
const dotenv = require("dotenv")
dotenv.config({ path: ".env"})
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");

const target_fid = 391387

// Create a script that access kv storage and reset the hasClaimed value
async function getFollowersFID() {

    const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "");
    
    // Iteratively fetch all users
    let result = (await neynarClient.fetchUserFollowers(target_fid, {limit:150})).result
    
    let fids = result.users.map((follower) => follower.fid)
    let cursor = result.next.cursor

    while (cursor) {
        result = (await neynarClient.fetchUserFollowers(target_fid, {limit:150, cursor})).result
        cursor = result.next.cursor
        fids = fids.concat(result.users.map((follower) => follower.fid))
    }

    console.log(`Total users: ${fids.length}\n`)
    console.log(fids.toString())
    }

if (require.main === module) {
  getFollowersFID().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = getFollowersFID