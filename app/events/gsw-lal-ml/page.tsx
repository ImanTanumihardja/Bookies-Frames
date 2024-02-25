import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FrameNames, RequestProps, generateUrl } from '../../../src/utils';
import { Frame, getFrameFlattened } from 'frames.js';

const options = ['Warriors', 'Lakers']
const imageUrl = generateUrl(`api/frames/${FrameNames.EVENT_THUMBNAIL}/image`, {[RequestProps.EVENT_NAME]: FrameNames.GSW_LAL_ML}, false, true)

const frame : Frame = {
  version: "vNext",
  inputText: 'How much do you want to bet?',

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

export default async function Page() {
  // redirect('https://bookies-rho.vercel.app/');
}
