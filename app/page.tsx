import HomeHero from '@components/HomeHero'
import MarketCard from '@components/MarketCard'
import {getAllEventsAction} from "./actions"
import { VStack } from '@chakra-ui/react'
import { neynarClient } from '@utils'
import { MarketData } from '@types'

export default async function HomePage() {
    // Get all events data
    const events: Record<string, MarketData> = (await getAllEventsAction())

    // Get creators profile 
    const creators = Object.values(events).map((event:any) => event.creator)
    const profiles = (await neynarClient.fetchBulkUsers(creators)).users.map((profile:any) => profile)

    return (
        <div>
          <HomeHero/>
          <VStack w={'full'} rounded="lg" className="space-y-10 font-inter pt-10" alignItems='center' justifyItems='center'>
            {Object.values(events).map(async(event:any, index) => {
              // Get creator user data from neynar
              const profile = profiles[index]
              const pfpUrl  = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/${encodeURI(profile.pfp_url)}` 
              return <MarketCard 
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

        </div>
      );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';