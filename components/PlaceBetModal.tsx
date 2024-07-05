"use client"
import { FunctionComponent, useEffect, useState } from "react";
import React from "react";
import PickBet from "./elements/PickBet";
import PlaceBetButton from "./elements/PlaceBetButton";
import { calculatePayout, formatOdd, parseOdd } from "@utils/client";
import { useActiveAccount } from "thirdweb/react";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { client, myChain, ODDS_DECIMALS, PICK_DECIMALS } from "@utils/constants";
import { ethers } from "ethers";
import { orderBookieABI, erc20ABI } from "@abis";
import { storeBetData, getPercentFilled } from "../app/actions";
import { usePrivy } from "@privy-io/react-auth";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Heading,
    VStack,
    HStack,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Text,
    FormControl,
    InputGroup,
    InputLeftAddon,
    useToast,
    Spinner 
  } from '@chakra-ui/react'

export type PlaceBetModal = {
    defaultPick: number | null;
    defaultOdd: number;
    defaultStake: number;
    marketId: string;
    address: string;
    prompt: string;
    options: string[];
    odds: number[];
    symbol: string;
    isOpen: boolean;
    onClose: () => void;
  };

const PlaceBetModal: FunctionComponent<PlaceBetModal> = ({
    defaultPick = null,
    defaultOdd = 0.5,
    defaultStake = 0,
    marketId = "",
    address = "",
    prompt = "",
    options = [],
    odds = [],
    symbol = '',
    isOpen = false,
    onClose = () => {}
}) => {

    const placeBet = async (_) => {
        try {
            const signer = ethers6Adapter.signer.toEthers({ client: client, account: activeAccount, chain: myChain })
            
            const orderBookie = new ethers.Contract(address, orderBookieABI, signer)
            const orderBookieInfo = await orderBookie.getBookieInfo()
            
             // Get accpected token
            const acceptedToken = new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, signer)
            const decimals = await acceptedToken.decimals()

            const parsedPick = ethers.parseUnits(pick.toString(), PICK_DECIMALS)
            const parsedStake = ethers.parseUnits(stake, decimals)
            const parsedOdd = ethers.parseUnits(odd.toString(), ODDS_DECIMALS)

            // Approve orderbookie to spend accepted token
            await (await acceptedToken.approve(orderBookie.getAddress(),  parsedStake)).wait() //TODO: change to stake
        
            // Place bet
            const placeBetTransaction = await orderBookie.placeBet(parsedPick, parsedStake, parsedOdd)
            await placeBetTransaction.wait(1)

            // Save bet information
            if (privyAccount.authenticated && privyAccount?.user?.farcaster)
            {
                const fid = privyAccount.user.farcaster.fid
                await storeBetData(fid, marketId, activeAccount.address)
            }

            toast({
                title: "Bet Placed",
                description: "Your bet has been placed",
                status: "success",
                duration: 4500,
                isClosable: true,
                position:"bottom-right"
            })

            onClose();
        } catch (e) {
            toast({
                title: "Failed to place bet",
                description: e.message,
                status: "error",
                duration: 4500,
                isClosable: true,
                position:"bottom-right"
            })
        }
    }

    const fetchData = async () => {
        try {
            const parsedStake = parseFloat(stake)
            if (pick && parsedStake > 0 && odd < 1 && odd > 0 && address) {
                // Set is loading
                setFilled(null)
                const percentFilled = await getPercentFilled(pick, parsedStake, odd, address)
                setFilled(percentFilled)
            }
        }
        catch(e){
            console.error(e)
        }
    }

    const activeAccount = useActiveAccount();
    const privyAccount = usePrivy()
    const toast = useToast();


    // Form state
    const [pick, setPick] = useState(defaultPick);
    const [stake, setStake] = useState(defaultStake.toFixed(2)); // String
    const [odd, setOdd] = useState(defaultOdd);
    const [filled, setFilled] = useState(0);

    useEffect(() => {
        if (isOpen === false) {
            setStake((0).toString())
            setOdd(0.5)
            setPick(null)
        }
        else {  
            setPick(pick !== null ? pick : defaultPick)
            setOdd(pick === null ? defaultOdd : odds[pick])
            setStake(parseFloat(stake) === 0 ? defaultStake.toFixed(2) : stake)
        }
    }, [isOpen, pick]);

    useEffect(() => {
        fetchData()
    }, [pick, stake, odd])

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered >
            <ModalOverlay />
            <ModalContent bg="#1F2937">
            <ModalHeader fontSize={"md"} color={"gray.400"}>Place Bet</ModalHeader>
            <ModalCloseButton />
            <ModalBody className="font-inter text-inter">
                <form action={placeBet}>
                    <FormControl isRequired>
                    <VStack alignItems={"start"}>
                        <Heading fontSize={"lg"}>{prompt}</Heading>
                        <div className="w-full">
                            <FormLabel requiredIndicator={false} htmlFor="pick" color={"gray.400"}>Pick</FormLabel>
                            <PickBet pickHandler={setPick} defaultPick={defaultPick} options={options}/>
                        </div>
                        <div className="w-full">
                            <FormLabel requiredIndicator={false} htmlFor="stake" color={"gray.400"}>Stake</FormLabel>
                            <InputGroup>
                                <InputLeftAddon>${symbol}</InputLeftAddon>
                                <NumberInput 
                                    max={5000} 
                                    min={0} 
                                    w="100%"
                                    precision={2}
                                    value={stake} 
                                    onChange={(value: string) => {setStake(value)}}
                                >
                                    <NumberInputField placeholder="0"/>
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </InputGroup>
                        </div>
                    </VStack>
                    <PlaceBetButton/>
                    <HStack justifyContent="space-between" alignItems="end" w="100%" h="100%">
                        <FormLabel requiredIndicator={false} htmlFor="odd" fontSize={"smaller"} color={"gray.400"}>Odds</FormLabel>
                        <NumberInput 
                            size={"xs"} 
                            maxWidth={100} 
                            marginBottom={1}
                            max={300} 
                            min={-300}
                            value={formatOdd(odd)}
                            onChange={(value: string) => {setOdd(parseOdd(value))}}
                        >
                            <NumberInputField readOnly/>
                            <NumberInputStepper>
                                <NumberIncrementStepper sx={{ fontSize: '0.5em'}} />
                                <NumberDecrementStepper sx={{ fontSize: '0.5em' }} />
                            </NumberInputStepper>
                        </NumberInput>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center" w="100%" h="100%" paddingY={1}>
                        <Text fontSize={"smaller"} color={"gray.400"}>Filled</Text>
                        {filled === null ?
                        <Spinner size={"sm"}/>
                        :
                        <Text fontSize={"smaller"}>
                            {filled}%
                        </Text>
                        }
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center" w="100%" h="100%" paddingY={1}>
                        <Text fontSize={"smaller"} color={"gray.400"}>Payout</Text>
                        <Text fontSize={"smaller"} >
                            {calculatePayout(odd, parseFloat(stake)).toFixed(2)} ${symbol}
                        </Text>
                    </HStack>
                    </FormControl>
                </form>
            </ModalBody>
            </ModalContent>
        </Modal>
        );
}

export default PlaceBetModal;