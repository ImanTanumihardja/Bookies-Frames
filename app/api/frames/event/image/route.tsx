import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, generateUrl, getRequestProps } from '../../../../../src/utils';

// Fonts
// const plusJakartaSans = fetch(
//     new URL(
//       '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
//       import.meta.url,
//     ),
//   ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        const {eventName, time:startDate} = getRequestProps(req, [RequestProps.EVENT_NAME, RequestProps.TIME]);

        const now = new Date().getTime();

        // Get hrs and mins till event
        const till = startDate - now;
        const hours = Math.ceil(((till) / (1000 * 60 * 60)) * 10) / 10;

        const imageUrl:string = generateUrl(`thumbnails/events/${eventName}.png`, {}, false)

        let imageResponse =  new ImageResponse(
            <div style={{display:'flex'}}>
                <img src={imageUrl} />
                <h1 style={{color: 'white', fontSize:20, position:'absolute', bottom:-5, right:15, textAlign:'start', textDecoration:'underline'}}>{now > startDate ? `Event Closed` : `Closes in: ${hours} hrs`}</h1>
            </div>
            ,
            {
                width: 764, 
                height: 400, 
                // fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
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
