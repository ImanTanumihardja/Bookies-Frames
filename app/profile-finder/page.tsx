import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const frameName = 'profile-finder'

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Find Profile!',
    },
  ],
  image: `${process.env['HOST']}/thumbnail/${frameName}.gif`,
  post_url: `${process.env['HOST']}/api/frames/${frameName}`
});

export const metadata: Metadata = {
  title: frameName,
  description: 'Search for a profile!',
  openGraph: {
    title: frameName,
    description: 'Search for a profile!', 
    images: [`${process.env['HOST']}/thumbnail/${frameName}.gif`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
