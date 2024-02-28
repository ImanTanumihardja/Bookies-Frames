import type { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, RequestProps, generateUrl } from '../../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';


export async function generateMetadata(
): Promise<Metadata> {
  const options = ["Lakers", "Clippers"]
  const imageUrl = generateUrl(`api/frames/${FrameNames.EVENT_THUMBNAIL}/image`, {[RequestProps.EVENT_NAME]: FrameNames.LAL_LAC_ML}, true)

  const frame : Frame = {
    version: "vNext",
    inputText: 'Amount of dice you want to bet',

    buttons: [
      {
        label: options[0],
        action: 'post',
      },
      {
        label: options[1],
        action: 'post',
      },
    ],
    image: imageUrl,
    postUrl: generateUrl(`${process.env['HOST']}/api/frames/${FrameNames.BETSLIP}`, {[RequestProps.EVENT_NAME]: FrameNames.LAL_LAC_ML}, false),
  };

  const metadata: Metadata = {
    title: FrameNames.LAL_LAC_ML,
    description: 'Lakers vs Clippers',
    openGraph: {
      title: FrameNames.LAL_LAC_ML,
      description: 'Lakers vs Clippers', 
      images: [imageUrl],
    },
    other: getFrameFlattened(frame),
  };

  return metadata
}

export default async function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';