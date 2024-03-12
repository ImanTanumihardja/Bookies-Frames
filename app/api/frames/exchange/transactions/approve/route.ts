import { NextRequest, NextResponse } from 'next/server';
import { getFrameMessage } from '../../../../../../src/utils';
import {ethers} from 'ethers';
import IERC20ABI from '../../../../../contracts/IERC20ABI';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, true);

  const {input} = message

  // Check if input is valid amount
  const ethAmount = parseFloat(input);
  if (!ethAmount || ethAmount < 0 || Number.isNaN(ethAmount) || typeof ethAmount !== 'number' || !Number.isFinite(ethAmount)) {
    throw new Error(`Invalid wager amount STAKE: ${input}`);  
  }

  const ierc20 = new ethers.Interface(IERC20ABI)
  const data = ierc20.encodeFunctionData('approve', ['0x7dcEe2642828fA342fAfA2Bd93b7dF3AE61929E3', ethers.parseEther(`${ethAmount}`)])

  const txData = {
      chainId: `eip155:10`,
      method: 'approve',
      params: {
        abi: IERC20ABI,
        data: data,
        to: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        value: 0,
      },
    };
    return NextResponse.json(txData);
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
