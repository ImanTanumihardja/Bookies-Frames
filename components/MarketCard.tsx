"use client"
import { FunctionComponent } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import { UserType } from "@types";
import SpreadBar from "./elements/SpreadBar";
import { formatCompactNumber } from "@utils/client";

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
            width="full"
            _hover={{ opacity: 0.8}} 
            className={`max-w-[640px] rounded-xl flex flex-col bg-gray-200 items-end justify-start p-[20px] box-border gap-[16px] text-left text-smi text-white font-inter`}
            onClick={() => {
                window.location.href = `/bookies/${marketId}`
            }}
        >
            <Text className="flex flex-row items-start justify-start pt-0 px-0 pb-1.5 box-border text-right font-medium opacity-[0.8]">
                {startDate < now ? "Closed" : `Market closes in ${hours} hrs`}
            </Text>
            <HStack width="full" justify="space-between" className="items-start justify-start box-border text-5xl">
                    <Text className={`${ prompt.length < 30 ? "text-6xl" : "text-5xl"} font-bold relative `}>
                        {prompt}
                    </Text>
                    <img
                    className="w-10 h-10 relative overflow-hidden shrink-0 z-[1]"
                    loading="lazy"
                    alt=""
                    src="/materialsymbolslightchevronright.svg"
                    />
            </HStack>
            <div className="w-full flex flex-col items-end justify-start gap-[12px]">
                <HStack className="w-full items-start justify-between">
                    <b>{options[0]}</b>
                    <b>{options[1]}</b>
                </HStack>
                <SpreadBar spreadPercent={spreadPercent}/>
                <HStack className="w-full items-start justify-between">
                    <span className="font-medium">{formatCompactNumber(outcome1Staked)} $DEGEN</span>
                    <span className="font-medium">{formatCompactNumber(outcome2Staked)} $DEGEN</span>
                </HStack>
                <div className="h-px w-full relative box-border z-[1] border-t-[1px] border-solid border-darkslategray-200" />
                <HStack className="w-full flex flex-row items-center justify-between text-smi text-whitesmoke">
                    <Box className="h-4 flex flex-row items-center justify-start gap-[5px]" display={["none", "none", "flex", "flex", "flex"]}>
                        <div className="relative font-medium inline-block z-[1]">
                            Bettors: {numBettors}
                        </div>
                        <div className="w-1.5 h-1.5 relative rounded-[50%] bg-slategray z-[1]" />
                        <div className="font-medium inline-block z-[1]">
                            Total: {Math.round(totalStaked).toLocaleString()} $DEGEN
                        </div>
                    </Box>
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
                </HStack>
            </div>
        </Box>
        );
}

export default MarketCard;