import { Box, Container, Flex, HStack, Heading } from '@chakra-ui/react';
import { ColorModeButton, LaunchAppButton } from '../../../components/elements';

const Header = () => {
  return (
    <Box borderBottom="1px" borderBottomColor="chakra-border-color">
      <Container maxW="screen" p={'20px'}>
        <Flex align="center" justify="space-between">
          <Heading className="font-bold bg-gradient-to-r from-orange-500 to-purple-600 text-transparent bg-clip-text bg-300% animate-gradient font-display" size="lg">Bookies</Heading>
          <HStack gap={'10px'}>
            <LaunchAppButton/>
            <ColorModeButton />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
