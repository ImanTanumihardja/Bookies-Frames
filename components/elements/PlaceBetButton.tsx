"use client"

import { Button } from "@chakra-ui/react"
import { client, myChain } from "@utils/constants";
import { useActiveAccount, ConnectButton  } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

const wallets = [
    inAppWallet(),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
  ];

function PlaceBetButton() {

    const account = useActiveAccount()
    
    return (
        account ?  
        <Button
            type="submit"
            className="font-bold text-inter"
            marginY={5}
            w='100%'
            borderRadius={15}
            bgGradient="linear(to-r, #feae26, #d44fc9 49.5%, #7a65ec)"
            color="white"
            _hover={{
                bgGradient: "linear(to-r, rgba(254, 174, 38, 0.8), rgba(212, 79, 201, 0.8) 49.5%, rgba(122, 101, 236, 0.8))",
                color: "rgba(255, 255, 255, 0.8)",
            }}
        >
            Place Bet
        </Button> 
        :
        <ConnectButton connectButton={
            {
                style: {
                    borderRadius:25, 
                    width: "100%", 
                    marginTop:15, 
                    marginBottom:15},
                className:"font-bold text-inter"
            }} 
            chain={myChain} 
            client={client} 
            wallets={wallets} />
        
    )
}

export default PlaceBetButton;