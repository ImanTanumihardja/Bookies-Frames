import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, RequestProps, generateUrl } from '../../src/utils';
import { getFrameFlattened, Frame } from 'frames.js';import { get } from 'https';

const imageUrl = generateUrl(`api/frames/${FrameNames.LEADERBOARD}/image`, {[RequestProps.OFFSET]: 0}, false)

const frame : Frame = {
  version: "vNext",
  buttons: [{label: '>', action:'post'}],
  image: imageUrl,
  postUrl: `${process.env['HOST']}/api/frames/${FrameNames.LEADERBOARD}?offset=0&count=5`
};

export const metadata: Metadata = {
  title: FrameNames.LEADERBOARD,
  description: 'Leaderboard',
  openGraph: {
    title: FrameNames.CLAIM_DICE,
    description: 'Leaderboard', 
    images: [{url: imageUrl}],
  },
  other: getFrameFlattened(frame),
};

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';