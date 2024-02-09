import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const frameName = 'claim-dice'

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Claim Dice',
    },
  ],
  image: `${process.env['HOST']}/thumbnails/${frameName}.gif`,
  post_url: `${process.env['HOST']}/api/frames/${frameName}`
});

export const metadata: Metadata = {
  title: frameName,
  description: 'Claim free Dice if you follow!',
  openGraph: {
    title: frameName,
    description: 'Claim free Dice if you follow!', 
    images: [`${process.env['HOST']}/thumbnails/${frameName}.gif`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
