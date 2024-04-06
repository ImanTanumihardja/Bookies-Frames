import { NextRequest, NextResponse } from 'next/server';
import { ODDS_DECIMALS, getFrameMessage, getRequestProps, RequestProps, PICK_DECIMALS } from '../../../../../src/utils';
import {ethers} from 'ethers';
import orderbookieABI from '../../../../contract-abis/orderBookie';
import erc20ABI from '../../../../contract-abis/erc20';
import { USDC_ADDRESS } from '../../../../addresses';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req);

  const {input} = message

  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

  const {stake, pick, odd: impliedProb, address: orderBookieAddress, transactionHash} = getRequestProps(req, [RequestProps.STAKE, RequestProps.PICK, RequestProps.ODD, RequestProps.ADDRESS, RequestProps.TRANSACTION_HASH]);

  // Check if input is valid amount
  if (!stake || stake < 0 || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake)) {
    throw new Error(`Invalid wager amount STAKE: ${input}`);  
  }

  const txReceipt = await provider.getTransactionReceipt(transactionHash)

  // Check if mind
  if (!txReceipt) {
    throw new Error('Approve transaction is not yet mined');
  }

  console.log('TX RECEIPT: ', txReceipt)

  const DECIMALS = await (new ethers.Contract(USDC_ADDRESS, erc20ABI, provider)).decimals();

  const convertedImpliedProb = ethers.parseUnits(impliedProb.toString(), ODDS_DECIMALS)
  const convertedStake = ethers.parseUnits(stake.toString(), Number(DECIMALS))
  const convertedPick = ethers.parseUnits(pick.toString(), PICK_DECIMALS) 

  console.log('STAKE: ', stake)
  console.log('PICK: ', pick)
  console.log('Implied Probability: ', impliedProb)
  
  const iOrderBookie = new ethers.Interface(orderbookieABI)
  const data = iOrderBookie.encodeFunctionData('placeBet', [convertedPick, convertedStake, convertedImpliedProb])

  console.log(`Orderbookie Address: ${orderBookieAddress}`)

  const txData = {
      chainId: `eip155:10`,
      method: 'eth_sendTransaction',
      attribution: false,
      params: {
        abi: orderbookieABI,
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
