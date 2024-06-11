import { Box, Button, Container, Flex, HStack, Heading, IconButton, Image } from '@chakra-ui/react';
import { ColorModeButton, LaunchAppButton } from '../../../components/elements';

const Header = () => {
  function redirect(url: string): void {
    window.location.href = url;
  }

  return (
    <Box borderBottom="1px" borderBottomColor="chakra-border-color">
      <Container maxW="screen" p={'20px'}>
        <Flex align="center" justify="space-between">
          <Heading> 
            <IconButton size='50px' variant='ghost' icon={<Image boxSize='40px' src={`${process.env['HOST']}/icon_transparent.png`} />} aria-label={'logo'} 
            onClick= {
              () => window.location.href = `/`
            }/> 
          </Heading>
          <HStack gap={'10px'}>
            <Button fontSize='xl' variant="ghost" onClick={() => redirect('/bookies/events')}>Events</Button>
            <Button fontSize='xl' variant="ghost">Profile</Button>
            {/* <LaunchAppButton/> */}
            {/* <ColorModeButton /> */}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
