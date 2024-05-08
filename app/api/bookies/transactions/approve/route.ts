import { NextRequest, NextResponse } from 'next/server';
import { getFrameMessage, getRequestProps, RequestProps, STAKE_LIMIT } from '../../../../../src/utils';
import {ethers } from 'ethers';
import {erc20ABI} from '../../../../contract-abis/erc20.json';
import { USDC_ADDRESS, DEGEN_ADDRESS } from '../../../../json/addresses.json';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req);

  const {input} = message

  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);
  const decimals = await (new ethers.Contract(DEGEN_ADDRESS, erc20ABI, provider)).decimals();

  const {address: orderBookieAddress } = getRequestProps(req, [RequestProps.ADDRESS]);

  // Check if input is valid amount
  const stake = parseFloat(input);
  if (!stake || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake) || stake > Number.MAX_SAFE_INTEGER || stake < 0) {
    return new Response(JSON.stringify({ message: 'Invalid stake amount' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  if (stake > STAKE_LIMIT) {
    return new Response(JSON.stringify({ message: `Stake amount exceeds ${STAKE_LIMIT} limit` }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  console.log('Approve: ', stake)

  const ierc20 = new ethers.Interface(erc20ABI)

  const data = ierc20.encodeFunctionData('approve', [orderBookieAddress, ethers.parseUnits(stake.toString(), decimals)])

  const txData = {
      chainId: `eip155:8453`,
      method: 'eth_sendTransaction',
      attribution: false,
      params: {
        abi: erc20ABI,
        data: data,
        to: DEGEN_ADDRESS,
        value: ethers.parseEther('0').toString(),
      },
    };
    return NextResponse.json(txData);
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
