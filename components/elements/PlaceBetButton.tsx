"use client"

import { Box, Button, VStack } from "@chakra-ui/react"
import { useFormStatus } from 'react-dom'
import { usePrivy, useWallets } from "@privy-io/react-auth";

function PlaceBetButton() {
    const { pending } = useFormStatus()
    const {connectWallet } = usePrivy();
    const {ready, wallets} = useWallets();
    
    return (
        (ready && wallets[0]) ?
        <VStack width={"100%"} gap={0}>
            <Button
                type="submit"
                className="font-bold text-inter"
                marginTop={5}
                w='100%'
                borderRadius={15}
                bgGradient="linear(to-r, #feae26, #d44fc9 49.5%, #7a65ec)"
                color="white"
                isLoading={pending}
                _hover={{
                    bgGradient: "linear(to-r, rgba(254, 174, 38, 0.8), rgba(212, 79, 201, 0.8) 49.5%, rgba(122, 101, 236, 0.8))",
                    color: "rgba(255, 255, 255, 0.8)",
                }}
            >
                Place Bet
            </Button> 
            <Button
                borderTopRadius={0}
                w="85%"
                h={25}
                marginBottom={15}
                onClick={connectWallet}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                paddingX={20}
                borderBottomRadius={20}
                >
                <Box
                    as="span"
                    display="inline-block"
                    maxWidth="100%"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    fontSize={12}
                >
                    {wallets[0].address}
                </Box>
            </Button>
        </VStack>
        :
        <Button                 
            background="linear-gradient(to right, #feae26, #d44fc9 49.5%, #7a65ec)" 
            _hover={{
                bgGradient: "linear(to-r, rgba(254, 174, 38, 0.8), rgba(212, 79, 201, 0.8) 49.5%, rgba(122, 101, 236, 0.8))",
                color: "rgba(255, 255, 255, 0.8)",
            }}
            w="100%" 
            marginY={15} 
            onClick={connectWallet}
        > 
            Connect Wallet
        </Button>
    )
}

export default PlaceBetButton;