import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';

const imageUrl = generateUrl(`thumbnails/${FrameNames.PROFILE_FINDER}.gif`, [], false, true)

const frame : Frame = {
  version: "vNext",
  buttons: [
    {
      label: 'Search',
      action: 'post',
    },
  ],
  inputText: 'Enter a username',
  image: imageUrl,
  postUrl: `${process.env['HOST']}/api/frames/profile-finder`,
};

export const metadata: Metadata = {
  title: FrameNames.PROFILE_FINDER,
  description: 'Search for a profile!',
  openGraph: {
    title: FrameNames.PROFILE_FINDER,
    description: 'Search for a profile!', 
    images: [imageUrl],
  },
  other: getFrameFlattened(frame),
};

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
