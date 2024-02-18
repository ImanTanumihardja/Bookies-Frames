import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';

const options = ['West', 'East']
const imageUrl = generateUrl(`thumbnails/events/${FrameNames.NBA_ASG_ML}.png`, [], false, true)

const frame : Frame = {
  version: "vNext",
  inputText: 'How much do you want to bet?',

  buttons: [
    {
      label: options[0],
      action: 'post',
    },
    {
      label: options[1],
      action: 'post',
    },
  ],
  image: imageUrl,
  postUrl: `${process.env['HOST']}/api/frames/${FrameNames.BETSLIP}?eventName=${FrameNames.NBA_ASG_ML}`
};

export const metadata: Metadata = {
  title: FrameNames.NBA_ASG_ML,
  description: 'Who will win the NBA ASG?',
  openGraph: {
    title: FrameNames.NBA_ASG_ML,
    description: 'Who will win the NBA ASG?', 
    images: [imageUrl],
  },
  other: getFrameFlattened(frame),
};

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
