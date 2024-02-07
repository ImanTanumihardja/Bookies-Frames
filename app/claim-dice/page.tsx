import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const frameName = 'claim-dice'

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Claim 100 free Dice!',
    },
  ],
  image: `${process.env['HOST']}/dice.gif`,
  post_url: `${process.env['HOST']}/api/frames/${frameName}`
});

export const metadata: Metadata = {
  title: frameName,
  description: 'Claim 100 free Dice if you follow!',
  openGraph: {
    title: frameName,
    description: 'Claim 100 free Dice if you follow!', 
    images: [`${process.env['HOST']}/dice.gif`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
