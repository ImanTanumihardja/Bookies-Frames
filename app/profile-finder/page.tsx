import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const FRAME_NAME = 'profile-finder'

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Search',
      action: 'post',
    },
  ],
  input: {text: 'Enter a username'},
  image: `${process.env['HOST']}/thumbnails/${FRAME_NAME}.gif`,
  post_url: `${process.env['HOST']}/api/frames/profile-finder`,
});

export const metadata: Metadata = {
  title: FRAME_NAME,
  description: 'Search for a profile!',
  openGraph: {
    title: FRAME_NAME,
    description: 'Search for a profile!', 
    images: [`${process.env['HOST']}/thumbnails/${FRAME_NAME}.gif`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
