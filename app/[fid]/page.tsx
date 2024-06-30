import { Market } from "@types";
import { DatabaseKeys, formatImpliedProbability, neynarClient, ODDS_DECIMALS, PICK_DECIMALS } from "@utils";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import {orderBookieABI, erc20ABI} from '@abis';
import Profile from "@components/ProfilePage";

export default async function ProfilePage({ params: { fid } }: { params: { fid: number }; }) {
    // Get user data
    const profile = (await neynarClient.fetchBulkUsers([fid])).users.map((profile:any) => profile)[0]

    // Get address associated with fid
    let result = await kv.sscan(`${fid}:${DatabaseKeys.ADDRESSES}`, 0);
    let cursor = result[0];
    let addresses:string[] = result[1] as string[];
    while (cursor && cursor !== '0' && parseFloat(cursor) !== 0) {
        result = await kv.sscan(`${fid}:${DatabaseKeys.ADDRESSES}`, 0);
        cursor = result[0];
        addresses = addresses.concat(result[1] as string[]);
    }

    // Get events from database
    result = await kv.sscan(`${fid}:${DatabaseKeys.BETS}`, 0);
    cursor = result[0];
    let betMarkets:string[] = result[1] as string[];

    while (cursor && cursor !== '0' && parseFloat(cursor) !== 0) {
        result = await kv.sscan(`${fid}:${DatabaseKeys.BETS}`, 0);
        cursor = result[0];
        betMarkets = betMarkets.concat(result[1] as string[]);
    }

    let wins = 0;
    let losses = 0;

    let bets = []
    for (const marketId of betMarkets) {
        const marketData: Market= await kv.hgetall(marketId)

        // Get orderbookie contract
        const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);
        const orderBookie = new ethers.Contract(marketData.address, orderBookieABI, provider)
        const orderBookieInfo = await orderBookie.getBookieInfo()

        const acceptedToken = new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider);
        const decimals = await acceptedToken.decimals();
        const symbol = await acceptedToken.symbol();
        const txFee = parseFloat(orderBookieInfo.txFee)
        const result = parseFloat(ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS))

        for (const address of addresses){
            const marketBets = await orderBookie.getBets(address)

            for (const bet of marketBets) {
                const stake = parseFloat(ethers.formatUnits(bet.stake, decimals))
                const stakeUsed = parseFloat(ethers.formatUnits(bet.stakeUsed, decimals))
                const toWin = parseFloat(ethers.formatUnits(bet.toWin, decimals))
                // const toWinFilled = parseFloat(ethers.formatUnits(bet.toWinFilled, decimals))
                const pick = parseInt(ethers.formatUnits(bet.pick, PICK_DECIMALS))
                const odd = parseFloat(ethers.formatUnits(bet.odd, ODDS_DECIMALS))
    
                const filledPercent = stakeUsed / stake

                const payout = stake + (100 - txFee) * toWin / 100

                if (pick === result) {
                    wins += 1
                } else if (result !== -1) {
                    losses += 1
                }
    
                bets.push({
                    marketId: marketId,
                    prompt: marketData.prompt,
                    winLoss: result !== -1 ? pick === result ? 'W' : 'L' : "---",
                    token: symbol,
                    stake: stake,
                    pick: marketData.options[pick],
                    odd: formatImpliedProbability(odd),
                    payout: payout.toFixed(2),
                    filled: filledPercent * 100,
                    timestamp: parseInt(bet.timestamp)
                })
            }
        }
    }

    // Sorts bets on timestamp
    bets.sort((a, b) => b.timestamp - a.timestamp)

    return (
        <Profile
            user={{
                username: profile.username,
                displayName: profile.display_name,
                pfpUrl: profile.pfp_url,
                address: addresses[0],
                fid: fid,
            }}
            wins={wins}
            losses={losses}
            bets={bets}
        />

    );
}