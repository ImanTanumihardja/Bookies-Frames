import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, generateUrl } from '../../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';

const options = ['Warriors', 'Lakers']
const imageUrl = generateUrl(`thumbnails/events/${FrameNames.GSW_LAL_ML}.png`, [], false, true)

const frame : Frame = {
  version: "vNext",
  inputText: 'How much do Dice you want to bet?',

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
  postUrl: `${process.env['HOST']}/api/frames/${FrameNames.BETSLIP}?eventName=${FrameNames.GSW_LAL_ML}`
};

export const metadata: Metadata = {
  title: FrameNames.GSW_LAL_ML,
  description: 'Warriors vs Lakers 2/22/24 ML',
  openGraph: {
    title: FrameNames.GSW_LAL_ML,
    description: 'Warriors vs Lakers 2/22/24 ML', 
    images: [imageUrl],
  },
  other: getFrameFlattened(frame),
};

export default function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
