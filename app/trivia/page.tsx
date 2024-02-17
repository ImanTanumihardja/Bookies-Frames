import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';

const imageUrl = generateUrl(`thumbnails/trivia.png`, [], false, true)

const frame : Frame = {
  version: "vNext",
  buttons: [
    {
      label: 'Start',
      action: 'post',
    },
  ],
  image: imageUrl,
  postUrl: `${process.env['HOST']}/api/frames/trivia?count=-1`,
};

export const metadata: Metadata = {
  title: FrameNames.TEST,
  description: 'Sports Trivia!',
  openGraph: {
    title: FrameNames.TEST,
    description: 'Sports Trivia!', 
    images: [imageUrl],
  },
  other: getFrameFlattened(frame),
};

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
