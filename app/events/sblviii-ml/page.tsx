import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { generateImageUrl } from '../../../src/utils';

const frameName = 'sblviii-ml'
const prompt = 'Who will win Superbowl LVIII?'
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
  image: `${process.env['HOST']}/events/${frameName}.png`,
  post_url: `${process.env['HOST']}/api/frames/events/${frameName}`
});

export const metadata: Metadata = {
  title: frameName,
  description: 'Who will win Superbowl LVIII?',
  openGraph: {
    title: frameName,
    description: 'Who will win Superbowl LVIII?', 
    images: [`${process.env['HOST']}/events/${frameName}.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
