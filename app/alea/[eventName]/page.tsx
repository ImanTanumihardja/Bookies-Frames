// Page that returns a frame
import { Frame, getFrame, getFrameFlattened } from "frames.js";
import type { Metadata } from "next";
import {GET} from '../../api/alea/[eventName]/route'
import { NextRequest } from "next/server";
import { Accounts } from "@utils/constants";
 

// Export Next.js metadata
export async function generateMetadata({ params: { eventName } }: { params: { eventName: string } }): Promise<Metadata> {
    // Get the frame html from the GET function
    const url = new URL(`/api/${Accounts.ALEA}/${eventName}`, process.env.NEXT_PUBLIC_HOST)
    const req : NextRequest = new NextRequest(url);
    const response = await GET(req, {params: {eventName}});
    const htmlString = await response.text();
    const frame:Frame = getFrame({htmlString: htmlString, url:url.toString()}).frame as Frame;
    const flattenedFrame = getFrameFlattened(frame);

    return {
        title: eventName,
        description: "Place your bets!",
        other: flattenedFrame as { [name: string]: string | number | (string | number)[] }
    };
};

export default function EventPage() {
    return(
        <></>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';