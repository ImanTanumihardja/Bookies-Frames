import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, getRequestProps, convertImpliedProbabilityToAmerican, calculatePayout } from '../../../../../../src/utils';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        let {
            pick, 
            stake, 
            odd : impliedProbability, 
            multiplier, 
            streak, 
            balance: availableBalance, 
            poll, 
            prompt, 
            options} 
                = getRequestProps(req, [RequestProps.PICK, 
                                        RequestProps.STAKE, 
                                        RequestProps.ODD,
                                        RequestProps.MULTIPLIER,
                                        RequestProps.STREAK,
                                        RequestProps.BALANCE,
                                        RequestProps.POLL,
                                        RequestProps.PROMPT,
                                        RequestProps.OPTIONS]);
        
        const odd = convertImpliedProbabilityToAmerican(impliedProbability)
        const payout = calculatePayout(multiplier, impliedProbability, stake, streak)

        let pollData = [];
        // Get total votes
        let totalVotes : number = poll.reduce((a:any, b:any) => a + b, 0); 
        if (totalVotes === 0) totalVotes = 1;

        for (let i = 0; i < options.length; i++) {
            const percent = Math.round(Math.min((poll[i] / totalVotes) * 100, 100));
            pollData.push({votes: poll[i], percent:percent, text: `${options[i]}`})
        }

        const imageResponse = new ImageResponse((
            <div style={{display: 'flex', flexDirection:'row', height:'100%', width:'100%'}}>
                <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '65%',
                        height: '100%',
                        background: 'linear-gradient(to right, #68b876, #457e8b, #0000b4)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['HOST']}/icon_transparent.png`} style={{ width: 70, height: 70, position: 'absolute', bottom:5, left:5}}/>
                    <h1 style={{color: 'white', fontSize:55, position:'absolute', top:-10, textDecoration:"underline" }}>Betslip</h1>
                    <h1 style={{color: 'white', fontSize:20, position:'absolute', bottom:-5, right:5, textAlign:'start'}}>Balance: {availableBalance - stake} <img style={{width: 22, height: 22, marginLeft:5, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/> </h1>
                    <div style={{display: 'flex', flexDirection: 'column', width:'100%', alignItems:'center', justifyItems:"center"}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems:'flex-start', justifyItems:"center", padding:10}}> 
                            <h1 style={{color: 'white', fontSize:30, margin:10}}> PICK: {options[pick]}</h1>
                            <h1 style={{color: 'white', fontSize:30, margin:10}}> STAKE: {stake} <img style={{width: 35, height: 35, marginLeft:5, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/></h1>
                            <h1 style={{color: 'white', fontSize:30, margin:10}}> ODDS: {impliedProbability > 0.5 ? '-' : '+'}{odd}</h1>
                            <h1 style={{color: 'white', fontSize:30, margin:10}}> PAYOUT: {payout}<img style={{width: 35, height: 35, marginLeft:5, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/></h1>
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', flexDirection:'column', width:'35%', height:'100%', alignItems:'center', background: 'white'}}>
                    <div style={{display: 'flex', flexDirection:'row', height:'100%', transform: 'scaleY(-1)', bottom:-5}}>
                        {
                            pollData.map((opt, index) => {
                                return (
                                    <div key={index} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginRight: 10,
                                        marginLeft: 10,
                                        background: 'linear-gradient(to top, #68b876, #457e8b, #0000b4)',
                                        borderRadius: 4,
                                        width:'20%',
                                        height: `${Math.min(opt.percent + 18, 100)}%`,
                                        whiteSpace: 'nowrap',
                                        overflow: 'visible',
                                        fontSize: 20,
                                    }}>
                                        <h3 style={{color:'black', top:30, transform: 'rotate(90deg) scaleY(-1)'}}>{`${opt.text + " " + opt.percent}`}%</h3>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <h2 style={{display: 'flex', justifyContent: 'center', textAlign: 'center', color: 'black', fontSize: 27, width:'75%', position:'absolute'}}>{prompt}</h2>
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