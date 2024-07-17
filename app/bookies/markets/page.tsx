import { VStack, Container } from "@chakra-ui/react";
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
        <Container maxW="container.md" paddingX={5} as="main" minH="70vh" alignItems='center' justifyItems='center'> 
            <h1 className="font-semibold font-inherit sm:text-56xl text-8xl text-white text-center flex flex-wrap justify-center items-center my-5">
                <span className="inline-block flex-shrink-0 text-transparent !bg-clip-text [background:linear-gradient(90deg,_#feae26,_#d44fc9_49.5%,_#7a65ec)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                    Bookies
                </span>
                &nbsp;
                <span className="inline-block flex-shrink-0">
                    Markets
                </span>
            </h1>
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
        </Container>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';