import { NextRequest, NextResponse } from 'next/server';
import { generateUrl, getFrameMessage } from '../../../src/utils';
import { Frame, getFrameHtml} from "frames.js";
import {ethers} from 'ethers';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, true);

  const {input} = message

  const ethAmount = parseFloat(input);
  console.log(`Transaction ID: ${message.transactionId}`);
  if (message.transactionId) {
    // console.log(`Transaction ID: ${message.transactionId}`);
    const imageUrl = generateUrl(`thumbnails/claim-dice.gif`, {}, true);

    const frame : Frame = {
      version: "vNext",
      buttons: undefined,
      image: imageUrl,
      postUrl: `${process.env['HOST']}/api/send-ether`,
    };

    return new NextResponse(
      getFrameHtml(frame),
      {
        headers: {
          'content-type': 'text/html',
        },
      },
    );}

  const txData = {
      chainId: `eip155:8453`,
      method: 'eth_sendTransaction',
      params: {
        abi: [],
        // data
        to: '0xB97331E86EA4cE364491650e127e096C720dc422',
        value: ethers.parseEther(`${ethAmount}`).toString(), // 0.0001 ETH
      },
    };
    return NextResponse.json(txData);
} 

export async function GET(req: NextRequest): Promise<Response> {
  const imageUrl = generateUrl(`thumbnails/claim-dice.gif`, {}, true);

    const frame : Frame = {
      version: "vNext",
      inputText: 'Amount',
      buttons: [
        {
          label: 'Send Ether', 
          action:'tx',
          target: `${process.env['HOST']}/api/send-ether`
        }
      ],
      image: imageUrl,
      postUrl: `${process.env['HOST']}/api/send-ether`,
    };

  return new NextResponse(
    getFrameHtml(frame),
    {
      headers: {
        'content-type': 'text/html',
      },
    },
  );
}

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
