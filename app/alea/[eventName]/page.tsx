// Page that returns a frame
import { Frame, getFrame, getFrameFlattened } from "frames.js";
import type { Metadata } from "next";
import {GET} from '../../api/alea/[eventName]/route'
import { NextRequest } from "next/server";
import { Accounts } from "../../../src/utils";
import { Home } from "../../../src/components/templates/home";
 

// Export Next.js metadata
export async function generateMetadata({ params: { eventName } }: { params: { eventName: string } }): Promise<Metadata> {
    // Get the frame html from the GET function
    const url = new URL(`/api/${Accounts.ALEA}/${eventName}`, process.env.HOST)
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

export default function EventPage({params}: { params: {eventName: string}}) {
    return(
        <Home/>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';