import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import NotFollowing from '../../../../../src/components/NotFollowing';
import { RequestProps, getRequestProps } from '../../../../../src/utils';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

const MAX_QUESTIONS = 10;

export async function GET(req: NextRequest) {
    try {
        const {isFollowing, prompt: question, wins: count, timestamp: timer, losses: strikes} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.PROMPT, RequestProps.WINS, RequestProps.LOSSES]);

        return new ImageResponse(
            <FrameBase>
                {count !== -1 && <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center', margin:35}}> {count}/{MAX_QUESTIONS}</h1>}
                {isFollowing ?
                    count === -1 ?
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center', margin:35}}>Incorrect Answer!</h1>
                    :
                    strikes === 3 ?
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center', margin:35}}>You have reached 3 strikes!</h1>
                    :
                    count === MAX_QUESTIONS ?
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center', margin:35}}>You made it to the end!</h1>
                    :
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center', margin:35}}>{question}</h1>
                    :
                    <NotFollowing/>
                }
            </FrameBase>
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
