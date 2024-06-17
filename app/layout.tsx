import { Container } from '@chakra-ui/react';
import Footer from '@components/Footer';
import Header from '@components/Header';
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/react'
import Providers from '../context/Providers';
import '../styles/globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: React.ReactNode}) {

  return (
    <html lang='en'>
      <body> 
        <Head>
          <title>Bookies</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
          <link rel="manifest" href="/site.webmanifest"/>
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
          <meta name="msapplication-TileColor" content="#da532c"/>
          <meta name="theme-color" content="#ffffff"></meta>
        </Head>
        <ChakraProvider resetCSS>
          <ColorModeScript initialColorMode={'dark'} />
          <Providers>
            <Header />
            <Container maxW="container.md" p={3} marginTop={25} as="main" minH="70vh">
              {children}
            </Container>
            <Footer />
          </Providers>
      </ChakraProvider>
      </body>
    </html>
  );
}
