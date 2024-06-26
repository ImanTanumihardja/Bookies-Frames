"use client"
import { FunctionComponent } from "react";
import { Box } from "@chakra-ui/react";
import { UserType } from "@types";
import SpreadBar from "./elements/SpreadBar";

export type MarketCardType = {
    marketId: string;
    prompt: string;
    options: string[];
    startDate: number;
    creator: UserType;
    outcome1Staked: number;
    outcome2Staked: number;
    totalStaked: number;
    numBettors: number;
  };

const MarketCard: FunctionComponent<MarketCardType> = ({
    marketId = "",
    prompt = "",
    options = [],
    startDate = 0,
    creator = null,
    outcome1Staked = 0,
    outcome2Staked = 0,
    totalStaked = 0,
    numBettors = 0
}) => {

    const now = new Date().getTime() / 1000;

    // Get hrs and mins till event
    const till = startDate - now;
    const hours = Math.ceil(((till) / (60 * 60)) * 10) / 10;

    const spreadPercent = totalStaked !== 0 ? (outcome1Staked / totalStaked) * 100 : 50;

    return (
        <Box
            as="button" 
            bg="#1f2937" 
            _hover={{ opacity: 0.8}}  
            className={`h-[260px] w-[640px] rounded-xl flex flex-col items-end justify-start py-[19px] px-[22px] box-border gap-[16px] text-left text-smi text-white font-inter`}
            onClick={() => {
                window.location.href = `/bookies/${marketId}`
            }}
        >
            <div className="w-[640px] relative rounded-xl bg-gray-200 h-[260px] hidden" />
            <div className="w-[204px] h-[22px] flex flex-row items-start justify-start pt-0 px-0 pb-1.5 box-border text-right">
                <div className="h-4 w-[204px] flex flex-row items-start justify-end opacity-[0.8] z-[1] inline-block font-medium">
                    {startDate < now ? "Closed" : `Market closes in ${hours} hrs`}
                </div>
            </div>
            <div className="w-[593px] h-16 flex flex-row items-start justify-end py-0 pr-2.5 pl-0 box-border text-5xl">
                <div className="h-16 w-[583px] flex flex-row items-start justify-start gap-[61px]">
                <h2 className={`${ prompt.length < 30 ? "text-6xl" : "text-5xl"} font-bold h-16 w-[482px] relative inline-block te shrink-0 z-[1]`}>
                    {prompt}
                </h2>
                <div className="h-[52px] w-10 flex flex-col items-start justify-start pt-3 px-0 pb-0 box-border">
                    <img
                    className="w-10 h-10 relative overflow-hidden shrink-0 z-[1]"
                    loading="lazy"
                    alt=""
                    src="/materialsymbolslightchevronright.svg"
                    />
                </div>
                </div>
            </div>
            <div className="w-[596px] h-[104px] flex flex-row items-start justify-end py-0 pr-2.5 pl-0 box-border text-mini text-lightgray-100">
                <div className="h-[104px] w-[586px] flex flex-col items-end justify-start gap-[12px]">
                    <SpreadBar spreadPercent={spreadPercent}/>
                    <div className="w-[586px] h-[30px] flex flex-row items-start justify-start gap-[176px]">
                        <div className="h-[30px] w-[220px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
                            <div className="w-[220px] h-7 flex flex-row items-start justify-start gap-[10px]">
                                <div className="h-[23px] w-[182px] flex flex-col items-start justify-start pt-[5px] px-0 pb-0 box-border">
                                    <div className="w-[182px] h-[18px] relative uppercase inline-block z-[1]">
                                        <b>{options[0]}</b>
                                        <span className="font-semibold">{` | `}</span>
                                        <span className="font-medium">{Math.round(outcome1Staked).toLocaleString()} $DEGEN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-7 w-[190px] flex flex-row items-start justify-end gap-[7px] text-right">
                            <div className="h-6 w-[155px] flex flex-col items-start justify-start pt-[5px] px-0 pb-0 box-border">
                                <div className="w-[155px] h-[19px] relative uppercase inline-block z-[1]">
                                <span className="font-medium">{Math.round(outcome2Staked).toLocaleString()} $DEGEN</span>
                                <span className="font-semibold">{` | `}</span>
                                <b>{options[1]}</b>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-[5px] flex flex-row items-start justify-center pt-0 px-0 pb-1 box-border">
                        <div className="h-px w-full relative box-border z-[1] border-t-[1px] border-solid border-darkslategray-200" />
                    </div>
                    <div className="w-full h-5 flex flex-row items-center justify-between gap-[5px] text-smi text-whitesmoke">
                        <div className="h-4 flex flex-row items-center justify-start gap-[5px]">
                            <div className="relative font-medium inline-block z-[1]">
                                Bettors: {numBettors}
                            </div>
                            <div className="w-1.5 h-1.5 relative rounded-[50%] bg-slategray z-[1]" />
                            <div className="font-medium inline-block z-[1]">
                                Total: {Math.round(totalStaked).toLocaleString()} $DEGEN
                            </div>
                        </div>
                        <div className="h-5 w-50 flex flex-row items-center justify-center gap-[5px] text-lightgray-200">
                            <img
                                className="w-7 relative rounded-[50%] object-cover z-[1]"
                                loading="lazy"
                                alt=""
                                src={creator.pfpUrl ? creator.pfpUrl : `/generic_pfp.png`}
                            />
                            <div className="font-medium inline-block whitespace-nowrap overflow-hidden text-ellipsis">
                                Created by @{creator.username}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Box>
        );
}

export default MarketCard;