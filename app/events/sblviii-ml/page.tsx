import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames } from '../../../src/utils';

const frameName = 'sblviii-ml'
const options = ['Chiefs', '49ers']

const frameMetadata = getFrameMetadata({
  input: {
    text: 'How much do you want to bet?',
  },
  buttons: [
    {
      label: options[0],
    },
    {
      label: options[1],
    },
  ],
  image: `${process.env['HOST']}/thumbnails/events/${FrameNames.SBLVIII_ML}.png`,
  post_url: `${process.env['HOST']}/api/frames/${FrameNames.BETSLIP}?eventName=${FrameNames.SBLVIII_ML}`
});

export const metadata: Metadata = {
  title: frameName,
  description: 'Who will win Superbowl LVIII?',
  openGraph: {
    title: frameName,
    description: 'Who will win Superbowl LVIII?', 
    images: [`${process.env['HOST']}/thumbnails/events/${FrameNames.SBLVIII_ML}.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
