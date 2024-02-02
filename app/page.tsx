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
  description: 'The first non-custiodal sports betting exchange with the vision of democratizing the sports betting experience.',
  openGraph: {
    title: 'bookies.xyz',
    description: 'The first non-custiodal sports betting exchange with the vision of democratizing the sports betting experience.', 
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
