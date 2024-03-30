import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { ODDS_DECIMALS, PICK_DECIMALS, RequestProps, getRequestProps } from '../../../../../../src/utils';
import orderbookieABI from '../../../../../contract-abis/orderbookie';
import { kv } from '@vercel/kv';
import BigNumber from "bignumber.js";
import * as fs from "fs";
import { join } from 'path';
import {ethers} from 'ethers';
import { USDC_ADDRESS } from '../../../../../addresses';
import erc20ABI from '../../../../../contract-abis/erc20';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        let text='' // Default empty React element
        const {pick, buttonIndex, fid, address: orderBookieAddress, options, result, prompt, transactionHash, isMined} = getRequestProps(req, [RequestProps.ADDRESS, RequestProps.PICK, RequestProps.BUTTON_INDEX, RequestProps.FID, RequestProps.OPTIONS, RequestProps.RESULT, RequestProps.PROMPT, RequestProps.TRANSACTION_HASH, RequestProps.IS_MINED]);

        const addresses = (await kv.sscan(`${fid}:addresses`, 0))[1] || [];

        const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_PROVIDER_URL);
        const DECIMALS = await (new ethers.Contract(USDC_ADDRESS, erc20ABI, provider)).decimals();

        const orderBookie = new ethers.Contract(orderBookieAddress, orderbookieABI, provider)

        let bets : any[] = [];

        // go through each address and get the bets
        for (const address of addresses) {
            // Concatenate the bets array with the bets for this address
            bets = bets.concat((await orderBookie.getBets(address)).map((bet: any) => {
                const stake = parseFloat(ethers.formatUnits(bet.stake, DECIMALS))
                const stakeUsed = parseFloat(ethers.formatUnits(bet.stakeUsed, DECIMALS))

                return {
                    pick: parseInt(ethers.formatUnits(bet.pick, PICK_DECIMALS)),
                    stake: stake,
                    filledPercent: Math.floor(stakeUsed / stake * 100),
                    odd: ethers.formatUnits(bet.odd, ODDS_DECIMALS),
                    timeStamp: 0,
                    settled: false
                }
            }
            ));
        }

        // Get bets for this event by filtering the bets array for the eventName
        console.log('BETS: ', bets)


        if (buttonIndex === 1 && !transactionHash) {
            text = 'You rejected the bet!'
        } 
        else if (pick === -1) {
            text = "Event is closed!"
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
                    <h1 style={{color: 'white', fontSize: text.length > 50 ? 30 : text.length > 40 ? 35 : 40, justifyContent:'center', alignItems:'center', textAlign:'center', padding:25}}> {text} </h1>
                </div>
                <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyItems:'flex-start',
                        width: '65%',
                        height: '100%',
                        background: 'white'}}>
                            <div style={{display: 'flex', flexDirection:'column', alignItems: 'center', padding:10}}>
                                {bets.reverse().slice(0, 6).map((bet: any, index: number) => { 
                                return (
                                    <h3 key={index} style={{color: 'black', fontSize:30, justifyContent:'center', margin:10, whiteSpace: 'pre'}}>
                                        {options[bet.pick]} | {bet.stake} | {bet.filledPercent}% { result === -1 ? '' : bet.pick === result ? '✅' : '❌'}
                                    </h3>
                                )})}
                            </div>
                            {bets.length > 6 ?
                            <h2 style={{color: 'black', fontSize:35, justifyContent:'center', marginTop: -25}}>. . .</h2>
                            :
                            <div></div>
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

// export const runtime = 'edge';
export const revalidate = 60;
export const dynamic = 'force-dynamic';
