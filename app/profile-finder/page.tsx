import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST (req: NextRequest): Promise<NextResponse> {
    return new NextResponse(
      'Test',
    );
}

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = generateUrl(`thumbnails/${FrameNames.PROFILE_FINDER}.gif`, [], false)

  const frame : Frame = {
    version: "vNext",
    buttons: [
      {
        label: 'Search',
        action: 'post',
      },
    ],
    inputText: 'Enter a username or fid',
    image: imageUrl,
    postUrl: `${process.env['HOST']}/api/frames/profile-finder?fid=&index=-1&array=&boolean=false`,
  };

  return {
    title: FrameNames.PROFILE_FINDER,
    description: 'Search for a profile!',
    openGraph: {
      title: FrameNames.PROFILE_FINDER,
      description: 'Search for a profile!', 
      images: [imageUrl],
    },
    other: getFrameFlattened(frame),
  };
}
export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
