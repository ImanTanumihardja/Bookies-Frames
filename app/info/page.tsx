import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, RequestProps, generateUrl } from '../../src/utils';
import { getFrameFlattened, Frame } from 'frames.js';import { get } from 'https';

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = generateUrl(`thumbnails/${FrameNames.CLAIM_DICE}.gif`, {}, false)

  const frame : Frame = {
    version: "vNext",
    buttons: [{label: 'Learn More', action:'post'}],
    image: imageUrl,
    postUrl: `${process.env['HOST']}/api/frames/${FrameNames.INFO}?index=0`
  };

  return {
    title: FrameNames.INFO,
    description: 'Learn about the Dice Games',
    openGraph: {
      title: FrameNames.INFO,
      description: 'Learn about the Dice Games', 
      images: [{url: imageUrl}],
    },
    other: getFrameFlattened(frame) as Record<string, string>,
  };
} 

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
