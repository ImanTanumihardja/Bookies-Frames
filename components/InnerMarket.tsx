"use client"
import { FunctionComponent, useState } from "react";
import { Container, Button, Table, TableContainer, Tr, Th, Tbody, Td, Thead, useDisclosure } from "@chakra-ui/react";
import { UserType } from "@types";
import PlaceBetModal from "./PlaceBetModal";
import { calculatePayout, formatOdd } from "@utils/client";
import { useToast } from '@chakra-ui/react'
import SpreadBar from "./elements/SpreadBar";

export type MarketInnerType = {
    marketId: string;
    prompt: string;
    options: string[];
    odds: number[];
    startDate: number;
    creator: UserType;
    outcome1Staked: number;
    outcome2Staked: number;
    totalStaked: number;
    address: string;
    rules: string;
    umaTxn: string;
    placedBetTxns: PlacedBetTxnType[];
    symbol: string;
  };

export type PlacedBetTxnType = {
    bettor: UserType
    stake: number
    odd: number
    pick: number
    timestamp: number
    txnHash: string
}

const InnerMarket: FunctionComponent<MarketInnerType> = ({
    marketId = "",
    prompt = "",
    options = [],
    odds = [],
    startDate = 0,
    creator = null,
    outcome1Staked = 0,
    outcome2Staked = 0,
    totalStaked = 0,
    address = "",
    rules = "",
    umaTxn = "",
    placedBetTxns = [],
    symbol = "",
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [placeBetModalProps, setPlaceBetModalProps] = useState({ pick: null, odd: 0.5, stake: 0 });
    const toast = useToast()

    const handlePlaceBetClick = (pick=null, odd=0.5, stake=0) => {
        // if (startDate < new Date().getTime() / 1000) {
        //     if (!toast.isActive("market-closed")) {
        //         toast({
        //             id: "market-closed",
        //             title: "Market Closed",
        //             description: "This market has already closed.",
        //             status: "error",
        //             duration: 4500,
        //             isClosable: true,
        //             position:"bottom-right"
        //         })
        //     }
        //     return;
        // }

        // Cap stake between 0 and 5000
        stake = Math.min(5000, Math.max(0, stake));
        stake = parseFloat(stake.toFixed(2));

        // Cap odd between 0 and 1
        odd = Math.min(1, Math.max(0, odd));

        setPlaceBetModalProps({ pick, odd, stake });
        onOpen();
      };

    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const now = new Date().getTime() / 1000;

    // Get hrs and mins till event
    const till = startDate - now;
    const hours = Math.ceil(((till) / (60 * 60)) * 10) / 10;

    const spreadPercent = totalStaked !== 0 ? (outcome1Staked / totalStaked) * 100 : 50;

    return (
        <Container maxW="container.xl" p={3} marginTop={25} as="main" minH="70vh">
            <div className="self-stretch flex flex-row items-start justify-between max-w-full gap-[20px pb-5">
                <div className="flex flex-col items-center justify-center pt-3 px-0 pb-0 box-border max-w-full">
                <div className="self-stretch flex flex-row items-center justify-center gap-[20px]">
                    <Button 
                        className="flex flex-row items-center justify-center gap-[12px]"
                        onClick={() => {window.location.href = `/bookies/markets`}}
                    >
                        <img
                            className="h-6 w-6 relative overflow-hidden shrink-0 min-h-[24px]"
                            loading="lazy"
                            alt=""
                            src="/ionarrowback.svg"
                        />
                        <div className="relative font-medium">Market ID {marketId}</div>
                    </Button>
                    <div className="pt-0.5 px-0 pb-0 text-left text-smi text-lightgray-200">
                        <div className="flex flex-row items-center justify-center font-medium gap-1">
                            <img
                                className="w-7 relative rounded-[50%] object-cover z-[1]"
                                loading="lazy"
                                alt=""
                                src={creator.pfpUrl ? creator.pfpUrl : `/generic_pfp.png`}
                            />
                            Created by @{creator.username}
                        </div>
                    </div>
                </div>
                </div>
                <div className="flex flex-row items-center justify-center gap-[24px] max-w-full">
                <Button
                    variant="outline"
                    size="lg"
                    border='1px'
                    borderRadius='20px'
                    onClick={() => {
                        openInNewTab(`https://warpcast.com/~/compose?text=%20&embeds[]=${window.location.href}`)
                    }}>
                    Warpcast
                    <img
                        className="w-5 h-5 ml-1 relative overflow-hidden shrink-0 z-[1]"
                        alt=""
                        src="/iconoiropennewwindow.svg"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    border='1px'
                    borderRadius='20px'
                    onClick={() => {handlePlaceBetClick()}}
                >
                    Bet Now
                </Button>
                </div>
            </div>
            <div className={`self-stretch flex flex-col items-start justify-start gap-[26px] max-w-full text-left text-mid text-lightgray-100 font-inter`}>
                <div className="self-stretch rounded-xl box-border flex flex-col items-start justify-start pt-[26px] pb-[46px] pr-[27px] pl-[35px] relative gap-[24px] max-w-full z-[2] text-center text-13xl text-white border-[1px] border-solid border-darkslategray-300">
                    <div className="self-stretch flex flex-row items-start justify-center pt-0 pb-[15px] pr-2 pl-0 box-border max-w-full">
                    <h2 className="m-0 w-[761px] relative text-5xl font-bold inline-block shrink-0 max-w-full">
                        {prompt}
                    </h2>
                    </div>
                    <div className="self-stretch flex flex-row items-center justify-center pb-3 box-border max-w-full text-37xl">
                        <div className="w-[486px] flex flex-row text-8xl font-semibold items-center justify-between gap-[35px] max-w-full">
                            <div className="flex flex-col">
                                <h1 className="m-0 flex-1 relative font-inherit items-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)] min-w-[117px]">
                                    {options[0]}
                                </h1>
                                <h2 className="m-0 relative font-inherit text-xl items-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)] min-w-[117px]">
                                    {formatOdd(odds[0])}
                                </h2>
                            </div>
                            <div className="rounded-lg bg-gray-700 flex flex-row items-center justify-center py-2 px-3">
                                <h3 className="m-0 flex-1 relative text-5xl font-inherit text-lightgray-200 mq450:text-lgi">
                                    OR
                                </h3>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="m-0 flex-1 relative text-inherit font-inherit flex items-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)] min-w-[111px]">
                                    {options[1]}
                                </h1>
                                <h2 className="m-0 relative font-inherit text-xl items-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)] min-w-[117px]">
                                    {formatOdd(odds[1])}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="self-stretch flex flex-col items-center justify-center gap-[15px] max-w-full text-xl text-lightgray-100">
                    <div className="w-[1100px] flex flex-row items-center justify-center py-0 px-5 box-border max-w-full">
                        <div className="w-[226px] self-center relative font-semibold inline-block shrink-0 whitespace-nowrap">
                            {startDate < now ? "Closed" : `Closes in ${hours} hrs`}
                        </div>
                    </div>
                    <div className="self-stretch flex flex-row items-start justify-between gap-[20px]">
                        <div className="w-[124px] flex flex-row items-start justify-start relative">
                        <Button
                            variant="outline"
                            size="md"
                            border='1px'
                            borderRadius='20px'
                            onClick={() => {handlePlaceBetClick(0, odds[0])}}
                        >
                            Bet {options[0]}
                        </Button>
                        </div>
                        <div className="w-[124px] flex flex-row items-end justify-end relative">
                        <Button
                            variant="outline"
                            size="md"
                            border='1px'
                            borderRadius='20px'
                            onClick={() => {handlePlaceBetClick(1, odds[1])}}
                        >
                            Bet {options[1]}
                        </Button>
                        </div>
                    </div>
                    </div>
                    <div className="self-stretch flex flex-col items-start justify-start gap-[20px] max-w-full text-left text-mini text-lightgray-100">
                        <SpreadBar spreadPercent={spreadPercent}/>
                        <div className="self-stretch flex flex-row items-start justify-between gap-[20px] mq450:flex-wrap">
                            <div className="relative uppercase font-semibold z-[3]">
                            {options[0]} - {Math.round(outcome1Staked).toLocaleString()} ${symbol}
                            </div>
                            <div className="relative uppercase font-semibold text-right z-[3]">
                            {options[1]} - {Math.round(outcome2Staked).toLocaleString()} ${symbol}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row items-center justify-start pt-5 pb-2 gap-[20px] text-left text-5xl text-white font-inter">
                    <h3 className="m-0 relative text-inherit font-extrabold font-inherit inline-block min-w-[120px]">
                        Market Info
                    </h3>
                    <Button 
                        variant="ghost" 
                        justifySelf={"center"}
                        onClick={() => {
                            openInNewTab(`https://basescan.org/address/${address}`)
                        }}
                        >
                            View on Basescan
                        </Button>
            </div>
            <div className="self-stretch rounded-xl bg-gray-200 flex flex-col items-end justify-start p-5 box-border gap-[31px] max-w-full text-xl">
                <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
                    <b className="relative inline-block z-[1]">
                        Rules
                    </b>
                    <div className="self-stretch relative leading-[24px] font-medium text-lightgray-200 z-[1]">
                        {rules}
                    </div>
                </div>
                <div className="flex flex-row items-start justify-end py-0 px-[9px] box-border max-w-full">
                    <Button
                        onClick={() => {
                            openInNewTab(`https://oracle.uma.xyz/propose?chainName=Base&transactionHash=${umaTxn}&eventIndex=101`)
                        }}>
                        Propose Resolution
                    </Button>
                </div>
            </div>
            <div>
                <h3 className="pt-5 pb-2 m-0 relative font-extrabold inline-block min-w-[94px] text-left text-5xl text-white font-inter">
                    Activity
                </h3>
                <TableContainer borderRadius="15" border='1px solid gray'>
                    <Table variant="unstyled" size="md">
                        <Thead borderBottom={"1px solid gray"}>
                            <Tr>
                                <Th fontSize={"md"}>Latest</Th>
                                <Th fontSize={"md"}></Th>
                                <Th fontSize={"md"}>Actions</Th>
                                <Th fontSize={"md"}>Txn Hash</Th>
                            </Tr>
                        </Thead>
                        <Tbody className="font-inter">
                            {
                                placedBetTxns.map((txn, index) => {
                                    // Parse timestamp to be time ago
                                    const now = new Date().getTime() / 1000;
                                    const elapsedSeconds = Math.ceil(now - txn.timestamp);
                                
                                    let timeAgo;
                                    if (elapsedSeconds < 60) {
                                        timeAgo = `${elapsedSeconds} seconds ago`;
                                    } else if (elapsedSeconds < 3600) {
                                        const elapsedMinutes = Math.floor(elapsedSeconds / 60);
                                        timeAgo = `${elapsedMinutes} minutes ago`;
                                    } else {
                                        const elapsedHours = Math.floor(elapsedSeconds / 3600);
                                        timeAgo = `${elapsedHours} hours ago`;
                                    }

                                    let username = txn.bettor.username ? '@' + txn.bettor.username : txn.bettor.address;
                                    username = username.length > 10 ? username.slice(0, 10) + ". . . " : username;

                                    const formattedOdd = formatOdd(txn.odd)
                                    
                                    return (
                                        <Tr key={index}>
                                            <Td>{timeAgo}</Td>
                                            <Td className="font-bold"> 
                                                <div className="flex items-center">
                                                    <Button 
                                                        variant='ghost' 
                                                        gap={1} 
                                                        padding={2}
                                                        onClick={() => {
                                                            openInNewTab(`http://${window.location.host}/profiles/${txn.bettor.fid}`)
                                                        }}> 
                                                        <img
                                                            className="w-7 relative rounded-[50%] object-cover z-[1]"
                                                            loading="lazy"
                                                            alt={`/generic_pfp.png`}
                                                            src={txn.bettor.pfpUrl ? txn.bettor.pfpUrl : `/generic_pfp.png`}
                                                        />
                                                        {username} 
                                                    </Button>
                                                    bet {txn.stake} ${symbol} on {options[txn.pick]} at {formattedOdd}
                                                </div>
                                            </Td>
                                            <Td>
                                                <div className="flex flex-direction-row gap-2">
                                                    <Button 
                                                        onClick={() => {
                                                            const oppositePick = txn.pick === 0 ? 1 : 0;
                                                            const oppositeOdd = odds[oppositePick];

                                                            // Calculate the stake to match the opposite side
                                                            const oppositeStake = calculatePayout(oppositeOdd, txn.stake) - txn.stake;
                                                            handlePlaceBetClick(oppositePick, oppositeOdd, oppositeStake)
                                                        }}
                                                    >
                                                        Bet Against
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            handlePlaceBetClick(txn.pick, txn.odd, txn.stake)
                                                        }}
                                                    >
                                                        Copy Bet
                                                    </Button>
                                                </div>
                                            </Td>
                                            <Td>
                                                <Button 
                                                    style={{ color: '#38bdf9', textDecoration: 'underline' }} 
                                                    variant={"link"}
                                                    padding={0}
                                                    onClick={() => {
                                                        openInNewTab(`https://basescan.org/tx/${txn.txnHash}`)
                                                    }}>
                                                    {txn.txnHash.slice(0, 10)} . . .
                                                </Button>
                                            </Td>
                                        </Tr>
                                    );
                                })
                            }
                        </Tbody>
                    </Table>
                </TableContainer>
            </div>
            <PlaceBetModal 
                defaultPick={placeBetModalProps.pick} 
                defaultOdd={placeBetModalProps.odd} 
                defaultStake={placeBetModalProps.stake}
                marketId={marketId}
                address={address} 
                prompt={prompt} 
                options={options} 
                odds={odds} 
                symbol={symbol}
                isOpen={isOpen} 
                onClose={onClose}/>
        </Container>
        );
}

export default InnerMarket;