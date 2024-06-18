// Page that returns a frame
import { Frame, getFrame, getFrameFlattened } from "frames.js";
import type { Metadata } from "next";
import {GET} from '../../api/bookies/[eventName]/route'
import { NextRequest } from "next/server";
import { Accounts, RequestProps } from "@utils/constants";
import { generateUrl } from "@utils";
import { Box } from "@chakra-ui/react";
import getEvent from "@scripts/getEvent";
import { MarketData } from "@types";

// Export Next.js metadata
export async function generateMetadata({ params: { marketId, odds } }: { params: { marketId: string, odds: number[] }; }): Promise<Metadata> {
    // Get the frame html from the GET function
    const url = generateUrl(`api/${Accounts.BOOKIES}/${marketId}`, {[RequestProps.ODDS]: odds}, false)
    const req : NextRequest = new NextRequest(url);
    const response = await GET(req, {params: {marketId: marketId}});
    const htmlString = await response.text();
    const frame:Frame = getFrame({htmlString: htmlString, url:url.toString()}).frame as Frame;
    const flattenedFrame = getFrameFlattened(frame);

    return {
        title: marketId,
        description: "Place your bets!",
        other: flattenedFrame as { [name: string]: string | number | (string | number)[] }
    };
};

export default async function MarketPage({ params: { marketId, odds } }: { params: { marketId: string, odds: number[] }; }) {
    // Get market data
    const marketData: MarketData = await getEvent(marketId)

    console.log(marketData)
    
    return(
        <Box></Box>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';