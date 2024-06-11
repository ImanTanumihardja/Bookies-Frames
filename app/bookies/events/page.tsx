import { Container } from "@chakra-ui/react";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { Accounts, DatabaseKeys } from "../../../src/utils";

export default async function EventsPage() {

    const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

    // Get events from database
    
    let result = await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.EVENTS}`, 0);
    let cursor = result[0];
    let events = result[1];

    while (cursor) {
        result = await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.EVENTS}`, cursor);
        cursor = result[0];
        events = events.concat(result[1]);
    }

    console.log(events);

    return(
        <Container className="font-body"> 
            <h2 className="text-lg md:text-3xl lg:text-5xl font-display font-bold mb-5 mt-10">Events</h2>
        </Container>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';