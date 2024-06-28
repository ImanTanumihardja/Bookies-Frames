"use client"
import { FunctionComponent, useEffect, useState } from "react";
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
  } from '@chakra-ui/react'
import React from "react";
import { useFormState } from "react-dom";
import PickBet from "./elements/PickBet";
import PlaceBetButton from "./elements/PlaceBetButton";
import { formatImpliedProbability } from "@utils/client";
import { useActiveAccount } from "thirdweb/react";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { client, myChain, ODDS_DECIMALS, PICK_DECIMALS } from "@utils/constants";
import { ethers } from "ethers";
import { OrderBookieABI } from "@contract-abis/orderBookie.json";
import { erc20ABI } from "@contract-abis/erc20.json";

export type PlaceBetModal = {
    defaultPick: number | null;
    defaultOdd: number;
    address: string;
    prompt: string;
    options: string[];
    odds: number[];
    isOpen: boolean;
    onClose: () => void;
  };

const PlaceBetModal: FunctionComponent<PlaceBetModal> = ({
    defaultPick = null,
    defaultOdd = 0.5,
    address = "",
    prompt = "",
    options = [],
    odds = [],
    isOpen = false,
    onClose = () => {}
}) => {

    const placeBet = async (_:any, _formData:FormData) => {
        const signer = ethers6Adapter.signer.toEthers({ client: client, account: activeAccount, chain: myChain })
        
        const orderBookie = new ethers.Contract(address, OrderBookieABI, signer)
        const orderBookieInfo = await orderBookie.getBookieInfo()
        
         // Get accpected token
        const acceptedToken = new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, signer)
        const decimals = await acceptedToken.decimals()

        // Approve orderbookie to spend accepted token
        await (await acceptedToken.approve(orderBookie.getAddress(),  ethers.MaxUint256)).wait() //TODO: change to stake

        const parsedPick = ethers.parseUnits('0', PICK_DECIMALS)
        const parsedStake = ethers.parseUnits('100', decimals)
        const parsedOdd = ethers.parseUnits('0.5', ODDS_DECIMALS)
      
        // Place bet
        const placeBetTransaction = await orderBookie.placeBet(parsedPick, parsedStake, parsedOdd)
        await placeBetTransaction.wait()

        console.log(odds)
    }

    const activeAccount = useActiveAccount();
    const [_, formAction] = useFormState(placeBet, {});

    // const [pick, setPick] = useState(defaultPick);
    const [stake, setStake] = useState(0);
    const [_odd, setOdd] = useState(defaultOdd !== null ? formatImpliedProbability(defaultOdd) : "+100");

    useEffect(() => {
        
    }, [activeAccount]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered >
            <ModalOverlay />
            <ModalContent bg="#1F2937">
            <ModalHeader fontSize={"md"} color={"gray.400"}>Place Bet</ModalHeader>
            <ModalCloseButton />
            <ModalBody className="font-inter text-inter">
                <form action={formAction}>
                    <VStack alignItems={"start"}>
                        <Heading fontSize={"lg"}>{prompt}</Heading>
                        <div className="w-full">
                            <FormLabel htmlFor="pick" color={"gray.400"}>Pick</FormLabel>
                            <PickBet pick={defaultPick} options={options}/>
                        </div>
                        <div className="w-full">
                            <FormLabel htmlFor="stake" color={"gray.400"}>Stake</FormLabel>
                            <NumberInput 
                                max={5000} 
                                min={0} 
                                w="100%"
                                value={stake} 
                                onChange={(value: string) => {setStake(parseFloat(value))}}
                            >
                                <NumberInputField placeholder="0"/>
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </div>
                    </VStack>
                    <PlaceBetButton/>
                    <HStack justifyContent="space-between" alignItems="end" w="100%" h="100%">
                        <FormLabel fontSize={"smaller"} color={"gray.400"}>Odds</FormLabel>
                        <NumberInput 
                            size={"xs"} 
                            width={75} 
                            marginBottom={1}
                            value={defaultOdd} 
                            onChange={(value: string) => {setOdd(value)}}>
                            <NumberInputField placeholder="+100"/>
                            <NumberInputStepper>
                                <NumberIncrementStepper sx={{ fontSize: '0.5em'}} />
                                <NumberDecrementStepper sx={{ fontSize: '0.5em' }} />
                            </NumberInputStepper>
                        </NumberInput>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center" w="100%" h="100%">
                        <FormLabel fontSize={"smaller"} color={"gray.400"}>Filled</FormLabel>
                        <Text fontSize={"smaller"}>
                            100%
                        </Text>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center" w="100%" h="100%">
                        <FormLabel fontSize={"smaller"} color={"gray.400"}>Payout</FormLabel>
                        <Text fontSize={"smaller"} >
                            {stake} $DEGEN
                        </Text>
                    </HStack>
                </form>
            </ModalBody>
            </ModalContent>
        </Modal>
        );
}

export default PlaceBetModal;