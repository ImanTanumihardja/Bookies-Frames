import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, getRequestProps } from '../../../../../../src/utils';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }) {
    try {
        const {prompt, balance, time:startDate} = getRequestProps(req, [RequestProps.PROMPT, RequestProps.BALANCE, RequestProps.TIME]);
        const date = new Date(parseInt(startDate.toString()));

        let imageResponse =  new ImageResponse(
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
                    <h1 style={{color: 'white', fontSize:25, position: 'absolute', top: 0, left:20}}> {`(${date.toLocaleDateString()})`} </h1>
                    <h1 style={{color: 'white', fontSize:50, justifyContent:'center', alignItems:'center', textAlign:'center', padding:25}}> {prompt} </h1>
                </div>
                {/* <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent:'center',
                        width: '35%',
                        height: '100%',
                        background: 'white'}}>
                    <h3 style={{color: 'black', fontSize:20, padding:25, textAlign:'center', position:'absolute', top:10}}> Available Balance:</h3>
                    <h3 style={{color: 'black', fontSize:50, padding:25, textAlign:'center'}}> {balance} </h3>
                </div> */}
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
