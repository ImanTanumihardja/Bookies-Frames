import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';

const options = ['Over', 'Under']
const imageUrl = generateUrl(`thumbnails/events/${FrameNames.NBA_ASG_OU}.png`, [], false, true)

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
  postUrl: `${process.env['HOST']}/api/frames/${FrameNames.BETSLIP}?eventName=${FrameNames.NBA_ASG_OU}`
};

export const metadata: Metadata = {
  title: FrameNames.NBA_ASG_OU,
  description: 'Over or under 363.5 points?',
  openGraph: {
    title: FrameNames.NBA_ASG_OU,
    description: 'Over or under 363.5 points?', 
    images: [imageUrl],
  },
  other: getFrameFlattened(frame),
};

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
