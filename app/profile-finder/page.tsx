import { FrameMetadataType, getFrameMetadata, getFrameHtmlResponse } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { validateFrameMessage } from '../../src/utils';

const frameName = 'profile-finder'

const frame: FrameMetadataType = {
  buttons: [
    {
      label: 'Find Profile!',
      action: 'post',
    },
  ],
  input: {
    text: 'Username',
  },
  image: `${process.env['HOST']}/thumbnails/${frameName}.gif`,
  post_url: `${process.env['HOST']}/api/frames/${frameName}`
}

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing } = message;

  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";

  return new NextResponse(
    getFrameHtmlResponse(frame)
  );
} 

const frameMetadata = getFrameMetadata(frame);

export const metadata: Metadata = {
  title: frameName,
  description: 'Search for a profile!',
  openGraph: {
    title: frameName,
    description: 'Search for a profile!', 
    images: [`${process.env['HOST']}/thumbnails/${frameName}.gif`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  redirect('https://bookies-rho.vercel.app/');
}
