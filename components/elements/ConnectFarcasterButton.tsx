"use client"

import { Button, HStack, Image,Text } from '@chakra-ui/react';
import {usePrivy} from '@privy-io/react-auth';

const ConnectFarcasterButton = () => {
  const {ready, authenticated, login, user} = usePrivy();

  return (
    ready && authenticated 
    ?
    <Button size="lg">
      <HStack gap={2}>
        <Image borderRadius={25} boxSize={9} src={user?.farcaster?.pfp}/>
        <Text>{user?.farcaster?.displayName}</Text>
      </HStack>
    </Button> 
    :
    <Button  onClick={login}> 
      <Image src={`${process.env.HOST}/frame-209.svg`}/>
      Connect Farcaster
    </Button>
  );
};

export default ConnectFarcasterButton;
