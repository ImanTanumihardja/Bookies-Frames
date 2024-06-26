import { NextRequest, NextResponse } from 'next/server';
import { getFrameMessage, getRequestProps } from '@utils';
import { ODDS_DECIMALS, RequestProps, PICK_DECIMALS } from '@utils/constants';
import {ethers} from 'ethers';
import {orderBookieABI, erc20ABI} from '@abis';
import { kv } from '@vercel/kv';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req);

  const {fid} = message

  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

  const {stake, pick, odd: impliedProb, address: orderBookieAddress, transactionHash} = getRequestProps(req, [RequestProps.STAKE, RequestProps.PICK, RequestProps.ODD, RequestProps.ADDRESS, RequestProps.TRANSACTION_HASH]);

  // Check if input is valid amount
  if (!stake || stake < 0 || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake)) {
    return new Response(JSON.stringify({ message: 'Invalid stake amount' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const txReceipt = await provider.getTransactionReceipt(transactionHash)

  // Check if approve mined
  if (!txReceipt) {
    return new Response(JSON.stringify({ message: 'Aprrove tx has not yet been mined' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  console.log('Wallet Address: ', txReceipt.from)

  // Add users connect address
  await kv.sadd(`${fid.toString()}:addresses`, txReceipt.from).catch(async (e) => {
    console.log('Error adding address to kv: ', e)
    // Try again
    await kv.sadd(`${fid.toString()}:addresses`, txReceipt.from)
  })

  // Add reverse search
  await kv.hset(txReceipt.from, {"fid": fid.toString()}).catch(async (e) => {
    console.log('Error adding address to kv: ', e)
    // Try again
    await kv.hset(txReceipt.from, {"fid": fid.toString()})
  })

  const orderbookie = await new ethers.Contract(orderBookieAddress, orderBookieABI, provider)
  const orderBookieInfo = await orderbookie.getBookieInfo()

  const acceptedToken = await new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider)
  const decimals = await acceptedToken.decimals();

  const convertedImpliedProb = ethers.parseUnits(impliedProb.toString(), ODDS_DECIMALS)
  const convertedStake = ethers.parseUnits(stake.toString(), Number(decimals))
  const convertedPick = ethers.parseUnits(pick.toString(), PICK_DECIMALS) 

  console.log('STAKE: ', stake)
  console.log('PICK: ', pick)
  console.log('Implied Probability: ', impliedProb)

  const iOrderBookie = orderbookie.interface
  const data = iOrderBookie.encodeFunctionData('placeBet', [convertedPick, convertedStake, convertedImpliedProb])

  const txData = {
      chainId: `eip155:8453`,
      method: 'eth_sendTransaction',
      attribution: false,
      params: {
        abi: orderBookieABI,
        data: data,
        to: orderBookieAddress,
        value: ethers.parseEther('0').toString(),
      },
    };
    return NextResponse.json(txData);
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
