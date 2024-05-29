'use client'
import { Container } from '@chakra-ui/react';
import { Footer, Header } from '../src/components/modules';
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react';
import '../styles/globals.css';
import { useEffect } from "react";
import "aos/dist/aos.css";
import Aos from "aos";

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children, pageName }: { children: React.ReactNode, pageName: string}) {

  const config = {
    initialColorMode: 'dark',
  };
  
  const theme = extendTheme({ config });

  useEffect(() => {
    Aos.init({
    });
  }, []);

  return (
    <html lang='en'>
      <body> 
        <Head>
          <title>{`${pageName} | Bookies`}</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
          <link rel="manifest" href="/site.webmanifest"/>
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
          <meta name="msapplication-TileColor" content="#da532c"/>
          <meta name="theme-color" content="#ffffff"></meta>
        </Head>
        <ChakraProvider resetCSS theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} /> 
          <Header />
          <Container maxW="container.xl" p={3} marginTop={50} as="main" minH="70vh">
            {children}
          </Container>
          <Footer />
      </ChakraProvider>
      </body>
    </html>
  );
}
