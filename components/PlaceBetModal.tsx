"use client"
import { FunctionComponent } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
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

export type PlaceBetModal = {
    marketId: string;
    prompt: string;
    options: string[];
    isOpen: boolean;
    onClose: () => void;
  };

const PlaceBetModal: FunctionComponent<PlaceBetModal> = ({
    marketId = "",
    prompt = "",
    options = [],
    isOpen = false,
    onClose = () => {}
}) => {

    const format = (val) => val + ` $DEGEN `
    const parse = (val) => val.replace(/^\$/, '')
    const [value, setValue] = React.useState('0')

    const [state, formAction] = useFormState((_: any, formData: FormData) => {}, { message: "" });

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
                            <FormLabel color={"gray.400"}>Pick</FormLabel>
                            <PickBet options={options}/>
                        </div>
                        <div className="w-full">
                            <FormLabel color={"gray.400"}>Stake</FormLabel>
                            <NumberInput 
                                onChange={(valueString) => setValue(parse(valueString))}
                                value={format(value)}
                                max={5000} 
                                min={0} 
                                w="100%"
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
                        <NumberInput size={"xs"} width={75} marginBottom={1}>
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
                            1000 $DEGEN
                        </Text>
                    </HStack>
                </form>
            </ModalBody>
            </ModalContent>
        </Modal>
        );
}

export default PlaceBetModal;