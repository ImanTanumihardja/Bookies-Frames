import { ImageResponse, NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const robotoMono400 = fetch(
            new URL(
              '@fontsource/roboto-mono/files/roboto-mono-latin-700-normal.woff',
              import.meta.url,
            ),
          ).then((res) => res.arrayBuffer());

        const hasMinted: boolean = req.nextUrl.searchParams.get("hasMinted") ? "true" === req.nextUrl.searchParams.get("hasMinted") : false

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
                {!hasMinted ? 
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <h2 style={{color: 'white', fontSize: 27}}> You received 100 free 🎲!</h2>
                        
                    </div>
                :   
                    <h2 style={{color: 'white', fontSize: 27, padding: 100}}> You already claimed your 100 free 🎲!</h2>
                }
            </div>
            ,
            {
                width: 600, 
                height: 400, 
                fonts: [{ name: 'Roboto_Mono_400', data: await robotoMono400, weight: 400 }],
            })
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
