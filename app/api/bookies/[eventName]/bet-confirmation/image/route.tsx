import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { getRequestProps } from '@utils';
import {ODDS_DECIMALS, PICK_DECIMALS, RequestProps } from '@utils/constants';
import {orderBookieABI, erc20ABI} from '@abis';
import { kv } from '@vercel/kv';
import * as fs from "fs";
import { join } from 'path';
import {ethers} from 'ethers';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        let text='' // Default empty React element
        let {buttonIndex, 
            fid, 
            address: orderBookieAddress, 
            options, 
            result, 
            prompt, 
            transactionHash, 
            isMined,
            txFee} = getRequestProps(req, [RequestProps.ADDRESS, 
                                            RequestProps.BUTTON_INDEX, 
                                            RequestProps.FID, 
                                            RequestProps.OPTIONS, 
                                            RequestProps.RESULT, 
                                            RequestProps.PROMPT, 
                                            RequestProps.TRANSACTION_HASH, 
                                            RequestProps.IS_MINED,
                                            RequestProps.TX_FEE]);

        const addresses = (await kv.sscan(`${fid}:addresses`, 0))[1] || [];

        const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

        const orderBookie = new ethers.Contract(orderBookieAddress, orderBookieABI, provider)

        // Get orderBookieInfo
        const orderBookieInfo = await orderBookie.getBookieInfo()

        const acceptedToken = await new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider)
        const decimals = await acceptedToken.decimals();
        const symbol = await acceptedToken.symbol();

        let bets : any[] = [];

        let overallPick = 0;
        let totalPayout = 0;
        let totalUnfilled = 0;
        let totalStaked = 0;
        let totalStakeUsed = 0;

        for (const address of addresses) {
            // Concatenate the bets array with the bets for this address
            bets = bets.concat((await orderBookie.getBets(address)).map((bet: any) => {
                const stake = parseFloat(ethers.formatUnits(bet.stake, decimals))
                const stakeUsed = parseFloat(ethers.formatUnits(bet.stakeUsed, decimals))
                const toWin = parseFloat(ethers.formatUnits(bet.toWin, decimals))
                const toWinFilled = parseFloat(ethers.formatUnits(bet.toWinFilled, decimals))
                const pick = parseInt(ethers.formatUnits(bet.pick, PICK_DECIMALS))

                if (result === -1) {
                    totalStaked += stake;
                    if (overallPick === pick) {
                        totalPayout += (1 - txFee) * toWin + stake;
                    }
                    else {
                        totalPayout -= (1 - txFee) * toWin + stake;
                    }
                }
                else
                {
                    totalStaked += stakeUsed;
                    if (result === pick) { // Calculate the total payout if bet pick is the same as the result
                        if (overallPick === pick) {
                            totalPayout += (1 - txFee) * toWinFilled + stakeUsed;
                        }
                        else {
                            totalPayout -= (1 - txFee) * toWinFilled + stakeUsed;
                        }
                    }
                }

                totalStakeUsed += stakeUsed;

                if (totalPayout <= 0) {
                    // Switch pick
                    totalPayout = Math.abs(totalPayout)
                    overallPick = pick
                }

                // Calculate the total unfilled
                totalUnfilled += stake - stakeUsed;

                return {
                    pick: pick,
                    stake: stake,
                    stakeUsed: stakeUsed,
                    toWin: toWin,
                    toWinUsed: toWinFilled,
                    filledPercent: stake != 0 ? Math.floor(stakeUsed / stake * 100) : 0,
                    odd: ethers.formatUnits(bet.odd, ODDS_DECIMALS),
                    timeStamp: 0,
                    settled: false
                }
            }));
        }

        const filledPercent = totalStakeUsed !== 0 ? Math.floor(totalStakeUsed / totalStaked * 100) : 0;

        // Get bets for this event by filtering the bets array for the eventName
        console.log('BETS: ', bets)


        if (buttonIndex === 1 && !transactionHash) {
            text = 'You rejected the bet!'
        } 
        else if (transactionHash && !isMined) {
            text = "Transaction is pending!"
        }
        else if (transactionHash && isMined) {
            text = "Bet confirmed!"
        }
        else {
            text = prompt
        }

        const imageResponse = new ImageResponse(
            (
            <div style={{display: 'flex', flexDirection:'row', height:'100%', width:'100%'}}>
                <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '35%',
                        height: '100%',
                        background: 'linear-gradient(to right, orange, #aa3855, purple)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['HOST']}/icon_transparent.png`} style={{ width: 70, height: 70, position: 'absolute', bottom:5, left:5}}/>
                    <div style={{display: 'flex', flexDirection:'column', height:'100%', width:'100%', justifyContent: 'center', alignItems: 'center'}}>
                        <h1 style={{color: 'white', 
                                    fontSize: text.length > 50 ? 25 : text.length > 40 ? 30 : 35, 
                                    textAlign:'center', 
                                    padding:25}}> {text} </h1>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    width: '65%',
                    height: '100%',
                    background: 'white',
                    padding: 40}}>
                    {(totalStaked !== 0  || totalUnfilled !== 0) && <h1 style={{color: 'black', fontSize: 25, textAlign:'center', margin:0}}> {result !== -1 ? result === overallPick ? '✅' : '❌' : ''} Overall Pick: {options[overallPick]}</h1>}

                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <h1 style={{color: 'black', fontSize: 35, textAlign:'center', marginBottom: 0, marginLeft:30}}>{totalStaked.toFixed(2)}<img style={{width: 35, height: 35, marginLeft:7, marginTop: 7}}src={`${process.env['HOST']}/${symbol}.png`}/></h1>
                        <h3 style={{color: 'black', fontSize: 20, textAlign:'center', margin: 5}}>Total Stake {result === -1 && `(${filledPercent}% Filled)`}</h3>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <h1 style={{color: 'black', fontSize: 35, textAlign:'center', marginBottom: 0, marginLeft:30}}>{totalPayout.toFixed(2)}<img style={{width: 35, height: 35, marginLeft:7, marginTop: 7}}src={`${process.env['HOST']}/${symbol}.png`}/></h1>
                        <h3 style={{color: 'black', fontSize: 20, textAlign:'center', margin: 5}}>{result === -1 ? 'Potential Payout': 'Total Payout'}</h3>
                    </div>

                    { totalUnfilled !== 0 && result !== -1 && 
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                            <h1 style={{color: 'black', fontSize: 35, textAlign:'center', marginBottom: 0, marginLeft:30}}>{totalUnfilled.toFixed(2)}<img style={{width: 35, height: 35, marginLeft:7, marginTop: 7}}src={`${process.env['HOST']}/${symbol}.png`}/></h1>
                            <h3 style={{color: 'black', fontSize: 20, textAlign:'center', margin: 5}}>Total Unfilled</h3>
                        </div>
                    }
                </div>
            </div>
            ), {
            width: 764, 
            height: 400, 
            fonts: [{ name: 'Plus_Jakarta_Sans_700', data: fontData, weight: 400 }],
            headers:{
                'CDN-Cache-Control': 'public, s-maxage=60',
                'Vercel-CDN-Cache-Control': 'public, s-maxage=60'
            }
        });
        imageResponse.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');

        return imageResponse;
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
