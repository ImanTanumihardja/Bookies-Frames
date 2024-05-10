import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, getRequestProps, convertImpliedProbabilityToAmerican, calculatePayout } from '../../../../../../src/utils';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }) {
    try {
        let {
            pick, 
            stake, 
            odd : impliedProbability, 
            poll, 
            options} 
                = getRequestProps(req, [RequestProps.PICK, 
                                        RequestProps.STAKE, 
                                        RequestProps.ODD,
                                        RequestProps.OPTIONS]);
        
        const odd = convertImpliedProbabilityToAmerican(impliedProbability)

        // Round payout to 2 decimal places
        const payout = calculatePayout(impliedProbability, stake).toFixed(2);

        const imageResponse = new ImageResponse((
            <div style={{display: 'flex', flexDirection:'row', height:'100%', width:'100%'}}>
                <div style={{
                        display: 'flex',
                        flexDirection:'row',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to right, orange, #aa3855, purple)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['HOST']}/icon_transparent.png`} style={{ width: 70, height: 70, position: 'absolute', bottom:5, left:5}}/>
                    <h1 style={{color: 'white', fontSize:55, position:'absolute', top:-10, left:20 }}>Betslip</h1>
                    <div style={{display: 'flex', width:'50%', height:'70%', top:20, flexDirection: 'column', alignSelf:'center', alignItems:'flex-start', flexWrap: 'wrap', padding:10}}> 
                        <h1 style={{color: 'white', fontSize:40, margin:15, marginRight:10, textDecoration:'underline'}}> Pick:</h1>
                        <h1 style={{color: 'white', fontSize:40, margin:15, marginRight:10, textDecoration:'underline'}}> Stake:</h1>
                        <h1 style={{color: 'white', fontSize:40, margin:15, marginRight:10, textDecoration:'underline'}}> Payout:</h1>

                        <h1 style={{color: 'white', fontSize:40, margin:15}}>{options[pick]}</h1>
                        <h1 style={{color: 'white', fontSize:40, margin:15}}>{stake.toFixed(2)} <img style={{width: 42, height: 42, marginLeft:5, marginTop: 5}}src={`${process.env['HOST']}/degen.png`}/></h1>
                        <h1 style={{color: 'white', fontSize:40, margin:15}}>{payout} <img style={{width: 42, height: 42, marginLeft:5, marginTop: 5}}src={`${process.env['HOST']}/degen.png`}/></h1>
                    </div>
                    <h1 style={{position:'absolute', color: 'white', fontSize:25, margin:10, bottom:10, right: 10}}> Odds: {impliedProbability > 0.5 ? '-' : '+'}{odd}</h1>
                    <h1 style={{position:'absolute', color: 'white', fontSize:25, margin:10, top:10, right: 10}}> *Confirm Bet TX*</h1>
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
        imageResponse.headers.set('Cache-Control', 'public, s-maxage=60, max-age=60');
        return imageResponse;
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

// export const runtime = 'edge';
export const dynamic = 'force-dynamic';