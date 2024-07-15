"use client"

import { Container, HStack, VStack, Button, Text } from '@chakra-ui/react';

const Footer = () => {
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
      <Container className='text-mini font-body' maxW="screen" justifyContent="center" p={'50px'}>
              <VStack className='m-10'>
                <HStack fontSize={["small", "large"]}>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    fontSize={"inherit"}
                    onClick={() => {openInNewTab('https://warpcast.com/bookies')}}
                  >
                    Warpcast
                  </Button>
                  <span className="text-gray-100">|</span>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    fontSize={"inherit"}
                    onClick={() => {openInNewTab('https://discord.gg/D4RTcMBWVC')}}
                  >
                    Discord
                  </Button>
                  <span className="text-gray-100">|</span>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    fontSize={"inherit"}
                    onClick={() => {openInNewTab('https://bookies.gitbook.io/bookies')}}
                  >
                    Whitepaper
                  </Button>
                  <span className="text-gray-100">|</span>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    fontSize={"inherit"}
                    onClick={() => {openInNewTab(`${process.env.HOST || ''}/terms`)}}
                  >
                    Terms of Use
                  </Button>
                </HStack>
                <Text className='font-inter text-inter'>©2024 Bookies Labs</Text>
              </VStack>
        </Container>
  );
};

export default Footer;
