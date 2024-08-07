import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { calculatePayout, getRequestProps } from '@utils';
import { RequestProps } from '@utils/constants';
import { kv } from '@vercel/kv';
import { Bet } from '@types';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }) {
    try {
        let text='' // Default empty React element
        const {buttonIndex, fid, options, result, odds, prompt, startDate} = getRequestProps(req, [RequestProps.BUTTON_INDEX, RequestProps.FID, RequestProps.OPTIONS, RequestProps.RESULT, RequestProps.ODDS, RequestProps.PROMPT, RequestProps.TIME]);

        // Get bets for this event by filtering the bets array for the eventName
        const bets : Record<string, Bet[]> = (await kv.hget(fid?.toString(), 'bets') || {});

        // Ensure bets is an array before calling filter
        const filteredBets : Bet[] = bets[eventName] || []

        console.log('BETS: ', filteredBets)

        if (filteredBets === null) throw new Error('Bets not found');

        if (buttonIndex === 1 && startDate <= (new Date()).getTime() / 1000) {
            text = 'You rejected the bet!'
        } 
        else if (buttonIndex === 0 && startDate <= (new Date()).getTime() / 1000){
            text = "Bet confirmed!"
        }
        else {
            text = prompt
        }

        // Process Bets
        let totalPayout = 0;
        let totalStaked = 0;
        let overallPick = 0;

        for (const bet of filteredBets) {
            totalStaked += bet.stake;

            const payout = calculatePayout(odds[bet.pick], bet.stake);
            // Calculate the total payout if bet pick is the same as the result
            if (result === -1) {
                if (overallPick === bet.pick) {
                    totalPayout += payout;
                }
                else {
                    totalPayout -= payout;
                }
            }
            else {
                if (result === bet.pick) {
                    if (overallPick === bet.pick) {
                        totalPayout += payout;
                    }
                    else {
                        totalPayout -= payout;
                    }
                }
            }
            
            if (totalPayout < 0) {
                // Switch pick
                totalPayout = Math.abs(totalPayout)
                overallPick = bet.pick
            }
        }

        const imageResponse = new ImageResponse(
            (
            <div style={{display: 'flex', flexDirection:'row', height:'100%', width:'100%'}}>
                <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '35%',
                        height: '100%',
                        background: 'linear-gradient(to right, #68b876, #457e8b, #0000b4)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['NEXT_PUBLIC_HOST']}/icon_transparent.png`} style={{ width: 70, height: 70, position: 'absolute', bottom:5, left:5}}/>
                    <h1 style={{color: 'white', fontSize: text.length > 50 ? 25 : text.length > 40 ? 30 : 35, justifyContent:'center', alignItems:'center', textAlign:'center', padding:25, bottom:10}}> {text} </h1>
                    <h2 style={{color: 'white', fontSize: 15, position: 'absolute', top:0, textAlign:'center'}}>*Recast for a 10% loss rebate*</h2>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '65%',
                    height: '100%',
                    background: 'white',
                    padding: 10}}>
                    {totalStaked !== 0 && <h1 style={{color: 'black', fontSize: 25, textAlign:'center', margin:0}}> {result !== -1 ? result === overallPick ? '✅' : '❌' : ''} Overall Pick: {options[overallPick]} </h1>}

                    <h1 style={{color: 'black', fontSize: 45, textAlign:'center', marginBottom: 0, marginLeft:30}}>{totalStaked.toFixed(2)}<img style={{width: 40, height: 40, marginTop: 10, marginLeft:10, marginRight:10}} src={`${process.env['NEXT_PUBLIC_HOST']}/dice.png`}/></h1>
                    <h3 style={{color: 'black', fontSize: 25, textAlign:'center'}}>Total Stake</h3>

                    <h1 style={{color: 'black', fontSize: 45, textAlign:'center', marginBottom: 0, marginLeft:30}}>{totalPayout.toFixed(2)}<img style={{width: 40, height: 40, marginTop: 10, marginLeft:10, marginRight:10}} src={`${process.env['NEXT_PUBLIC_HOST']}/dice.png`}/></h1>
                    <h3 style={{color: 'black', fontSize: 25, textAlign:'center'}}>{result === -1 ? 'Potential Payout': 'Total Payout'}</h3>
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
