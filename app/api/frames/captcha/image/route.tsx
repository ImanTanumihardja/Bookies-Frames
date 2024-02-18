import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import { Plus_Jakarta_Sans } from 'next/font/google'


const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    display: 'swap',
    weight: ["700"],
  })

export async function GET(req: NextRequest) {
    try {
        const image = req.nextUrl.searchParams.get('image')
        return new ImageResponse(
            <FrameBase>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <h2 style={{color: 'white', fontSize:50, justifyContent:'center', alignItems:'center', textAlign:'center'}}>Click the matching image</h2>
                    <h1 style={{color: 'white', fontSize:100, justifyContent:'center', alignItems:'center', }}>{image}</h1>
                    <h2 style={{color: 'white', fontSize:20, justifyContent:'center', alignItems:'center', textAlign:'center'}}>Need to make sure you are not a bot!</h2>
                </div>
            </FrameBase>
            ,
            {
                width: 764, 
                height: 400, 
                // fonts: [{ name: 'Plus_Jakarta_Sans_700', data: plusJakartaSans, weight: 400 }],
            })
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
