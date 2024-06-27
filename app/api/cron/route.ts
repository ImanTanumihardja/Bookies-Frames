import { kv } from "@vercel/kv";
import { neynarClient } from "@utils";
import {Accounts, BOOKIES_FID, DatabaseKeys, PICK_DECIMALS} from '@utils/constants'
import { Market } from "../../types";
import { ethers } from "ethers";
import {OrderBookieABI} from '@contract-abis/orderBookie.json';
import { payoutNotification } from "../../../scripts/notifications/payout_mention";
import settleMarket from "@scripts/settleMarket";

export async function GET() {
    const BASESCAN_URL = 'https://basescan.org/tx/' 
    const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

    // Get bookies markets 
    const bookiesMarkets = (await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.MARKETS}`, 0, {count: 149}))[1] as string[];
    console.log(`Active Bookies markets: ${bookiesMarkets}`);

    if (bookiesMarkets.length === 0) {
        return Response.json({ message: 'No markets found' });
    }

    // Get all casts from bookies account
    const casts = (await neynarClient.fetchAllCastsCreatedByUser(BOOKIES_FID, {limit: 150}))?.result?.casts;

    if (casts && casts.length === 0) {
        return Response.json({ message: 'No markets found' });
    }

    const settledMarkets: string[] = [];

    // Check each market is settled if so remove
    for (const marketName of bookiesMarkets) {
        const marketInfo: Market | null = await kv.hgetall(marketName);
        if (marketInfo) {
            const orderBookie = new ethers.Contract(marketInfo.address, OrderBookieABI, provider)
            const orderBookieInfo = await orderBookie.getBookieInfo()

            if (parseFloat(ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS)) !== -1 && marketInfo.result === -1) {
                console.log(`market: ${marketName} is settled`);

                // Find the cast associated with the market
                const cast = casts?.find((cast) => cast.text.includes(marketName));
                const castHash = cast?.hash;

                if (!castHash) {
                    console.error(`Cast not found for market: ${marketName}`);
                    continue;
                }  

                console.log(`Cast found for market: ${marketName} - ${castHash}`);

                // Find payout transaction hash
                const filter = {
                    address: orderBookie.target,
                    fromBlock: 0,
                    toBlock: 'latest'
                };

                const logs = await provider.getLogs(filter);
                const settleTx = logs.find(log => orderBookie.interface.parseLog(log)?.name === 'Settled');

                if (!settleTx) {
                    console.error(`Settled tx not found for market: ${marketName}`);
                    continue;
                }

                const txURL = BASESCAN_URL + settleTx.transactionHash

                console.log(`Payout transaction found for market: ${marketName} - ${txURL}`);

                // Send payout notification
                await payoutNotification(marketName, castHash, txURL);

                // Remove market
                await kv.srem(`${Accounts.BOOKIES}:${DatabaseKeys.MARKETS}`, marketName);
                console.log(`Removed market: ${marketName}`);

                // Settle market
                const result = parseFloat(ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS));
                if (marketInfo.host === Accounts.BOTH) {
                    // Settle alea market
                    await settleMarket(marketName, result);
                }
                else {
                    await kv.hset(marketName, {result: result});
                }

                settledMarkets.push(marketName);
            }
            else {
                console.log(`market: ${marketName} is not yet settled`);
            }
        }
    }
   
    return Response.json({ message: `Settled markets: ${settledMarkets.join(', ')}`});
  }

  export const dynamic = 'force-dynamic'
  export const revalidate = 0;