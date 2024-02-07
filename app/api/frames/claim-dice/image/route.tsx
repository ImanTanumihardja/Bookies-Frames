import { ImageResponse, NextRequest, NextResponse } from 'next/server';
import BaseFrame from '../../../../../src/components/BaseFrame'

const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {

        // const pfpUrl = await (await fetch('https://searchcaster.xyz/api/profiles?fid=244367')).json().then((data) => data[0].body.avatarUrl)

        const hasClaimed: boolean = req.nextUrl.searchParams.get("hasClaimed") ? "true" === req.nextUrl.searchParams.get("hasClaimed") : false
        const isFollowing: boolean = req.nextUrl.searchParams.get("isFollowing") ? "true" === req.nextUrl.searchParams.get("isFollowing") : false

        return new ImageResponse(
            <BaseFrame>
                    {isFollowing ?
                    !hasClaimed ? 
                    <h2 style={{color: 'white', fontSize:40}}> You received 100 <img style={{width: 50, height: 50, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h2>
                    :
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <h2 style={{color: 'white', fontSize: 40}}> You already claimed </h2>
                        <h2 style={{color: 'white', fontSize: 40, marginTop:-10}}> your 100 <img style={{width: 50, height: 50, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h2>
                    </div>
                    :
                    <h2 style={{color: 'white', fontSize:40}}> You are not following Bookies</h2>
                    }
            </BaseFrame>
            ,
            {
                width: 600, 
                height: 400, 
                fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
            })
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
