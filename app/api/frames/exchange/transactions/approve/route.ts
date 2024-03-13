import { NextRequest, NextResponse } from 'next/server';
import { getFrameMessage } from '../../../../../../src/utils';
import {ethers} from 'ethers';
import IERC20ABI from '../../../../../contracts/IERC20ABI';
import { USDC_ADDRESS } from '../../../../../config';

export async function POST(req: NextRequest): Promise<Response> {
  const provider = new ethers.JsonRpcProvider('https://opt-mainnet.g.alchemy.com/v2/4Hef5Sdtt6yaKhEwtoOWuoaI6Jg80ccr');
  const DECIMALS = await (new ethers.Contract(USDC_ADDRESS, IERC20ABI, provider)).decimals();
  console.log(typeof DECIMALS)
  // Verify the frame request
  const message = await getFrameMessage(req, false);

  const {input} = message

  // Check if input is valid amount
  const stake = parseFloat(input);
  if (!stake || stake < 0 || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake)) {
    throw new Error(`Invalid wager amount STAKE: ${input}`);  
  }

  const ierc20 = new ethers.Interface(IERC20ABI)
  const data = ierc20.encodeFunctionData('approve', ['0x7dcEe2642828fA342fAfA2Bd93b7dF3AE61929E3', BigInt(stake) * BigInt(10) ** DECIMALS])

  console.log(data)

  const txData = {
      chainId: `eip155:10`,
      method: 'eth_sendTransaction',
      params: {
        abi: IERC20ABI,
        data: data,
        to: USDC_ADDRESS,
        // value: ethers.parseEther('0').toString(),
      },
    };
    return NextResponse.json(txData);
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
