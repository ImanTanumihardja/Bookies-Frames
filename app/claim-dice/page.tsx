import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../src/utils';
import { getFrameFlattened, Frame } from 'frames.js';import { get } from 'https';

const imageUrl = generateUrl(`thumbnails/${FrameNames.CLAIM_DICE}.gif`, [], false, true)

const frame : Frame = {
  version: "vNext",
  buttons: [
    {
      label: 'Claim Dice',
      action: 'post'
    },
  ],
  image: imageUrl,
  postUrl: `${process.env['HOST']}/api/frames/${FrameNames.CAPTCHA}`
};

export const metadata: Metadata = {
  title: FrameNames.CLAIM_DICE,
  description: 'Claim free Dice!',
  openGraph: {
    title: FrameNames.CLAIM_DICE,
    description: 'Claim free Dice!', 
    images: [{url: imageUrl}],
  },
  other: getFrameFlattened(frame),
};

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
