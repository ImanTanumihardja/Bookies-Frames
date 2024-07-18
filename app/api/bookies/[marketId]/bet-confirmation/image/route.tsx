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
            prompt, 
            transactionHash, 
            isMined} = getRequestProps(req, [
                                            RequestProps.BUTTON_INDEX, 
                                            RequestProps.OPTIONS, 
                                            RequestProps.PROMPT,
                                            RequestProps.TRANSACTION_HASH,
                                            RequestProps.IS_MINED]);

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
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to right, orange, #aa3855, purple)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['HOST']}/icon_transparent.png`} style={{ width: 70, height: 70, position: 'absolute', bottom:5, left:5}}/>
                    <div style={{display: 'flex', flexDirection:'column', height:'100%', width:'100%', justifyContent: 'center', alignItems: 'center'}}>
                        <h1 style={{color: 'white', 
                                    fontSize: text.length > 50 ? 30 : text.length > 40 ? 35 : 45, 
                                    textAlign:'center', 
                                    padding:25}}> 
                                    {text} 
                        </h1>
                    </div>
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
