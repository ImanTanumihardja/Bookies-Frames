import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { getRequestProps } from '@utils';
import { RequestProps } from '@utils/constants';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        const {prompt, balance, poll, options, symbol} = getRequestProps(req, [RequestProps.PROMPT, RequestProps.BALANCE, RequestProps.POLL, RequestProps.OPTIONS, RequestProps.SYMBOL]);

        let pollData = [];
        // Get total votes
        let totalVotes : number = poll.reduce((a:any, b:any) => a + b, 0); 
        if (totalVotes === 0) totalVotes = 1;

        for (let i = 0; i < options.length; i++) {
            const percent = Math.round((poll[i] / totalVotes) * 100);
            pollData.push({votes: poll[i], percent:percent, text: `${options[i]}`})
        }

        let balanceString = balance !== null ? balance.toFixed(2): 0;

        let imageResponse =  new ImageResponse(
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
                    <h1 style={{color: 'white', fontSize: prompt.length > 50 ? 30 : prompt.length > 40 ? 40 : 50, justifyContent:'center', alignItems:'center', textAlign:'center', padding:25}}> {prompt} </h1>
                    {balance !== null && <h3 style={{color: 'white', position: 'absolute', bottom: 0, right:20, fontSize: 25, textAlign:'center'}}> <img style={{width: 25, height: 25, marginRight:5, marginTop: 5}}src={`${process.env['HOST']}/${symbol}.png`}/> {balanceString} </h3>}
                    <h1 style={{position:'absolute', color:'white', fontSize:25, top: 0, left:20}}> *Approve Spending TX*</h1>
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
                                        background: 'linear-gradient(to top, orange, #aa3855, purple)',
                                        borderRadius: 4,
                                        width:'20%',
                                        height: `${Math.max(opt.percent, 20)}%`,
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
                </div>
            </div>
            ,
            {
                width: 764, 
                height: 400, 
                fonts: [{ name: 'Plus_Jakarta_Sans_700', data: fontData, weight: 400 }],
                headers:{
                    'CDN-Cache-Control': 'public, s-maxage=60',
                    'Vercel-CDN-Cache-Control': 'public, s-maxage=60'
                }
            })
        
        imageResponse.headers.set('Cache-Control', 'public, s-maxage=60, max-age=60');
        return imageResponse;
        
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

// export const runtime = 'edge';
export const dynamic = 'force-dynamic';
