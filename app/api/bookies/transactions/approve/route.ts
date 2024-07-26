import { NextRequest, NextResponse } from 'next/server';
import { getFrameMessage, getRequestProps } from '@utils';
import { RequestProps, STAKE_LIMIT } from '@utils/constants';
import {ethers } from 'ethers';
import {erc20ABI, orderBookieABI} from '@abis';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req);

  const {input, connectedAddress} = message
  let {address: orderBookieAddress, stake } = getRequestProps(req, [RequestProps.ADDRESS, RequestProps.STAKE]);

  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

  const orderbookie = await new ethers.Contract(orderBookieAddress, orderBookieABI, provider)
  const orderBookieInfo = await orderbookie.getBookieInfo()

  const acceptedToken = await new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider)
  const decimals = await acceptedToken.decimals();

  // Check if input is valid amount
  if (!stake) {
    if (input){
      stake = parseFloat(input);
    }
  }

  if (!stake || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake) || stake > Number.MAX_SAFE_INTEGER || stake < 0) {
    return new Response(JSON.stringify({ message: 'Invalid stake amount' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  if (stake > STAKE_LIMIT) {
    return new Response(JSON.stringify({ message: `Stake amount exceeds ${STAKE_LIMIT} limit` }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // Check if past start date
  const now = new Date().getTime() / 1000;
  if (parseFloat(orderBookieInfo.startDate) < now) {
    return new Response(JSON.stringify({ message: 'Market already closed' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  console.log("Connected Address: " + connectedAddress)

  console.log('Approve: ', stake)

  const data = acceptedToken.interface.encodeFunctionData('approve', [orderBookieAddress, ethers.parseUnits(stake.toString(), decimals)])

  const txData = {
      chainId: `eip155:8453`,
      method: 'eth_sendTransaction',
      attribution: false,
      params: {
        abi: erc20ABI,
        data: data,
        to: orderBookieInfo.acceptedTokenAddress,
        value: ethers.parseEther('0').toString(),
      },
    };
    return NextResponse.json(txData);
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
