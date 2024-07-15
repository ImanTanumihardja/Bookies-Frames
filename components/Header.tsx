"use client"

import { Button, Container, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerOverlay, Flex, HStack, Heading, IconButton, Image, VStack, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import ConnectFarcasterButton from './elements/ConnectFarcasterButton';

const Header = () => {

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Container maxW="screen" p={6} pb={0} marginBottom={0} className="font-body">
      <Flex align="center" justify="space-between" display={["none", "none", "flex", "flex", "flex"]}>
        <Heading flex="1">
          <IconButton 
            size='lg' 
            variant='ghost' 
            icon={<Image boxSize='40px' src={`/icon_transparent.png`} />} 
            aria-label='logo'
            onClick={() => window.location.href = '/'}
          />
        </Heading>
        <Flex flex="1" justify="center">
          <HStack spacing={4}>
            <Button fontSize='xl' variant="ghost" onClick={() => window.location.href = '/bookies/markets'}>Markets</Button>
            <Button fontSize='xl' variant="ghost" onClick={() => {openInNewTab('https://bookies.gitbook.io/bookies')}}>FAQ</Button>
          </HStack>
        </Flex>
        <Flex flex="1" justify="flex-end">
          <ConnectFarcasterButton />
        </Flex>
      </Flex>
      <Flex display={["flex", "flex", "none", "none", "none"]}>
        <IconButton
            display={{ base: 'block', md: 'none' }}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Toggle navigation"
            onClick={isOpen ? onClose : onOpen}
          />
        <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody marginTop={25}>
                <VStack as="nav" spacing={4}>
                <Button fontSize='xl' variant="ghost" onClick={() => { window.location.href = '/'; onClose(); }}>Home</Button>
                <Button fontSize='xl' variant="ghost" onClick={() => { window.location.href = '/bookies/markets'; onClose(); }}>Markets</Button>
                <Button fontSize='xl' variant="ghost" onClick={() => { openInNewTab('https://bookies.gitbook.io/bookies'); onClose(); }}>FAQ</Button>
                <ConnectFarcasterButton />
                </VStack>
            </DrawerBody>
          </DrawerContent>
      </Drawer>
      </Flex>
    </Container>
  );
};

export default Header;
