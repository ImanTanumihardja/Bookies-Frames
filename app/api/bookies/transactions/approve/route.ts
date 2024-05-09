import { NextRequest, NextResponse } from 'next/server';
import { getFrameMessage, getRequestProps, RequestProps, STAKE_LIMIT } from '../../../../../src/utils';
import {ethers } from 'ethers';
import {erc20ABI} from '../../../../contract-abis/erc20.json';
import { OrderBookieABI } from "../../../../../app/contract-abis/orderBookie.json";

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req);

  const {input, connectedAddress} = message
  const {address: orderBookieAddress } = getRequestProps(req, [RequestProps.ADDRESS]);

  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

  const orderbookie = await new ethers.Contract(orderBookieAddress, OrderBookieABI, provider)
  const orderBookieInfo = await orderbookie.getBookieInfo()

  const acceptedToken = await new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider)
  const decimals = await acceptedToken.decimals();

  // Check if input is valid amount
  const stake = parseFloat(input);
  if (!stake || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake) || stake > Number.MAX_SAFE_INTEGER || stake < 0) {
    return new Response(JSON.stringify({ message: 'Invalid stake amount' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  if (stake > STAKE_LIMIT) {
    return new Response(JSON.stringify({ message: `Stake amount exceeds ${STAKE_LIMIT} limit` }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // Check balance
  const balance = await acceptedToken.balanceOf(connectedAddress)
  if (balance < ethers.parseUnits(stake.toString(), decimals)) {
    return new Response(JSON.stringify({ message: 'Insufficient balance' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

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
