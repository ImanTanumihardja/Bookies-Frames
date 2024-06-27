"use client"

import { Button } from "@chakra-ui/react"
import { AutoConnect } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

// list of wallets that your app uses
const wallets = [
    inAppWallet(),
    createWallet("io.metamask"),
    createWallet("me.rainbow"),
  ];

function PlaceBetButton() {
    
    return (
        <>
        {/* <AutoConnect
            wallets={wallets}
            client={client}
        /> */}
        <Button 
            marginY={5}
            w='100%'
            borderRadius={15}
            bgGradient="linear(to-r, #feae26, #d44fc9 49.5%, #7a65ec)"
            _hover={{
                bgGradient: "linear(to-r, rgba(254, 174, 38, 0.5), rgba(212, 79, 201, 0.5) 49.5%, rgba(122, 101, 236, 0.5))",
                color: "rgba(255, 255, 255, 0.5)",
            }}
        >
            Place Bet
        </Button>
        </>
        
    )
}

export default PlaceBetButton;