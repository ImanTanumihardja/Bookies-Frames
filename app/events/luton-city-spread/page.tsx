import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, RequestProps, generateUrl } from '../../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';
import { Props } from 'next/script';

const options = ["Luton +1.5", "City -1.5"]
const imageUrl = generateUrl(`api/frames/${FrameNames.EVENT_THUMBNAIL}/image`, {[RequestProps.EVENT_NAME]: FrameNames.LUTON_CITY_SPREAD}, true)

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
  postUrl: `${process.env['HOST']}/api/frames/${FrameNames.BETSLIP}?eventName=${FrameNames.LUTON_CITY_SPREAD}`
};

// export async function generateMetadata(
//   { params, searchParams }: Props,
//   parent: ResolvingMetadata
// ): Promise<Metadata> {

// }

export const metadata: Metadata = {
  title: FrameNames.LUTON_CITY_SPREAD,
  description: 'Will Man City win by more or less than 1.5 goals?',
  openGraph: {
    title: FrameNames.LUTON_CITY_SPREAD,
    description: 'Will Man City win by more or less than 1.5 goals?', 
    images: [imageUrl],
  },
  other: getFrameFlattened(frame),
};

export default async function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';