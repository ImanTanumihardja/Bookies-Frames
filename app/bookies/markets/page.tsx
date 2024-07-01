import { VStack } from "@chakra-ui/react";
import MarketCard from "@components/MarketCard";
import { MarketData } from "@types";
import { neynarClient } from "@utils";
import { getAllMarketsAction } from "app/actions";


export default async function MarketsPage() {
    // Get all events data
    const allMarkets: Record<string, MarketData> = await getAllMarketsAction();

    const marketIds: string[] = Object.keys(allMarkets).reverse().slice(0, 10)
    const markets = Object.values(allMarkets).reverse().slice(0, 10)

    return(
        <VStack w={'full'} rounded="lg" className="space-y-10 font-inter" alignItems='center' justifyItems='center'> 
            <div className="font-semibold font-inherit text-56xl text-white flex items-baseline">
                <h1 className="inline-block flex-shrink-0 text-transparent !bg-clip-text [background:linear-gradient(90deg,_#feae26,_#d44fc9_49.5%,_#7a65ec)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"> Bookies </h1> 
                <h1> &nbsp; Markets</h1>
            </div>
            <VStack gap={5}>
                {Object.values(markets).map(async(market:any, index) => {
                    // Get creator user data from neynar
                    const profile = (await neynarClient.fetchBulkUsers([market.creator])).users.map((profile:any) => profile)[0]
                    const pfpUrl  = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168,h_168/${encodeURI(profile.pfp_url)}` 
                    return <MarketCard 
                            marketId={marketIds[index]}
                            key={index} 
                            prompt={market?.prompt} 
                            options={market?.options}
                            startDate={market?.startDate}
                            creator={{
                                username: profile?.username,
                                displayName: profile?.display_name,
                                pfpUrl: pfpUrl,
                                address: '',
                                fid: 0
                            }}
                            outcome1Staked={market?.orderBookieInfo.totalStakedOutcome1}
                            outcome2Staked={market?.orderBookieInfo.totalStakedOutcome2}
                            totalStaked={market?.orderBookieInfo.totalStakedOutcome1 + market?.orderBookieInfo.totalStakedOutcome2}
                            numBettors={market.orderBookieInfo.bettors.length}/>
                })}
            </VStack>
        </VStack>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';