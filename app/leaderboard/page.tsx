import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, RequestProps, generateUrl } from '../../src/utils';
import { getFrameFlattened, Frame } from 'frames.js';import { get } from 'https';

export async function generateMetadata(): Promise<Metadata> {
    const imageUrl = generateUrl(`api/frames/${FrameNames.LEADERBOARD}/image`, {[RequestProps.OFFSET]: 0}, true)

    const frame : Frame = {
      version: "vNext",
      buttons: [{label: '>', action:'post'}],
      image: imageUrl,
      postUrl: generateUrl(`api/frames/${FrameNames.LEADERBOARD}`, {[RequestProps.OFFSET]: 0, [RequestProps.COUNT]:5}, false)
    };
    
    const metadata: Metadata = {
      title: FrameNames.LEADERBOARD,
      description: 'Leaderboard',
      openGraph: {
        title: FrameNames.CLAIM_DICE,
        description: 'Leaderboard', 
        images: [{url: imageUrl}],
      },
      other: getFrameFlattened(frame),
    };

    return metadata
}


export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';