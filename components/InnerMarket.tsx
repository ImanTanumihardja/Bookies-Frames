"use client"
import { FunctionComponent, useState } from "react";
import { Container, Button, Table, TableContainer, Tr, Th, Tbody, Td, Thead, useDisclosure, HStack } from "@chakra-ui/react";
import { UserType } from "@types";
import PlaceBetModal, { AcceptedToken as AcceptedToken } from "./PlaceBetModal";
import { calculatePayout, formatCompactNumber, formatOdd, formatTimeAgo } from "@utils/client";
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
    acceptedTokens: AcceptedToken[];
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
    acceptedTokens = [],
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [placeBetModalProps, setPlaceBetModalProps] = useState({ pick: null, odd: 0.5, stake: 0 });
    const toast = useToast()

    const handlePlaceBetClick = (pick=null, odd=0.5, stake=0) => {
        if (startDate < new Date().getTime() / 1000) {
            if (!toast.isActive("market-closed")) {
                toast({
                    id: "market-closed",
                    title: "Market Closed",
                    description: "This market has already closed.",
                    status: "error",
                    duration: 4500,
                    isClosable: true,
                })
            }
            return;
        }

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
        <Container maxW="container.xl" px={5} marginTop={25} as="main" minH="70vh">
            <HStack className="items-start justify-between max-w-full gap-20px pb-5">
                <div className="self-stretch flex flex-row items-center justify-center gap-[20px]">
                    <Button 
                        className="flex flex-row items-center justify-center gap-[12px]"
                        onClick={() => {window.location.href = `/bookies/markets`}}
                        display={['none', 'none', 'flex', 'flex', 'flex']}
                    >
                        <img
                            className="h-6 w-6 relative overflow-hidden shrink-0 min-h-[24px]"
                            loading="lazy"
                            alt=""
                            src="/ionarrowback.svg"
                        />
                        <div className="relative font-medium">Market ID {marketId}</div>
                    </Button>
                    <div className="flex flex-row items-center justify-center font-medium gap-1 text-left text-smi text-lightgray-200">
                        <img
                            className="w-7 relative rounded-[50%] object-cover z-[1]"
                            loading="lazy"
                            alt=""
                            src={creator.pfpUrl ? creator.pfpUrl : `/generic_pfp.png`}
                        />
                        Created by @{creator.username}
                    </div>
                </div>
                <div className="flex flex-row items-center justify-center gap-[24px] max-w-full">
                <Button
                    variant="outline"
                    border='1px'
                    borderRadius='20px'
                    onClick={() => {
                        openInNewTab(`https://warpcast.com/~/compose?text=%20&embeds[]=${window.location.href}`)
                    }}>
                    Warpcast
                    <img
                        className="ml-1 relative overflow-hidden shrink-0 z-[1]"
                        alt=""
                        src="/iconoiropennewwindow.svg"
                    />
                </Button>
                <Button
                    variant="outline"
                    border='1px'
                    borderRadius='20px'
                    display={['none', 'none', 'flex', 'flex', 'flex']}
                    onClick={() => {handlePlaceBetClick()}}
                >
                    Bet Now
                </Button>
                </div>
            </HStack>
                <div className="p-5 self-stretch rounded-xl box-border flex flex-col items-center justify-center relative gap-[24px] max-w-full z-[2] text-center text-8xl text-white border-[1px] border-solid border-darkslategray-300 text-left text-mid text-lightgray-100 font-inter">
                    <h2 className="m-0 text-5xl font-bold inline-blockmax-w-full">
                        {prompt}
                    </h2>
                    <div className="self-stretch flex flex-row md:text-8xl text-7xl font-semibold items-center justify-between max-w-full">
                        <div className="flex-1 flex flex-col items-center">
                            <h1 className="m-0 relative font-inherit items-center text-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)]">
                            {options[0]}
                            </h1>
                            <h2 className="m-0 relative font-inherit md:text-xl text-mini items-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)]">
                            {formatOdd(odds[0])}
                            </h2>
                        </div>
                        <div className="flex-shrink-0 rounded-lg bg-gray-700 flex items-center justify-center py-2 px-3 mx-4">
                            <h3 className="m-0 md:text-5xl text-xl font-inherit text-lightgray-200">
                            OR
                            </h3>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                            <h1 className="m-0 relative text-inherit font-inherit flex items-center text-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)]">
                            {options[1]}
                            </h1>
                            <h2 className="m-0 relative font-inherit md:text-xl text-mini items-center justify-center [text-shadow:0px_4px_4px_rgba(0,_0,_0,_0.25)]">
                            {formatOdd(odds[1])}
                            </h2>
                        </div>
                    </div>
                    <div className="self-center text-center relative font-semibold inline-block whitespace-nowrap">
                        {startDate < now ? "Closed" : `Closes in ${hours} hrs`}
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
                    <div className="self-stretch flex flex-col items-start justify-start gap-[20px] max-w-full text-left text-mini text-lightgray-100">
                        <SpreadBar spreadPercent={spreadPercent}/>
                        <div className="self-stretch flex flex-row items-start justify-between gap-[20px] mq450:flex-wrap">
                            <div className="relative uppercase font-semibold z-[3]">
                            {formatCompactNumber(outcome1Staked)} ${acceptedTokens[0].symbol}
                            </div>
                            <div className="relative uppercase font-semibold text-right z-[3]">
                            {formatCompactNumber(outcome2Staked)} ${acceptedTokens[0].symbol}
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
                                    const timeAgo = formatTimeAgo(txn.timestamp)

                                    let username = txn.bettor.username ? '@' + txn.bettor.username : txn.bettor.address;

                                    const formattedOdd = formatOdd(txn.odd)
                                    
                                    return (
                                        <Tr key={index}>
                                            <Td>{timeAgo}</Td>
                                            <Td className="font-bold"> 
                                            <div className="flex items-center justify-start flex-nowrap overflow-x-auto space-x-1">
                                                <Button 
                                                    variant='ghost' 
                                                    gap={1} 
                                                    padding={2}
                                                    className="flex items-center space-x-1"
                                                    onClick={() => {
                                                    openInNewTab(`http://${window.location.host}/profiles/${txn.bettor.fid}`);
                                                    }}
                                                > 
                                                    <img
                                                    className="w-7 h-7 rounded-full object-cover"
                                                    loading="lazy"
                                                    alt="Profile picture"
                                                    src={txn.bettor.pfpUrl ? txn.bettor.pfpUrl : `/generic_pfp.png`}
                                                    />
                                                    <span className="truncate">
                                                    {username}
                                                    </span>
                                                </Button>
                                                <span className="flex items-center">
                                                    bet {txn.stake} {acceptedTokens[0].symbol} on {options[txn.pick]} at {formattedOdd}
                                                </span>
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
                acceptedTokens={acceptedTokens}
                isOpen={isOpen} 
                onClose={onClose}/>
        </Container>
        );
}

export default InnerMarket;