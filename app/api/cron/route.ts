import { kv } from "@vercel/kv";
import { Accounts, DatabaseKeys } from "../../../src/utils";
import { Event } from "../../types";

export async function GET() {
    // Get bookies events 
    const bookiesEvents = (await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.EVENTS}`, 0, {count: 150}))[1] as string[];

    // Check each event is settled if so remove
    for (const eventName of bookiesEvents) {
        const eventInfo: Event | null = await kv.hgetall(eventName);
        if (eventInfo && eventInfo.startDate < Date.now() / 1000) {
            await kv.srem(`${Accounts.BOOKIES}:${DatabaseKeys.EVENTS}`, eventName);
            console.log(`Removed event: ${eventName}`);
        }
    }
   
    return Response.json({ message: 'Cron job ran successfully'});
  }