import { ImageResponse, NextRequest, NextResponse } from 'next/server';

const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {

        const hasClaimed: boolean = req.nextUrl.searchParams.get("hasClaimed") ? "true" === req.nextUrl.searchParams.get("hasClaimed") : false

        return new ImageResponse(
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%',
                height: '100%',
                lineHeight: 1.2,
                background: 'linear-gradient(to top right, orange, purple, orange)',
                justifyContent: 'center',
            }}>
                {!hasClaimed ? 
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <h2 style={{color: 'white', fontSize:40}}> You received 100 <img style={{width: 50, height: 50, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h2>
                        
                    </div>
                :   
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <h2 style={{color: 'white', fontSize: 40}}> You already claimed </h2>
                    <h2 style={{color: 'white', fontSize: 40, marginTop:-10}}> your 100 <img style={{width: 50, height: 50, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h2>
                </div>
                }
            </div>
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
