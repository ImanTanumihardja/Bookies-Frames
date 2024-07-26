"use client"
import { FunctionComponent, useEffect, useState } from "react";
import React from "react";
import PickBet from "./elements/PickBet";
import PlaceBetButton from "./elements/PlaceBetButton";
import { calculatePayout, formatOdd, parseOdd } from "@utils/client";
import { ODDS_DECIMALS, PICK_DECIMALS, myChain } from "@utils/constants";
import { ethers } from "ethers";
import { orderBookieABI, erc20ABI } from "@abis";
import { storeBetData, getPercentFilled } from "../app/actions";
import { useShield3Context } from '@shield3/react-sdk';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Address } from "@shield3/react-sdk/dist/types";
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
    Spinner, 
    useDisclosure,
    Button
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
    acceptedTokens: AcceptedToken[];
    isOpen: boolean;
    onClose: () => void;
  };

  export type AcceptedToken = {
    symbol: string
    decimals: number
    address: string
  }

const PlaceBetModal: FunctionComponent<PlaceBetModal> = ({
    defaultPick = null,
    defaultOdd = 0.5,
    defaultStake = 0,
    marketId = "",
    address = "",
    prompt = "",
    options = [],
    odds = [],
    acceptedTokens = [],
    isOpen = false,
    onClose = () => {}
}) => {

    const placeBet = async (_) => {
        try {
            const wallet = wallets[0]
            await wallet.switchChain(myChain)
            const walletProvider = await wallet.getEthereumProvider();
            
            const iOrderBookie = new ethers.Interface(orderBookieABI)

            const parsedPick = ethers.parseUnits(pick.toString(), PICK_DECIMALS)
            const parsedStake = ethers.parseUnits(stake, acceptedTokens[0].decimals)
            const parsedOdd = ethers.parseUnits(odd.toString(), ODDS_DECIMALS)

            // Approve orderbookie to spend accepted token
            const iERC20 = new ethers.Interface(erc20ABI)
            let data = iERC20.encodeFunctionData('approve', [address, parsedStake])
            const approveTx = {
                to: acceptedTokens[0].address,
                data: data,
                chainId: myChain,
            }
            
            // Simulate approve
            if (((await shield3Client.getPolicyResults(approveTx, wallet.address as Address)).decision) !== 'Allow') {
                throw new Error('Shield3 blocked transaction')
            }

            await walletProvider.request({
                method: 'eth_sendTransaction',
                params: [approveTx],
            });

            // Place bet
            data = iOrderBookie.encodeFunctionData('placeBet', [parsedPick, parsedStake, parsedOdd])
            const placeBetTx = {
                to: address,
                data: data,
                chainId: myChain,
            }

            // Simulate approve
            if ((await shield3Client.getPolicyResults(placeBetTx, wallet.address as Address)).decision !== 'Allow') {
                throw new Error('Shield3 blocked transaction')
            }
            
            await walletProvider.request({
                method: 'eth_sendTransaction',
                params: [placeBetTx],
            });

            // Save bet information
            if (authenticated && user?.farcaster)
            {
                const fid = user.farcaster.fid
                await storeBetData(fid, marketId, wallet.address)
            }

            toast({
                title: "Bet Placed",
                description: "Your bet has been placed",
                status: "success",
                duration: 4500,
                isClosable: true,
            })

            onClose();
            onOpenConfirmation();
        } catch (e) {
            toast({
                title: "Failed to place bet",
                description: e.message,
                status: "error",
                duration: 4500,
                isClosable: true,
            })
        }
    }

    const fetchPercentFilled = async () => {
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

    const { wallets } = useWallets()
    const { authenticated, user } = usePrivy()
    const toast = useToast();
    const { shield3Client } = useShield3Context();
    const { isOpen: confirmationIsOpen, onOpen: onOpenConfirmation, onClose: onCloseConfrimation } = useDisclosure()

    // Form state
    const [pick, setPick] = useState(defaultPick);
    const [stake, setStake] = useState(defaultStake.toFixed(2)); // String
    const [odd, setOdd] = useState(defaultOdd);
    const [filled, setFilled] = useState(0);

    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    useEffect(() => {
        if (isOpen === false && confirmationIsOpen === false) {
            setStake((0).toString())
            setOdd(0.5)
            setPick(null)
        }
        else {  
            setPick(pick !== null ? pick : defaultPick)
            setOdd(pick === null ? defaultOdd : odds[pick])
            setStake(parseFloat(stake) === 0 ? defaultStake.toFixed(2) : stake)
        }
    }, [isOpen, pick, confirmationIsOpen]);

    useEffect(() => {
        fetchPercentFilled()
    }, [pick, stake, odd])

    return (
        <div>
            <Modal isOpen={isOpen} onClose={onClose} isCentered >
                <ModalOverlay/>
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
                                        <InputLeftAddon>${acceptedTokens[0].symbol}</InputLeftAddon>
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
                                    onChange={(value: string) => {
                                        // Check if odds are different
                                        if (odd !== parseOdd(value) && parseFloat(formatOdd(odds[pick])) !== parseFloat(value) && !toast.isActive("odds-changed")) {
                                            toast({
                                                id: "odds-changed",
                                                title: "Odds Changed",
                                                description: "This may reduce your chances of finding a counterparty to fill your bet.",
                                                status: "warning",
                                                duration: 5000,
                                                isClosable: true,
                                            })
                                        }
                                        setOdd(parseOdd(value))
                                    }}
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
                                    {calculatePayout(odd, parseFloat(stake)).toFixed(2)} ${acceptedTokens[0].symbol}
                                </Text>
                            </HStack>
                            </FormControl>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={confirmationIsOpen} onClose={onCloseConfrimation} isCentered >
                <ModalOverlay />
                <ModalContent bg="#1F2937">
                <ModalHeader fontSize={"md"} color={"gray.400"}>Bet Confirmation</ModalHeader>
                <ModalCloseButton />
                <ModalBody className="font-inter text-inter mb-5">
                    <VStack alignItems={"center"}>
                        <Heading 
                            className="text-transparent !bg-clip-text [background:linear-gradient(90deg,_#feae26,_#d44fc9_49.5%,_#7a65ec)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]" 
                            fontSize={"xx-large"}>
                            Congratulations
                        </Heading>
                        <Text fontSize={"large"} color={"white"}> Your bet has been placed!</Text>
                        <Button m={2} onClick={
                            () => {
                                const embeddedUrl = `${process.env['NEXT_PUBLIC_HOST']}/api/bookies/${marketId}/share-bet/?pick=${pick}&odds=${odds}&stake=${parseFloat(stake)}&symbol=${acceptedTokens[0].symbol}&fid=${user?.farcaster?.fid}`
                                openInNewTab(`https://warpcast.com/~/compose?text=%20&embeds[]=${embeddedUrl}`)
                            }
                        }>
                            Share
                        </Button>
                    </VStack>
                </ModalBody>
                </ModalContent>
            </Modal>
        </div>
        );
}

export default PlaceBetModal;