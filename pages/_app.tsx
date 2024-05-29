import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { useEffect } from "react";
import "aos/dist/aos.css";
import Aos from "aos";

const config = {
  initialColorMode: 'dark',
};

const theme = extendTheme({ config });

const MyApp = ({ Component, pageProps }: AppProps) => {

  useEffect(() => {
    Aos.init({
    });
  }, []);

  return (
    <ChakraProvider resetCSS theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default MyApp;
