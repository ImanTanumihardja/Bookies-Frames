import { ImageResponse, NextRequest, NextResponse } from 'next/server';
import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit';
import { kv } from "@vercel/kv";
import { join } from 'path';
import * as fs from "fs";

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf')
let fontData = fs.readFileSync(fontPath)

async function getResponse(req: NextRequest) {
    try {
        const body: FrameRequest = await req.json();
        const { isValid, message } = await getFrameMessage(body);

        if (!isValid) {
            return new NextResponse('Invalid request', { status: 400 });
        }
        
        const buttonIndex = message?.button || 0;
        // Get the poll data from database
        const count49ers: number = await kv.get('49ers') || 0
        const countChiefs: number = await kv.get('Chiefs') || 0

        const totalVotes = count49ers + countChiefs

        const percent49ers = totalVotes ? Math.round(count49ers / totalVotes * 100) : 0
        const percentCheifs = totalVotes ? Math.round(countChiefs / totalVotes * 100) : 0
        
        const pollData = {
            question: 'Who will win Super Bowl LVIII?',
            options: [{votes: countChiefs, 
                      percentOfTotal: percentCheifs,
                      text: `Chiefs: ${countChiefs} votes`},
                      {votes: count49ers, 
                       percentOfTotal: percent49ers,
                       text: `49ers: ${count49ers} votes`},
                    ]
        }

        return new ImageResponse(
            <div style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'flex',
                width: '100%',
                height: '100%',
                lineHeight: 1.2,
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(to right, purple, orange)',
                    width: '50%',
                    height: '100%',
                    padding: 30,
                }}>
                    <h2 style={{textAlign: 'center', color: 'white', fontSize: 27, paddingBottom:10, paddingTop:50}}>{pollData.question}</h2>
                    {
                        pollData.options.map((opt, index) => {
                            return (
                                <div style={{
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    padding: 10,
                                    marginBottom: 10,
                                    borderRadius: 4,
                                    width: `${opt.percentOfTotal}%`,
                                    whiteSpace: 'nowrap',
                                    overflow: 'visible',
                                    fontSize: 20,
                                }}>{opt.text}</div>
                            )
                        })
                    }
                    {/*{showResults ? <h3 style={{color: "darkgray"}}>Total votes: {totalVotes}</h3> : ''}*/}
                </div>
                <img style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '50%',
                    padding: 20,
                }} src={`${process.env['HOST']}/${buttonIndex === 1 ? 'CHIEFS' : 'NINERS'}.png`}></img>
            </div>
            ,
            {
                width: 600, height: 400, fonts: [{
                    data: fontData,
                    name: 'Roboto',
                    style: 'normal',
                    weight: 400
                }]
            })

        // // Convert SVG to PNG using Sharp
        // const pngBuffer = await sharp(Buffer.from(svg))
        //     .toFormat('png')
        //     .toBuffer();

        // return new NextResponse(pngBuffer, {
        //     headers: {
        //         'Content-Type': 'image/png',
        //         'Cache-Control': 'max-age=10'
        //     }
        // });
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export async function Get(req: NextRequest) {
    return getResponse(req);
}

export const runtime = 'edge';
