import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import { kv } from "@vercel/kv";
import { User } from '../../../../types';
import { RequestProps, getRequestProps, DEFAULT_USER } from '../../../../../src/utils';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        return new ImageResponse(
            <FrameBase>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'white' }}>
                    <h1 style={{ fontFamily: 'Plus_Jakarta_Sans_700', fontSize: '48px' }}>Profile Finder</h1>
                    <p style={{ fontFamily: 'Plus_Jakarta_Sans_700', fontSize: '24px' }}>Search for a profile!</p>
                </div>
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
