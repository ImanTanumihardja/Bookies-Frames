import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'We love BOAT',
    },
  ],
  image: 'https://zizzamia.xyz/park-1.png',
  post_url: 'https://zizzamia.xyz/api/frame',
});

export const metadata: Metadata = {
  title: 'bookies.xyz',
  description: 'LFG',
  openGraph: {
    title: 'bookies.xyz',
    description: 'LFG',
    images: ['https://zizzamia.xyz/park-1.png'],
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
