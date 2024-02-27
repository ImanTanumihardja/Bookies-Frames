import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { FrameNames, RequestProps, generateUrl, getRequestProps } from '../../../../../src/utils';
import { kv } from '@vercel/kv';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

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

        return new ImageResponse(
            <div style={{display:'flex'}}>
                <img src={imageUrl} />
                <h1 style={{color: 'white', fontSize:20, position:'absolute', bottom:-5, right:15, textAlign:'start', textDecoration:'underline'}}>{now > startDate ? 'Event Closed' : `Closes in: ${now}hrs`}</h1>
            </div>
            ,
            {
                width: 764, 
                height: 400, 
                fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
            })
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
export const revalidate = 30;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
