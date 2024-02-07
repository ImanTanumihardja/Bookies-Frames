import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const frameName = 'sblviii-ml'

const frameMetadata = getFrameMetadata({
  input: {
    text: 'Wager Amount',
  },
  buttons: [
    {
      label: 'Chiefs',
    },
    {
      label: '49ers',
    },
  ],
  image: `${process.env['HOST']}/superbowl.png`,
  post_url: `${process.env['HOST']}/api/frames/events/${frameName}`
});

export const metadata: Metadata = {
  title: frameName,
  description: 'Who will win Superbowl LVIII?',
  openGraph: {
    title: frameName,
    description: 'Who will win Superbowl LVIII?', 
    images: [`${process.env['HOST']}/superbowl.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
