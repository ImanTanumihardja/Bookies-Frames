import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames } from '../../src/utils';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Search',
      action: 'post',
    },
  ],
  input: {text: 'Enter a username'},
  image: `${process.env['HOST']}/thumbnails/${FrameNames.PROFILE_FINDER}.gif`,
  post_url: `${process.env['HOST']}/api/frames/profile-finder`,
});

export const metadata: Metadata = {
  title: FrameNames.PROFILE_FINDER,
  description: 'Search for a profile!',
  openGraph: {
    title: FrameNames.PROFILE_FINDER,
    description: 'Search for a profile!', 
    images: [`${process.env['HOST']}/thumbnails/${FrameNames.PROFILE_FINDER}.gif`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
