"use client"

import {
    VStack,
    useColorMode,
} from '@chakra-ui/react';

// import { ReactTyped } from "react-typed";

export default function HomePage() {

    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        };

    const { colorMode } = useColorMode();

    return (
        <VStack w={'full'} rounded="lg" className="space-y-0 font-body">
          <div className='h-screen flex flex-col items-center justify-center mt-[-100px]'>
            <div className="w-full h-70 overflow-clip text-center">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 text-transparent bg-clip-text bg-300% animate-gradient">Welcome to <br/> Bookies</h1>
              <div className='my-10'>
                <h2 className="text-2xl lg:text-3xl font-bold lg:w-2/3 mx-auto text-center">The first transparent, non-custodial sports betting exchange  centered around the ethos of democratizing the sports betting experience!</h2>
                <button className="secondary-button grow text-white font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-300% animate-gradient mt-10" 
                onClick = {
                  () => openInNewTab('https://docs.google.com/forms/d/1Bt-eLAhZh1jpzClLI9NRqYa6C9-iTErFeI0_8dVK2L0/')
                  }
                >Get Early Access</button>
                <button className="secondary-button grow text-white font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-300% animate-gradient mt-10 mx-10" 
                onClick = {
                  () => openInNewTab('https://paragraph.xyz/@bookies/the-whos,-whats,-and-hows-of-bookies')
                  }
                >Whitepaper</button>
              </div>
            </div>
            
            <div className='flex text-6xl md:text-7xl lg:text-8xl font-bold italic items-center justify-center'>
              <h1 className=''>Bet to </h1>
              {/* <ReactTyped className='bg-gradient-to-r from-orange-500 to-purple-600 text-transparent bg-clip-text bg-300% animate-gradient pl-5' strings={['Own', 'Win', 'Earn']} typeSpeed={175} backSpeed={200} loop/> */}
            </div>
          </div>
    
    
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold items-center justify-center text-center">Power of Bookies</h1>
            <div className='w-full'>
              <div className={`${colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"} flex space-x-4 rounded-md p-6 my-8 lg:w-2/3`} data-aos="fade-right">
                <div className='ml-auto'>
                  <img src="/handshake.png" className="h-40 w-40 md:h-60 md:w-60 rounded-sm object-cover float-right"></img>
                  <h1 className="font-bold font-display text-3xl lg:text-5xl my-5">Peer-to-Peer Sports Betting Exchange</h1>
                  <p className="text-xl lg:text-2xl opacity-80">Our platform will facilitate a peer to peer sports betting exchange, aligning incentives between the platform and the users, rather than a traditional sportsbook that act as users counterparty and want users to lose. </p>
                </div>
              </div>
              <br />
              <div className='justify-end'>
                <div className={`${colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"} flex space-x-4 w-full rounded-md p-6 my-8 ml-auto lg:w-2/3`} data-aos="fade-left">
                    <div>
                      <img src="/bot.png" className="h-40 w-40 md:h-60 md:w-60 rounded-sm object-cover float-right"></img>
                      <h1 className="font-bold font-display text-3xl lg:text-5xl my-5">Sports Betting AI Chatbot</h1>
                      <p className="text-xl lg:text-2xl opacity-80">Because of the aligned incentives, we can provide tools to help users win more. We plan to develop a Sports Betting AI chatbot that will provide assistance and transparent betting information to facilitate sharper betting.</p>
                    </div>
                </div>
              </div>
              
              <br />
              <div className={`${colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"} flex space-x-4 rounded-md p-6 my-8 lg:w-2/3`} data-aos='fade-right'>
                <div className='ml-auto'>
                <img src="/blockchain.png" className="h-40 w-40 md:h-60 md:w-60 rounded-sm object-cover float-right"></img>
                  <h1 className="font-bold font-display text-3xl lg:text-5xl my-5">Fully Built On-Chain</h1>
                  <p className="text-xl lg:text-2xl opacity-80">Our platform also tackles other security issues associated with centralized platforms. By operating fully on chain, we are able to eliminate risk of a centralized entity abusing its power over user funds.</p>
                </div>
              </div>
            </div>
    
            <br />
            <br />
    
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 bg-300% animate-gradient w-full rounded-md p-6" data-aos="fade-up">
              <h1 className="text-5xl font-display font-bold my-3 text-center">Bracket Betting</h1>
              <p className="text-2xl opacity-80 text-center"> Bookies is the first on-chain sports betting platform that enables bracket betting.</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-5">
                <div className="flex space-x-4">
                  <img src="/abstract-1.webp" className="h-16 w-16 rounded-sm object-cover"></img>
                  <div>
                    <h1 className="font-bold font-display">Connect your wallet</h1>
                    <p className="text-xs opacity-80">Integrated with MetaMask, WalletConnect, etc</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <img src="/abstract-2.webp" className="h-16 w-16 rounded-sm object-cover"></img>
                  <div>
                    <h1 className="font-bold font-display">Find your tournament</h1>
                    <p className="text-xs opacity-80">Wide variety of competitions to select from</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <img src="/abstract-3.webp" className="h-16 w-16 rounded-sm object-cover"></img>
                  <div>
                    <h1 className="font-bold font-display">Create or find a Bookie</h1>
                    <p className="text-xs opacity-80">Customizable bookies allow for a unique betting experience</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <img src="/abstract-4.jpeg" className="h-16 w-16 rounded-sm object-cover"></img>
                  <div>
                    <h1 className="font-bold font-display">Fill in your bracket and bet</h1>
                    <p className="text-xs opacity-80">Enjoy betting with millions of others</p>
                  </div>
                </div>
              </div>
            </div>
    
            <br />
            <br />
    
            <h1 className="text-5xl lg:text-7xl font-display font-bold">Roadmap</h1>
            <br />  
            <div className="w-full snap-x snap-mandatory overflow-x-scroll flex">
                <div className="snap-center shrink-0 place-items-center mx-10">
                  <div className={`${colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded p-5 m-5 h-56 w-90`}>
                    <h1 className="text-4xl md:text-5xl font-display font-bold my-3 text-center  bg-gradient-to-r from-orange-500 to-purple-600 text-transparent bg-clip-text bg-300% animate-gradient">Q1 2024</h1>
                    <ul className="list-disc p-5 text-xl">
                      <li>Research and Ideate</li>
                      <li>Prototype Development</li>
                    </ul>
                  </div>
                </div>
                <div className="snap-center shrink-0 place-items-center mx-10">
                  <div className={`${colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded p-5 m-5 h-56 w-90`}>
                    <h1 className="text-4xl md:text-5xl font-display font-bold my-3 text-center">Q2 2024</h1>
                    <ul className="list-disc p-5 text-xl">
                      <li>Incorporate the Business</li>
                      <li>Get Licensing</li>
                      <li>MVP Development</li>
                    </ul>
                  </div>
                </div>
                <div className="snap-center shrink-0 place-items-center mx-10">
                  <div className={`${colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded p-5 m-5 h-56 w-90`}>
                    <h1 className="text-4xl md:text-5xl font-display font-bold my-3 text-center">Q3 2024</h1>
                    <ul className="list-disc p-5 text-xl">
                      <li>Launch MVP</li>
                      <li>Execute Go-to-Market</li>
                      <li>Token Generation Event</li>
                    </ul>
                  </div>
                </div>
                <div className="snap-center shrink-0 place-items-center mx-10">
                  <div className={`${colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded p-5 m-5 h-56 w-90`}>
                    <h1 className="text-4xl md:text-5xl font-display font-bold my-3 text-center">Q4 2024</h1>
                    <ul className="list-disc p-5 text-xl">
                      <li>AI Tooling Development</li>
                      <li>Build-Your-Own Props</li>
                    </ul>
                  </div>
                </div>
              </div>
        </VStack>
      );
}