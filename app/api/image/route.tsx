import { ImageResponse, NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const robotoMono400 = fetch(
            new URL(
              '../../../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff',
              import.meta.url,
            ),
          ).then((res) => res.arrayBuffer());
        
        
        const buttonIndex = req.nextUrl.searchParams.get("buttonIndex") || "0"

        // Get the poll data from database
        const count49ers: number = req.nextUrl.searchParams.get("49ers") ? parseInt(req.nextUrl.searchParams.get("49ers") as string) : 0 
        const countChiefs: number = req.nextUrl.searchParams.get("Chiefs") ? parseInt(req.nextUrl.searchParams.get("Chiefs") as string) : 0
    

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
                }} src={`${process.env['HOST']}/${buttonIndex === "1" ? 'CHIEFS' : 'NINERS'}.png`}></img>
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
