import { ImageResponse, NextRequest, NextResponse } from 'next/server';
import FrameBase from '../../../../../src/components/FrameBase'
import { RequestProps, getRequestProps, plusJakartaSans } from '../../../../../src/utils';

export async function GET(req: NextRequest) {
    try {
        const {isFollowing, hasClaimed} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.HAS_CLAIMED]);

        return new ImageResponse(
            <FrameBase>
                    {isFollowing ?
                    !hasClaimed ? 
                    <h1 style={{color: 'white', fontSize:40}}> You received 100 <img style={{width: 50, height: 50, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h1>
                    :
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <h1 style={{color: 'white'}}> You already claimed </h1>
                        <h1 style={{color: 'white', marginTop:-10}}> your free <img style={{width: 50, height: 50, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h1>
                    </div>
                    :
                    <h2 style={{color: 'white', fontSize:40}}> You are not following Bookies</h2>
                    }
            </FrameBase>
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
