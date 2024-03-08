// import { redirect } from 'next/navigation';

// export default function Page() {
//   redirect('https://bookies-rho.vercel.app/');
// }

import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: 'tx',
      label: 'Send Base Sepolia',
      target: `${process.env.HOST}/api/send-ether`,
    },
  ],
  image: {
    src: `${process.env.HOST}/thumbnails/claim-dice.gif`,
    aspectRatio: '1:1',
  },
  postUrl: `${process.env.HOST}/api/frame`,
});

export const metadata: Metadata = {
  title: 'zizzamia.xyz',
  description: 'LFG',
  openGraph: {
    title: 'zizzamia.xyz',
    description: 'LFG',
    images: [`${process.env.HOST}/thumbnails/claim-dice.gif`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>zizzamia.xyz</h1>
    </>
  );
}