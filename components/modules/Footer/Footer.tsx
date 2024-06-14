"use client"

import { Container, Flex, Heading, IconButton, Text, HStack, VStack, Button } from '@chakra-ui/react';

const Footer = () => {
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
      <Container className='font-body' backgroundColor='black' maxW="screen" mt={10} p={'50px'}>
          <Flex align="center" justify="space-between">
            <Heading> 
              <IconButton size='20px' variant='ghost' icon={ <img className="mx-auto" style={{width: 200}}src={`${process.env['HOST']}/Full_logo.png`} />} aria-label={'logo'} 
              onClick= {
                () => window.location.href = `/`
              }/> 
            </Heading>
            <HStack>
              <VStack className='m-10'>
                <Text className="font-bold text-2xl">Socials</Text>
                <Button variant="link" onClick={() => openInNewTab("https://warpcast.com/bookies")}>Warpcast</Button>
                <Button variant="link" onClick={() => openInNewTab("https://discord.gg/D4RTcMBWVC")}>Discord</Button>
              </VStack>
              <VStack className='m-10'>
                <Text className="font-bold text-2xl">Company</Text>
                <Button variant="link" onClick={() => openInNewTab("")}>Terms of Service</Button>
                <Button variant="link" onClick={() => openInNewTab("")}>Privacy Policy</Button>
              </VStack>
            </HStack>
          </Flex>
        </Container>
  );
};

export default Footer;
