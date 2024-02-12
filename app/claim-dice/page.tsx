import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../src/utils';

const imageUrl = generateUrl(`thumbnails/${FrameNames.CLAIM_DICE}.gif`, [], false, true)

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Claim Dice',
    },
  ],
  image: imageUrl,
  post_url: `${process.env['HOST']}/api/frames/${FrameNames.CAPTCHA}`
});

export const metadata: Metadata = {
  title: FrameNames.CLAIM_DICE,
  description: 'Claim free Dice if you follow!',
  openGraph: {
    title: FrameNames.CLAIM_DICE,
    description: 'Claim free Dice if you follow!', 
    images: [imageUrl],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}

export const revalidate = false
