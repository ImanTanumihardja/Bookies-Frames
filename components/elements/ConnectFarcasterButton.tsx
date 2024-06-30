"use client"

import { Button, HStack, Image,Text } from '@chakra-ui/react';
import {usePrivy} from '@privy-io/react-auth';

const ConnectFarcasterButton = () => {
    const {ready, authenticated, login, user} = usePrivy();

    return (
        ready && authenticated && user.farcaster
        ?
        <Button 
            size="lg"
            onClick={() => {
                window.location.href = `/profiles/${user.farcaster.fid}`;
            }}
        >
            <HStack gap={2}>
                <Image borderRadius={25} boxSize={9} src={user?.farcaster?.pfp ? user?.farcaster?.pfp : '/generic_pfp.png'}/>
                <Text>{user?.farcaster?.displayName}</Text>
            </HStack>
        </Button> 
        :
        <Button  onClick={login}> 
        <Image src={`/frame-209.svg`}/>
            Connect Farcaster
        </Button>
    );
};

export default ConnectFarcasterButton;
