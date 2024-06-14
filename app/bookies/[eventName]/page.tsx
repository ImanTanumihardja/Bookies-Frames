// Page that returns a frame
import { Frame, getFrame, getFrameFlattened } from "frames.js";
import type { Metadata } from "next";
import {GET} from '../../../app/api/bookies/[eventName]/route'
import { NextRequest } from "next/server";
import { Accounts, RequestProps } from "@utils/constants";
import { Home } from "@components/templates/home";
import { generateUrl } from "@utils";

// Export Next.js metadata
export async function generateMetadata({ params: { eventName, odds } }: { params: { eventName: string, odds: number[] }; }): Promise<Metadata> {
    // Get the frame html from the GET function
    const url = generateUrl(`api/${Accounts.BOOKIES}/${eventName}`, {[RequestProps.ODDS]: odds}, false)
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
        <Home/>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';