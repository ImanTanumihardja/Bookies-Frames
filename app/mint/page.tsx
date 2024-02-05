import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const eventName = 'mint'

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Get 100 Dice',
    },
  ],
  image: `${process.env['HOST']}/superbowl.png`,
  post_url: `${process.env['HOST']}/api/frames/${eventName}?eventName=${eventName}`
});

export const metadata: Metadata = {
  title: eventName,
  description: 'Get 100 Dice free if you follow!',
  openGraph: {
    title: eventName,
    description: 'Get 100 Dice free if you follow!', 
    images: [`${process.env['HOST']}/superbowl.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
