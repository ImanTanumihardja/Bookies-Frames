// Create a script that access kv storage and reset the hasClaimed value
async function fixLeaderboard() {
    // Iteratively fetch all users
    let result = (await kv.zscan("leaderboard", 0, { count: 150 }))
    let cursor = result[0]
    let users = result[1]

    while (cursor) {
        result = (await kv.zscan("leaderboard", cursor, { count: 150 }))
        cursor = result[0]
        users = users.concat(result[1])
    }

    // Filter out every other element
    users = users.filter((_:number, index:number) => index % 2 === 0)

    console.log(`Total users: ${users.length}\n`)

    // users = users.filter((fid:number) => fid === 313859) // Testing

    for (const fid of users) {
        const user = await kv.hgetall(fid)
        if (user === null) {
            console.log(`User: ${fid} does not exist`)
            continue
        }

        // Get score from leaderboard
        const score = await kv.zscore("leaderboard", fid)

        if (parseFloat(user.balance.toString()) !== score) {
            await kv.zadd("leaderboard", {score: user.balance, member: fid}).catch((error:any) => {
                console.error(`Error updating user: ${fid}`, error)
                throw new Error('Error updating user')
            })
                    
            console.log(`User: ${fid} has been updated`)
        }
    }
}

if (require.main === module) {
    fixLeaderboard().then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }

  module.exports = fixLeaderboard