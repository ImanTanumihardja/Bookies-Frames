import { VStack } from "@chakra-ui/react";
import MarketCard from "@components/MarketCard";
import { MarketData } from "@types";
import { neynarClient } from "@utils";
import { getAllEventsAction } from "app/actions";


export default async function MarketsPage() {
    // Get all events data
    const markets: Record<string, MarketData> = await getAllEventsAction();
    const marketIds: string[] = Object.keys(markets)

     // Get creators profile 
     const creators = Object.values(markets).map((event:any) => event.creator)
     let profiles = []
     if (creators.length != 0){
        profiles = (await neynarClient.fetchBulkUsers(creators)).users.map((profile:any) => profile)
     }


    return(
        <VStack w={'full'} rounded="lg" className="space-y-10 font-inter" alignItems='center' justifyItems='center'> 
            <div className="font-semibold font-inherit text-56xl text-white flex items-baseline">
                <h1 className="inline-block flex-shrink-0 text-transparent !bg-clip-text [background:linear-gradient(90deg,_#feae26,_#d44fc9_49.5%,_#7a65ec)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"> Bookies </h1> 
                <h1> &nbsp; Markets</h1>
            </div>
            <VStack gap={5}>
                {Object.values(markets).map(async(event:any, index) => {
                    // Get creator user data from neynar
                    const profile = profiles[index]
                    const pfpUrl  = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/${encodeURI(profile.pfp_url)}` 
                    return <MarketCard 
                            marketId={marketIds[index]}
                            key={index} 
                            prompt={event?.prompt} 
                            options={event?.options}
                            startDate={event?.startDate}
                            creator={profile?.username}
                            pfp={pfpUrl}
                            outcome1Staked={event?.orderBookieInfo.totalStakedOutcome1}
                            outcome2Staked={event?.orderBookieInfo.totalStakedOutcome2}
                            totalStaked={event?.orderBookieInfo.totalStakedOutcome1 + event?.orderBookieInfo.totalStakedOutcome2}
                            numBettors={event.orderBookieInfo.bettors.length}/>
                })}
            </VStack>
        </VStack>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';