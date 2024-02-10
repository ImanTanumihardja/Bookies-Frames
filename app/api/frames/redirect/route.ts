import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { DEFAULT_USER, generateImageUrl, RequestProps, validateFrameMessage, neynarClient, BOOKIES_FID } from '../../../../src/utils';
import { User } from '../../../types';
import { kv } from '@vercel/kv';


export async function POST(req: NextRequest): Promise<Response> {
    // Verify the frame request
    // const message = await validateFrameMessage(req);

    // const { fid, button } = message;

    const button = 1
    const fid = 3
  
    // const frameName: string = req.nextUrl.pathname.split('/').pop() || "";
  

    // Submit post request to /profile-finder/search
    if (button === 1) {
      // Verify the frame request
      const message = await validateFrameMessage(req);

      const {followingBookies: isFollowing } = message;

      const frameName: string = req.nextUrl.pathname.split('/').pop() || "";

      // Check for fid prop in url and if there use that as fid
      const username : string = (req.nextUrl.searchParams.get("username") || message?.input || "emmaniii").toLowerCase();

      if (!username || username === "") {
        return new NextResponse('No username provided', { status: 400 });
      }

      let profile: any = null;
      let imageUrl: string = "";
      let user : User = DEFAULT_USER;
      let rank : number = -1;

      await neynarClient.searchUser(username, BOOKIES_FID).then( (res) => {
        const users = res?.result?.users;
        profile = users?.length > 0 ? users[0] : null;
      })
      .catch ( (error) => {
        console.error(error);
        profile = null;
      })
      .finally(async () => {
          if (profile !== null) {
            rank = await kv.zrank('users', profile?.fid || "") || -1
            
            // Can skip if not found in kv
            if (rank !== -1) user = await kv.hgetall(profile?.fid?.toString() || "") || DEFAULT_USER;
          }
      
        imageUrl = generateImageUrl(frameName, {[RequestProps.IS_FOLLOWING]: isFollowing, 
                                                [RequestProps.USERNAME]: profile?.username || "", 
                                                [RequestProps.AVATAR_URL]: profile?.pfp.url || "", 
                                                [RequestProps.RANK]: rank, 
                                                [RequestProps.WINS]: user.wins, 
                                                [RequestProps.LOSSES]: user.losses, 
                                                [RequestProps.POINTS]: user.points, 
                                                [RequestProps.STREAK]: user.streak, 
                                                [RequestProps.NUM_BETS]: user.numBets});
      });

      console.log(imageUrl)

      const frame: Frame = {
        version: "vNext",
        image: imageUrl,
        buttons: [{label: "Back", action: "post"}],
        postUrl: `${process.env['HOST']}/api/frames/${frameName}`,
      };

      return new NextResponse(
        getFrameHtml(frame),
      );
    }
    // Submit post request to /profile-finder/profile-page
    else if (button === 2) {
      // Get username from fid
      const username : string = await neynarClient.fetchBulkUsers([fid], {viewerFid: BOOKIES_FID}).then(response => {
        return response?.users[0]?.username || "";
      })
      
      return await fetch(`${process.env['HOST']}/api/frames/profile-finder?username=${encodeURIComponent(username)}`, req);
    }
    else {
      return new NextResponse('Invalid button', { status: 400 });
    }
} 

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing } = message;

  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";

  // Check for fid prop in url and if there use that as fid
  const username : string = (req.nextUrl.searchParams.get("username") || message?.input || "emmaniii").toLowerCase();

  if (!username || username === "") {
    return new NextResponse('No username provided', { status: 400 });
  }

  let profile: any = null;
  let imageUrl: string = "";
  let user : User = DEFAULT_USER;
  let rank : number = -1;

  await neynarClient.searchUser(username, BOOKIES_FID).then( (res) => {
    const users = res?.result?.users;
    profile = users?.length > 0 ? users[0] : null;
  })
  .catch ( (error) => {
    console.error(error);
    profile = null;
  })
  .finally(async () => {
      if (profile !== null) {
        rank = await kv.zrank('users', profile?.fid || "") || -1
        
        // Can skip if not found in kv
        if (rank !== -1) user = await kv.hgetall(profile?.fid?.toString() || "") || DEFAULT_USER;
      }
  
    imageUrl = generateImageUrl(frameName, {[RequestProps.IS_FOLLOWING]: isFollowing, 
                                            [RequestProps.USERNAME]: profile?.username || "", 
                                            [RequestProps.AVATAR_URL]: profile?.pfp.url || "", 
                                            [RequestProps.RANK]: rank, 
                                            [RequestProps.WINS]: user.wins, 
                                            [RequestProps.LOSSES]: user.losses, 
                                            [RequestProps.POINTS]: user.points, 
                                            [RequestProps.STREAK]: user.streak, 
                                            [RequestProps.NUM_BETS]: user.numBets});
   });

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: [{label: "Back", action: "post"}],
    postUrl: `${process.env['HOST']}/api/frames/${frameName}`,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export const dynamic = 'force-dynamic';
