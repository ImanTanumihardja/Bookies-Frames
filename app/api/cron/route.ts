import { kv } from "@vercel/kv";
import { Accounts, BOOKIES_FID, DatabaseKeys, neynarClient, PICK_DECIMALS } from "../../../src/utils";
import { Event } from "../../types";
import { ethers } from "ethers";
import {OrderBookieABI} from '../../contract-abis/orderBookie.json';
import { payoutNotification } from "../../../src/scripts/notifications/payout_mention";

export async function GET() {
    const BASESCAN_URL = 'https://basescan.org/tx/' 
    const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

    // Get bookies events 
    const bookiesEvents = (await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.EVENTS}`, 0, {count: 149}))[1] as string[];
    console.log(`Active Bookies events: ${bookiesEvents}`);

    if (bookiesEvents.length === 0) {
        return Response.json({ message: 'No events found' });
    }

    // Get all casts from bookies account
    const casts = (await neynarClient.fetchAllCastsCreatedByUser(BOOKIES_FID, {limit: 150}))?.result?.casts;

    if (casts && casts.length === 0) {
        return Response.json({ message: 'No events found' });
    }

    const settledEvents: string[] = [];

    // Check each event is settled if so remove
    for (const eventName of bookiesEvents) {
        const eventInfo: Event | null = await kv.hgetall(eventName);
        if (eventInfo) {
            const orderBookie = new ethers.Contract(eventInfo.address, OrderBookieABI, provider)
            const orderBookieInfo = await orderBookie.getBookieInfo()

            if (parseFloat(ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS)) !== -1) {
                console.log(`Event: ${eventName} is settled`);

                // Find the cast associated with the event
                const cast = casts?.find((cast) => cast.text.includes(eventName));
                const castHash = cast?.hash;

                if (!castHash) {
                    console.error(`Cast not found for event: ${eventName}`);
                    continue;
                }  

                console.log(`Cast found for event: ${eventName} - ${castHash}`);

                // Find payout transaction hash
                const filter = {
                    address: orderBookie.target,
                    fromBlock: 0,
                    toBlock: 'latest'
                };

                const logs = await provider.getLogs(filter);
                const settleTx = logs.find(log => orderBookie.interface.parseLog(log)?.name === 'Settled');

                if (!settleTx) {
                    console.error(`Settled tx not found for event: ${eventName}`);
                    continue;
                }

                const txURL = BASESCAN_URL + settleTx.transactionHash

                console.log(`Payout transaction found for event: ${eventName} - ${txURL}`);

                // Send payout notification
                await payoutNotification(eventName, castHash, txURL);

                // Remove event
                await kv.srem(`${Accounts.BOOKIES}:${DatabaseKeys.EVENTS}`, eventName);
                console.log(`Removed event: ${eventName}`);

                settledEvents.push(eventName);
            }
        }
    }
   
    return Response.json({ message: `Settled events: ${settledEvents.join(', ')}`});
  }

  export const dynamic = 'force-dynamic'
  export const runtime = 'edge';