"use client"

import { Container, Flex, HStack, VStack, Button, Text } from '@chakra-ui/react';

const Footer = () => {
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
      <Container className='font-body' maxW="screen" justifyContent="center" p={'50px'}>
          <Flex align="center" justify="center">
              <VStack className='m-10'>
                <HStack>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    onClick={() => {openInNewTab('https://warpcast.com/bookies')}}
                  >
                    {`Warpcast`}
                  </Button>
                  <span className="text-gray-100">|</span>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    onClick={() => {openInNewTab('https://discord.gg/D4RTcMBWVC')}}
                  >
                    {`Discord`}
                  </Button>
                  <span className="text-gray-100">|</span>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    onClick={() => {openInNewTab('https://bookies.gitbook.io/bookies')}}
                  >
                    {`Whitepaper`}
                  </Button>
                  <span className="text-gray-100">|</span>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    onClick={() => {openInNewTab('https://warpcast.com/bookies')}}
                  >
                    {`Terms of Use`}
                  </Button>
                  <span className="text-gray-100">|</span>
                  <Button 
                    variant="link" 
                    className="whitespace-pre-wrap" 
                    onClick={() => {openInNewTab('https://warpcast.com/bookies')}}
                  >
                    {`Privacy Policy`}
                  </Button>
                </HStack>
                <Text>©2024 Bookies Labs</Text>
              </VStack>
          </Flex>
        </Container>
  );
};

export default Footer;
