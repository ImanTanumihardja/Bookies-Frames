import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, getRequestProps, convertImpliedProbabilityToAmerican, DEFAULT_USER, calculatePayout } from '../../../../../src/utils';
import { User, Event } from '../../../../types';
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
        let {isFollowing, fid, prediction, eventName, stake} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.FID, RequestProps.PREDICTION, RequestProps.EVENT_NAME, RequestProps.STAKE]);
        
        let user : User | null = DEFAULT_USER
        let event : Event | null = null

        await Promise.all([kv.hgetall(fid.toString()), kv.hget('events', eventName)]).then( (res) => {
            user = res[0] as User || DEFAULT_USER;
            event = res[1] as Event || null;
          });

        event = event as unknown as Event || null;

        if (event === null) throw new Error('Event not found');
        
        const impliedProbability = event.odds[prediction]
        const odd = convertImpliedProbabilityToAmerican(impliedProbability)
        
        const payout = calculatePayout(event.multiplier, impliedProbability, stake, parseInt(user.streak.toString()))

        let pollData = [];
        // Get total votes
        let totalVotes : number = event.poll.reduce((a, b) => a + b, 0); 
        if (totalVotes === 0) totalVotes = 1;

        for (let i = 0; i < event.odds.length; i++) {
            if (event.odds[i] === 0) continue;

            const percent = Math.round(Math.min((event.poll[i] / totalVotes) * 100, 100));
            pollData.push({votes: event.poll[i], percent:percent, text: `${event.options[i]}`})
        }

        return new ImageResponse((
            <div style={{display: 'flex', flexDirection:'row', height:'100%', width:'100%'}}>
                <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '65%',
                        height: '100%',
                        background: 'linear-gradient(to right, orange, #aa3855, purple)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['HOST']}/Full_logo.png`} style={{ width: 120, height: 40, position: 'absolute', bottom:10, left:10}}/>
                    <h1 style={{color: 'white', fontSize:55, position:'absolute', top:-10, textDecoration:"underline" }}>Betslip</h1>
                    <h1 style={{color: 'white', fontSize:20, position:'absolute', bottom:-5, right:5, textAlign:'start'}}>Available Balance: {user.availableBalance} <img style={{width: 22, height: 22, marginLeft:5, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/> </h1>
                    <div style={{display: 'flex', flexDirection: 'column', width:'100%', alignItems:'center', justifyItems:"center"}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems:'flex-start', justifyItems:"center", padding:10}}> 
                            <h1 style={{color: 'white', fontSize:30, margin:10}}> PICK: {event.options[prediction]}</h1>
                            <h1 style={{color: 'white', fontSize:30, margin:10}}> STAKE: {stake} <img style={{width: 35, height: 35, marginLeft:5, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/></h1>
                            <h1 style={{color: 'white', fontSize:30, margin:10}}> ODDS: +{odd}</h1>
                            <h1 style={{color: 'white', fontSize:30, margin:10}}> PAYOUT: {payout}<img style={{width: 35, height: 35, marginLeft:5, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/></h1>
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', flexDirection:'column', width:'35%', height:'100%', alignItems:'center', background: 'white'}}>
                    <div style={{display: 'flex', flexDirection:'row', height:'100%', transform: 'scaleY(-1)', bottom:-5}}>
                        {
                            pollData.map((opt, index) => {
                                return (
                                    <div key={index} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginRight: 10,
                                        marginLeft: 10,
                                        background: 'linear-gradient(to top, orange, #aa3855, purple)',
                                        borderRadius: 4,
                                        width:'20%',
                                        height: `${Math.min(opt.percent + 5, 100)}%`,
                                        whiteSpace: 'nowrap',
                                        overflow: 'visible',
                                        fontSize: 20,
                                    }}>
                                        <h3 style={{color:'black', top:20, transform: 'rotate(90deg) scaleY(-1)'}}>{`${opt.text + " " + opt.percent}`}%</h3>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <h2 style={{display: 'flex', justifyContent: 'center', textAlign: 'center', color: 'black', fontSize: 27, width:'75%', position:'absolute'}}>{event.prompt}</h2>
                </div>
            </div>
        ), {
            width: 764, 
            height: 400, 
            fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
        });
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
