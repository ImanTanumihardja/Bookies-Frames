import HomeHero from '@components/HomeHero'
import MarketCard from '@components/MarketCard'
import {getAllMarketsAction} from "./actions"
import { VStack, Container } from '@chakra-ui/react'
import { neynarClient } from '@utils'
import { MarketData } from '@types'

export default async function HomePage() {
    // Get all events data
    const allMarkets: Record<string, MarketData> = (await getAllMarketsAction())

    const marketIds: string[] = Object.keys(allMarkets).reverse().slice(0, 5)
    const markets = Object.values(allMarkets).reverse().slice(0, 5)

    return (
      <Container maxW="container.md" p={3} as="main" minH="70vh">
          <HomeHero/>
          <VStack w={'full'} rounded="lg" className="space-y-10 font-inter pt-10" alignItems='center' justifyItems='center'>
            {markets.map(async(market:any, index) => {
              // Get creator user data from neynar
              const profile = (await neynarClient.fetchBulkUsers([market.creator])).users.map((profile:any) => profile)[0]
              const pfpUrl  = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168,h_168/${encodeURI(profile?.pfp_url)}` 
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