import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, getRequestProps } from '../../../../../../src/utils';
import orderbookieABI from '../../../../../contract-abis/orderbookie';
import { kv } from '@vercel/kv';
import { Bet } from '../../../../../types';
import * as fs from "fs";
import { join } from 'path';
import {ethers} from 'ethers';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        let text='' // Default empty React element
        const {pick, stake, buttonIndex, fid, address: orderBookieAddress, options, result} = getRequestProps(req, [RequestProps.ADDRESS, RequestProps.STAKE, RequestProps.PICK, RequestProps.BUTTON_INDEX, RequestProps.FID, RequestProps.OPTIONS, RequestProps.RESULT]);

        const addresses = await kv.sscan(`${fid}:addresses`, 0)

        const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_PROVIDER_URL);

        const orderBookie = new ethers.Contract(orderBookieAddress, orderbookieABI, provider)

        let bets;
        // go through each address and get the bets
        for (const address of addresses) {
            bets = await orderBookie.getBets(address)
        }

        // Get bets for this event by filtering the bets array for the eventName

        console.log('BETS: ', bets)


        if (buttonIndex === 1) {
            text = 'You rejected the bet!'
        } 
        else if (stake <= -1){
            text =  "You don't have enough dice!"
        }
        else if (pick === -1) {
            text = "Event is closed!"
        }
        else {
            text = "Bet confirmed!"
        }

        const imageResponse = new ImageResponse(
            (
            <div style={{display: 'flex', flexDirection:'row', height:'100%', width:'100%'}}>
                <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '65%',
                        height: '100%',
                        background: 'linear-gradient(to right, orange, #aa3855, purple)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['HOST']}/icon_transparent.png`} style={{ width: 70, height: 70, position: 'absolute', bottom:5, left:5}}/>
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'center', alignItems:'center', padding:25}}> {text} </h1>
                </div>
                <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyItems:'flex-start',
                        width: '35%',
                        height: '100%',
                        background: 'white'}}>
                            <h1 style={{color: 'black', fontSize:35, justifyContent:'center', margin:5, marginTop: 20}}>Your Bets: </h1>
                            <div style={{display: 'flex', flexDirection:'column', alignItems: 'center'}}>
                                {/* {filteredBets.reverse().slice(0, 5).map((bet: Bet, index: number) => { 
                                return (
                                    <h3 key={index} style={{color: 'black', fontSize:30, justifyContent:'center', margin:10, whiteSpace: 'pre'}}>
                                        {options[bet.pick]} | {bet.stake} { result === -1 ? '' : bet.pick === result ? '✅' : '❌'}
                                    </h3>
                                )})} */}
                            </div>
                            {/* {filteredBets.length > 5 ?
                            <h2 style={{color: 'black', fontSize:35, justifyContent:'center', margin:-10}}>. . .</h2>
                            :
                            <div></div>
                            } */}
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
