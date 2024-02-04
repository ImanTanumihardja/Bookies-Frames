import { ImageResponse, NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const robotoMono400 = fetch(
            new URL(
              '@fontsource/roboto-mono/files/roboto-mono-latin-700-normal.woff',
              import.meta.url,
            ),
          ).then((res) => res.arrayBuffer());
        
        const buttonIndex = req.nextUrl.searchParams.get("buttonIndex") || "0"

        // Get the poll data from database
        const niners: number = req.nextUrl.searchParams.get("niners") ? parseInt(req.nextUrl.searchParams.get("niners") as string) : 0 
        const chiefs: number = req.nextUrl.searchParams.get("chiefs") ? parseInt(req.nextUrl.searchParams.get("chiefs") as string) : 0
    

        const totalVotes = niners + chiefs

        const ninersPercent = totalVotes ? Math.round(niners / totalVotes * 100) : 0
        const chiefsPercent = totalVotes ? Math.round(chiefs / totalVotes * 100) : 0
        
        const pollData = {
            question: 'Who will win Super Bowl LVIII?',
            options: [{votes: chiefs, 
                      percentOfTotal: chiefsPercent,
                      text: `Chiefs: ${chiefs} votes`},
                      {votes: niners, 
                       percentOfTotal: ninersPercent,
                       text: `49ers: ${niners} votes`},
                    ]
        }

        return new ImageResponse(
            <div style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
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
                    <h2 style={{textAlign: 'center', color: 'white', fontSize: 27, paddingBottom:10, paddingTop:30}}>{pollData.question}</h2>
                    {
                        pollData.options.map((opt, index) => {
                            return (
                                <div key={index} style={{
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
                </div>
                <img style={{
                    width: '50%',
                    height: '80%',
                    display: 'flex',
                }} src={`${process.env['HOST']}/${buttonIndex === "1" ? 'chiefs' : 'niners'}.png`}/>
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
