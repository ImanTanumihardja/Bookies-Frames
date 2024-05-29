// Page that returns a frame
import { Frame, getFrame, getFrameFlattened } from "frames.js";
import type { Metadata } from "next";
import {GET} from '../../api/bookies/[eventName]/route'
import { NextRequest } from "next/server";
import { fetchMetadata } from "frames.js/next";
import { Accounts } from "../../../src/utils";
 

// Export Next.js metadata
export async function generateMetadata({ params: { eventName } }: { params: { eventName: string } }): Promise<Metadata> {
    // Get the frame html from the GET function
    const url = new URL(`/api/${Accounts.BOOKIES}/${eventName}`, process.env.HOST)
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
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                   {params.eventName}
                </main>
            </div>
        </>
    );
}