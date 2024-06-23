// Page that returns a frame
import { Frame, getFrame, getFrameFlattened } from "frames.js";
import type { Metadata } from "next";
import {GET} from '../../api/bookies/[eventName]/route'
import { NextRequest } from "next/server";
import { Accounts, RequestProps } from "@utils/constants";
import { generateUrl } from "@utils";
import { Container } from "@chakra-ui/react";
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

export default async function MarketPage({ params: { marketId } }: { params: { marketId: string }; }) {


    // Get market data
    const marketData: MarketData = await getEvent(marketId)

    console.log(marketData)
    
    return(
        <Container maxW="container.xl" p={3} marginTop={25} as="main" minH="70vh">
            <div className="self-stretch flex flex-row items-start justify-between max-w-full gap-[20px pb-5">
                <div className="flex flex-col items-start justify-start pt-3 px-0 pb-0 box-border max-w-full">
                <div className="self-stretch flex flex-row items-start justify-start gap-[20px]">
                    <div className="flex flex-row items-start justify-start gap-[12px]">
                    <img
                        className="h-6 w-6 relative overflow-hidden shrink-0 min-h-[24px]"
                        loading="lazy"
                        alt=""
                        src="/ionarrowback.svg"
                    />
                    <div className="relative font-medium">Event ID #45688</div>
                    </div>
                    <div className="pt-0.5 px-0 pb-0 text-left text-smi text-lightgray-200">
                        <div className="flex flex-row items-center justify-center font-medium gap-1">
                            <img
                            className="h-5 w-5 relative rounded-[50%] object-cover min-h-[20px]"
                            loading="lazy"
                            alt=""
                            src="/ellipse-111@2x.png"
                            />
                            Created by @bookies
                        </div>
                    </div>
                </div>
                </div>
                <div className="flex flex-row items-start justify-start gap-[24px] max-w-full mq450:flex-wrap">
                <button className="cursor-pointer pt-[11px] pb-3 px-7 bg-[transparent] rounded-3xl flex flex-row items-start justify-start gap-[8px] border-[1px] border-solid border-white">
                    <div className="relative text-mid font-extrabold font-inter text-white text-center inline-block min-w-[81px] z-[1]">
                    Warpcast
                    </div>
                    <div className="flex flex-col items-start justify-start pt-px px-0 pb-0">
                    <img
                        className="w-5 h-5 relative overflow-hidden shrink-0 z-[1]"
                        alt=""
                        src="/iconoiropennewwindow.svg"
                    />
                    </div>
                </button>
                <button
                    className="cursor-pointer pt-[11px] px-[38px] pb-3 bg-[transparent] rounded-3xl flex flex-row items-start justify-start whitespace-nowrap border-[1px] border-solid border-white hover:bg-gainsboro-200 hover:box-border hover:border-[1px] hover:border-solid hover:border-gainsboro-100"
                >
                    <div className="relative text-mid font-extrabold font-inter text-white text-center inline-block min-w-[70px] z-[1]">
                    Bet Now
                    </div>
                </button>
                </div>
            </div>
            <div className={`self-stretch flex flex-col items-start justify-start gap-[26px] max-w-full text-left text-mid text-lightgray-100 font-inter`}>
                <div className="self-stretch rounded-xl box-border flex flex-col items-start justify-start pt-[26px] pb-[46px] pr-[27px] pl-[35px] relative gap-[24px] max-w-full z-[2] text-center text-13xl text-white border-[1px] border-solid border-darkslategray-300 mq450:pt-5 mq450:pb-[30px] mq450:box-border">
                    <div className="self-stretch flex flex-row items-start justify-center pt-0 pb-[15px] pr-2 pl-0 box-border max-w-full">
                    <h2 className="m-0 w-[761px] relative text-5xl font-bold inline-block shrink-0 max-w-full mq1025:text-7xl mq450:text-lgi">
                        Who will win Game 4: Celtics or Mavericks?
                    </h2>
                    </div>
                    <div className="self-stretch flex flex-row items-center justify-center pb-3 box-border max-w-full text-37xl">
                        <div className="w-[486px] flex flex-row text-8xl font-semibold items-center justify-between gap-[35px] max-w-full mq750:flex-wrap mq750:justify-center">
                            <h1 className="m-0 flex-1 relative font-inherit flex items-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)] min-w-[117px] mq1025:text-26xl mq450:text-15xl mq900:text-26xl">
                                BOS
                            </h1>
                            <div className="rounded-lg bg-gray-700 flex flex-row items-center justify-center py-2 px-3">
                                <h3 className="m-0 flex-1 relative text-5xl font-inherit text-lightgray-200 mq450:text-lgi">
                                    OR
                                </h3>
                            </div>
                            <h1 className="m-0 flex-1 relative text-inherit font-inherit flex items-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)] min-w-[111px] mq1025:text-26xl mq450:text-15xl mq900:text-26xl">
                                DAL
                            </h1>
                        </div>
                    </div>
                    <div className="w-full h-full absolute !m-[0] rounded-xl z-[1]" />
                    <div className="w-[1184px] h-[419px] relative rounded-xl box-border hidden max-w-full z-[3] border-[1px] border-solid border-darkslategray-300" />
                    <div className="self-stretch flex flex-col items-center justify-center gap-[15px] max-w-full text-xl text-lightgray-100">
                    <div className="w-[1100px] flex flex-row items-center justify-center py-0 px-5 box-border max-w-full">
                        <div className="w-[226px] self-center relative font-semibold inline-block shrink-0 whitespace-nowrap mq450:text-base">
                        Closes in 05:08:23 hrs
                        </div>
                    </div>
                    <div className="self-stretch flex flex-row items-start justify-between gap-[20px] mq450:flex-wrap mq450:justify-center">
                        <div className="w-[124px] flex flex-row items-start justify-start relative">
                        <button
                            className="cursor-pointer py-[9px] px-6 bg-[transparent] flex-1 rounded-3xl flex flex-row items-start justify-start whitespace-nowrap z-[4] border-[1px] border-solid border-white hover:bg-gainsboro-200 hover:box-border hover:border-[1px] hover:border-solid hover:border-gainsboro-100"
                        >
                            <div className="h-10 w-[124px] relative rounded-3xl box-border hidden border-[1px] border-solid border-white" />
                            <div className="flex-1 relative text-mini font-extrabold font-inter text-white text-center z-[1]">
                            Bet BOS
                            </div>
                        </button>
                        </div>
                        <div className="w-[124px] flex flex-row items-start justify-start relative">
                        <button
                            className="cursor-pointer py-[9px] pr-[22px] pl-[26px] bg-[transparent] flex-1 rounded-3xl flex flex-row items-start justify-start whitespace-nowrap z-[4] border-[1px] border-solid border-white hover:bg-gainsboro-200 hover:box-border hover:border-[1px] hover:border-solid hover:border-gainsboro-100"
                        >
                            <div className="h-10 w-[124px] relative rounded-3xl box-border hidden border-[1px] border-solid border-white" />
                            <div className="flex-1 relative text-mini font-extrabold font-inter text-white text-center z-[1]">
                            Bet DAL
                            </div>
                        </button>
                        </div>
                    </div>
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start gap-[20px] max-w-full text-left text-mini text-lightgray-100">
                    <div className="self-stretch rounded-xl bg-whitesmoke flex flex-row items-start justify-start max-w-full z-[3]">
                        <div className="self-stretch w-[1120px] relative rounded-xl bg-whitesmoke hidden max-w-full" />
                        <img
                        className="w-[668px] relative max-h-full max-w-full z-[4]"
                        loading="lazy"
                        alt=""
                        src="/rectangle-408301.svg"
                        />
                    </div>
                    <div className="self-stretch flex flex-row items-start justify-between gap-[20px] mq450:flex-wrap">
                        <div className="relative uppercase font-semibold z-[3]">
                        BOS - 30,520 $DEGEN
                        </div>
                        <div className="relative uppercase font-semibold text-right z-[3]">
                        DAL - 23,788 $DEGEN
                        </div>
                    </div>
                    </div>
                </div>
                </div>
        </Container>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';