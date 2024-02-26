import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';

const imageUrl = generateUrl(`thumbnails/${FrameNames.TRIVIA}.png`, [], false)
const questionIndexes = encodeURIComponent([0, 1, 2, 3, 4, 5, 6, 7].toString()) // Make sure matchs with the amount of questions in easy category

const frame : Frame = {
  version: "vNext",
  buttons: [
    {
      label: 'Start',
      action: 'post',
    },
  ],
  image: imageUrl,
  postUrl: `${process.env['HOST']}/api/frames/${FrameNames.TRIVIA}?count=-1&array=${questionIndexes}`,
};

export const metadata: Metadata = {
  title: FrameNames.TRIVIA,
  description: 'Sports Trivia!',
  openGraph: {
    title: FrameNames.TRIVIA,
    description: 'Sports Trivia!', 
    images: [imageUrl],
  },
  other: getFrameFlattened(frame),
};

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
