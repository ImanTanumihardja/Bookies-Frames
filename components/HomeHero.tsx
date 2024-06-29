"use client"

import { FunctionComponent } from "react";
import { VStack, Flex, HStack, Button } from "@chakra-ui/react";
import {ReactTyped} from "react-typed";

const HomeHero: FunctionComponent = () => {

  return (
    <VStack w={'full'} rounded="lg" className="space-y-10 font-inter" alignItems='center' justifyItems='center'>
      <Flex gap={5} flexDirection="row" className="text-center" display={["none", "none", "none", "none", "flex"]}>
      <div className="rounded-lg bg-gray-300 box-border flex flex-row items-start justify-start py-1.5 px-3 opacity-[0.9] text-goldenrod border-[1px] border-solid border-darkolivegreen" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Onchain
      </div>
      <div className="rounded-lg bg-gray-400 box-border flex flex-row items-start justify-start py-1.5 px-3 opacity-[0.9] text-dodgerblue border-[1px] border-solid border-dodgerblue relative inline-block" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Built on Base
      </div>
      <div className="rounded-lg bg-gray-400 box-border flex flex-row items-start justify-start py-1.5 px-3 opacity-[0.9] text-darkorchid border-[1px] border-solid border-mediumslateblue" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Bet Degen Tips
      </div>
      <div className="rounded-lg bg-gray-500 box-border flex flex-row items-start justify-start py-1.5 px-3 opacity-[0.9] text-lightseagreen border-[1px] border-solid border-darkslategray-100" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Permissionless Settlement
      </div>
      </Flex>
      <Flex direction="column" alignItems='center'>
        <img
          className="w-[180.5px] relative justify-self-center self-center"
          alt=""
          src="/Full_logo.png"
        />
        <div className="font-semibold font-inherit text-56xl text-white flex items-baseline">
          <h1 className="inline-block flex-shrink-0"> Bet to</h1>
          <ReactTyped 
            className="text-inherit font-semibold font-inherit pl-3 text-transparent !bg-clip-text [background:linear-gradient(90deg,_#feae26,_#d44fc9_49.5%,_#7a65ec)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] inline-block shrink-0 z-[1]" 
            strings={['Win','Earn', 'Own']} 
            typeSpeed={175} 
            backSpeed={200}
            loop 
            />
        </div>
        <p className="m-0 lg:w-4/5 mx-auto text-center text-gray-900 inline-block">
            Bookies is the world’s first transparent, non-custodial sports
            betting exchange centered around the ethos of democratizing the
            sports betting experience
        </p>
      </Flex>
      <HStack width="full" justify="space-between">
        <div className="flex flex-row"> 
          <h2 className="uppercase font-semibold inline-block pr-5">POPULAR</h2>
          <div className="h-[26px] w-[67px] rounded-lg bg-white box-border flex flex-row items-center justify-center py-1 gap-[4px] opacity-[0.8] text-center text-gray-700 border-[1px] border-solid border-whitesmoke">
            <div className="h-3 w-1.5 flex flex-col items-center justify-center box-border">
              <div className="w-1.5 h-1.5 relative rounded-[50%] bg-firebrick" />
            </div>
            <div className="relative uppercase font-medium inline-block self-center">
              Live
            </div>
          </div>
        </div>  
        <Button 
          variant="ghost"
          onClick={() => {
            window.location.href = "bookies/markets";
          }}>
            View all 
            <img
              className="h-7 w-7 relative overflow-hidden shrink-0"
              loading="lazy"
              alt=""
              src="/ionchevronforwardsharp.svg"
            />
        </Button>
      </HStack>
    </VStack>
  );
};

export default HomeHero;
