import HomeHero from '@components/HomeHero'
import MarketCard from '@components/MarketCard'
import {getAllEventsAction} from "./actions"
import { VStack, Container } from '@chakra-ui/react'
import { neynarClient } from '@utils'
import { MarketData } from '@types'

export default async function HomePage() {
    // Get all events data
    const markets: Record<string, MarketData> = (await getAllEventsAction())
    const marketIds: string[] = Object.keys(markets)

     // Get creators profile 
     const creators = Object.values(markets).map((event:any) => event.creator)
     let profiles = []
     if (creators.length != 0){
        profiles = (await neynarClient.fetchBulkUsers(creators)).users.map((profile:any) => profile)
     }

    return (
      <Container maxW="container.md" p={3} marginTop={25} as="main" minH="70vh">
          <HomeHero/>
          <VStack w={'full'} rounded="lg" className="space-y-10 font-inter pt-10" alignItems='center' justifyItems='center'>
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
        </Container>
      );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';