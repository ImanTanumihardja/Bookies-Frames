import {createThirdwebClient, defineChain} from 'thirdweb';

export const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
})

export const myChain = defineChain(8453)