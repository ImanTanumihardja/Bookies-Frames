"use client"

import { Button, VStack } from "@chakra-ui/react"
import { client, myChain } from "@utils/constants";
import { useActiveAccount, ConnectButton  } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { useFormStatus } from 'react-dom'
import { base } from "thirdweb/chains";

const wallets = [
    inAppWallet(),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
  ];

function PlaceBetButton() {

    const account = useActiveAccount()
    const { pending } = useFormStatus()
    
    return (
         
        <VStack width={"100%"} gap={0}>
            {account &&
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
            </Button> }

            <ConnectButton connectButton={
                {
                    style: {
                        borderRadius:25, 
                        width: "100%", 
                        marginTop:15, 
                        marginBottom:15,
                        background: "linear-gradient(to right, #feae26, #d44fc9 49.5%, #7a65ec)",
                        color: "white",},
                    className:"font-bold text-inter"
                }}
                detailsButton={
                    {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottomLeftRadius: 25,
                            borderBottomRightRadius: 25,
                            minWidth: '85%',
                            height: '40px',
                            marginTop: 0,
                            marginBottom: 15
                        },
                        displayBalanceToken: {[base.id]: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed"},
                        className:"font-bold text-inter"
                    }} 
                chain={myChain} 
                client={client} 
                wallets={wallets} />
            </VStack>
        
    )
}

export default PlaceBetButton;