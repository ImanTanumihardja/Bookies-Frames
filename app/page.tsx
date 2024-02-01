import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Chiefs',
    },
    {
      label: '49ers',
    },
  ],
  image: 'https://bookies-frames.vercel.app/superbowl.webp',
  post_url: 'https://bookies-frames.vercel.app/api/frame',
});

export const metadata: Metadata = {
  title: 'bookies.xyz',
  description: 'LFG',
  openGraph: {
    title: 'bookies.xyz',
    description: 'LFG', 
    images: ['https://bookies-frames.vercel.app/superbowl.webp'],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>bookies.xyz</h1>
    </>
  );
}
