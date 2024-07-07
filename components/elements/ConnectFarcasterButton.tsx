"use client"

import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, HStack, Image, Menu, MenuButton, MenuItem, MenuList,Text } from '@chakra-ui/react';
import {usePrivy} from '@privy-io/react-auth';

const ConnectFarcasterButton = () => {
    const {ready, authenticated, user, login, logout} = usePrivy();

    return (
        ready && authenticated && user.farcaster
        ?
        <Menu>
            <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />} 
                size="lg"
            >
                <HStack gap={2}>
                    <Image borderRadius={25} boxSize={9} src={user?.farcaster?.pfp ? user?.farcaster?.pfp : '/generic_pfp.png'}/>
                    <Text>{user?.farcaster?.displayName}</Text>
                </HStack>
            </MenuButton>
            <MenuList>
                <MenuItem 
                onClick={() => {
                    window.location.href = `/profiles/${user.farcaster.fid}`;
                }}>View Profile</MenuItem>
                <MenuItem onClick={logout}>Sign Out</MenuItem>
            </MenuList>
        </Menu>
        :
        <Button  onClick={login}> 
            <Image src={`/frame-209.svg`}/>
            Connect Farcaster
        </Button>
    );
};

export default ConnectFarcasterButton;
