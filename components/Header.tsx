"use client"

import { Button, Container, Flex, HStack, Heading, IconButton, Image } from '@chakra-ui/react';
import ConnectFarcasterButton from './elements/ConnectFarcasterButton';

const Header = () => {

  function redirect(url: string): void {
    window.location.href = url;
  }

  return (
    <Container maxW="screen" p={6} className="font-body">
      <Flex align="center" justify="space-between">
        <Heading flex="1">
          <IconButton 
            size='lg' 
            variant='ghost' 
            icon={<Image boxSize='40px' src={`${process.env.HOST || ''}/icon_transparent.png`} />} 
            aria-label='logo'
            onClick={() => window.location.href = '/'}
          />
        </Heading>
        <Flex flex="1" justify="center">
          <HStack spacing={4}>
            <Button fontSize='xl' variant="ghost" onClick={() => redirect('/bookies/markets')}>Markets</Button>
            <Button fontSize='xl' variant="ghost">FAQ</Button>
          </HStack>
        </Flex>
        <Flex flex="1" justify="flex-end">
          <ConnectFarcasterButton />
        </Flex>
      </Flex>
    </Container>
  );
};

export default Header;
