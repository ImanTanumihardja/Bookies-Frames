import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames } from '../../src/utils';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Claim Dice',
    },
  ],
  image: `${process.env['HOST']}/thumbnails/${FrameNames.CLAIM_DICE}.gif`,
  post_url: `${process.env['HOST']}/api/frames/${FrameNames.CLAIM_DICE}`
});

export const metadata: Metadata = {
  title: FrameNames.CLAIM_DICE,
  description: 'Claim free Dice if you follow!',
  openGraph: {
    title: FrameNames.CLAIM_DICE,
    description: 'Claim free Dice if you follow!', 
    images: [`${process.env['HOST']}/thumbnails/${FrameNames.CLAIM_DICE}.gif`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
