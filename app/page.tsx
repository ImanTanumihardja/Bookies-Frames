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
  image: `${process.env['HOST']}/superbowl.png`,
  post_url: `${process.env['HOST']}/api/vote`,
});

export const metadata: Metadata = {
  title: 'bookies.xyz',
  description: 'LFG',
  openGraph: {
    title: 'bookies.xyz',
    description: 'LFG', 
    images: [`${process.env['HOST']}/superbowl.png`],
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
