import { NextRequest, NextResponse } from 'next/server';
import { validateFrameMessage, neynarClient, BOOKIES_FID } from '../../../../src/utils';


export async function POST(req: NextRequest): Promise<Response> {
    // Verify the frame request
    // const message = await validateFrameMessage(req);

    // const { fid, button } = message;

    const button = 2
    const fid = 3
  
    const frameName: string = req.nextUrl.pathname.split('/').pop() || "";
  

    // Submit post request to /profile-finder/search
    if (button === 2) {
      return await fetch(`${process.env['HOST']}/api/frames/${frameName}}/search`, req);
    }
    // Submit post request to /profile-finder/profile-page
    else if (button === 1) {
      // Get username from fid
      const username : string = await neynarClient.fetchBulkUsers([fid], {viewerFid: BOOKIES_FID}).then(response => {
        return response?.users[0]?.username || "";
      })
      
      return await fetch(`${process.env['HOST']}/api/frames/${frameName}}/profile-page?username=${encodeURIComponent(username)}`, req);
    }
    else {
      return new NextResponse('Invalid button', { status: 400 });
    }
} 


export const dynamic = 'force-dynamic';
