import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { FrameNames, RequestProps, generateUrl, getRequestProps } from '../../../../../src/utils';
import { kv } from '@vercel/kv';
import { headers } from 'next/headers';
import satori from "satori";
import sharp from 'sharp';

// Fonts
// const plusJakartaSans = fetch(
//     new URL(
//       '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
//       import.meta.url,
//     ),
//   ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        const {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);
        const startDate : number | null = await kv.hget(eventName, 'startDate')

        if (startDate === null) throw new Error('Event not found');

        const now = new Date().getTime();

        // Get hrs and mins till event
        const till = startDate - now;
        const hours = Math.round(((till) / (1000 * 60 * 60)));

        const imageUrl:string = generateUrl(`thumbnails/events/${eventName}.png`, [], false)

        const svg = await satori(
            <div style={{display:'flex'}}>
                <img src={imageUrl} />
                <h1 style={{color: 'white', fontSize:20, position:'absolute', bottom:-5, right:15, textAlign:'start', textDecoration:'underline'}}>{now > startDate ? 'Event Closed' : `Closes in: ${now}hrs`}</h1>
            </div>
            ,
            {
                width: 764, 
                height: 400, 
                fonts: [],
            }
        )

         // Convert SVG to PNG using Sharp
         const pngBuffer = await sharp(Buffer.from(svg))
         .toFormat('png')
         .toBuffer();

        return new NextResponse(pngBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, s-maxage=0, max-age=0',
                'CDN-Cache-Control': 'public, s-maxage=0',
                'Vercel-CDN-Cache-Control': 'public, s-maxage=0'
            }
        });

        // return new ImageResponse(
        //     <div style={{display:'flex'}}>
        //         <img src={imageUrl} />
        //         <h1 style={{color: 'white', fontSize:20, position:'absolute', bottom:-5, right:15, textAlign:'start', textDecoration:'underline'}}>{now > startDate ? 'Event Closed' : `Closes in: ${now}hrs`}</h1>
        //     </div>
        //     ,
        //     {
        //         width: 764, 
        //         height: 400, 
        //         fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
        //         headers:{
        //             'Cache-Control': 'public, s-maxage=0, max-age=0',
        //             'CDN-Cache-Control': 'public, s-maxage=0',
        //             'Vercel-CDN-Cache-Control': 'public, s-maxage=0'
        //         }
        //     })
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
