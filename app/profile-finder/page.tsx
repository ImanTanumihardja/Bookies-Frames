import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../src/utils';

const imageUrl = generateUrl(`thumbnails/${FrameNames.PROFILE_FINDER}.gif`, [], false, true)

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Search',
      action: 'post',
    },
  ],
  input: {text: 'Enter a username'},
  image: imageUrl,
  post_url: `${process.env['HOST']}/api/frames/profile-finder`,
});

export const metadata: Metadata = {
  title: FrameNames.PROFILE_FINDER,
  description: 'Search for a profile!',
  openGraph: {
    title: FrameNames.PROFILE_FINDER,
    description: 'Search for a profile!', 
    images: [imageUrl],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
