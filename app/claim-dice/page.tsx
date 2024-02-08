import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const frameName = 'claim-dice'

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Claim free Dice!',
    },
  ],
  image: `${process.env['HOST']}/api/frames/claim-dice/image?fid=313859&isFollowing=false&hasClaimed=true&amount=100`,
  post_url: `${process.env['HOST']}/api/frames/${frameName}`
});

export const metadata: Metadata = {
  title: frameName,
  description: 'Claim free Dice if you follow!',
  openGraph: {
    title: frameName,
    description: 'Claim 100 free Dice if you follow!', 
    images: [`${process.env['HOST']}/api/frames/claim-dice/image?fid=313859&isFollowing=false&hasClaimed=true&amount=100`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
