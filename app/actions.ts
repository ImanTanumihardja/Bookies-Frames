'use server'

import {z} from 'zod'
import createEvent from '../src/scripts/createEvent'
import settleEvent from '../src/scripts/settleEvent'
import getEvent from '../src/scripts/getEvent'
import { revalidatePath } from 'next/cache'
import {ethers} from 'ethers';
import { Accounts } from '../src/utils'
import  orderBookieFactoryABI  from './contract-abis/OrderBookieFactory';
import { ORDERBOOKIE_FACTORY_ADDRESS, USDC_ADDRESS } from './addresses'

import { createClient  } from "@vercel/kv";

const kv = createClient({
  url: process.env['KV_REST_API_URL'] || '',
  token: process.env['KV_REST_API_TOKEN'] || '',
});

export async function createEventAction(
    prevState: any, 
    formData: FormData
    ) {
    const schema = z.object({
        eventName: z.string(),
        startDate: z.number(),
        odds: z.string(),
        options: z.string(),
        prompt: z.string(),
        host: z.string(),
        ancillaryData: z.string().optional(),
    })
    const {eventName, startDate, odds, options, prompt, host, ancillaryData} = schema.parse({
        eventName: formData.get('eventName'),
        startDate: parseInt(formData.get('startDate') as string),
        odds: formData.get('odds'),
        options: formData.get('options'),
        prompt: formData.get('prompt'),
        host: formData.get('host'),
        ancillaryData: formData.get('ancillaryData'),
    })

    // Parse odds to be float array
    const oddsArray = odds.split(', ').map((odd) => parseFloat(odd))
    console.log(oddsArray)
    
    // Parse options to be string array
    const optionsArray = options.split(', ')
    console.log(optionsArray)

    // Check if event already exists
    const eventExists = await kv.exists(`${eventName}`)
    if (eventExists) {
        return {message: `Event ${eventName} already exists`}
    }

    let address = ""
    if (host === Accounts.BOOKIES || host === Accounts.BOTH) { // If bookies is the host deploy smart contract
        if (ancillaryData) {
            const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_PROVIDER_URL);
            const signer = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
            const orderBookiefactory = new ethers.Contract(ORDERBOOKIE_FACTORY_ADDRESS, orderBookieFactoryABI, signer);
    
            const tx = await orderBookiefactory.createOrderBookie(ethers.toUtf8Bytes(ancillaryData), startDate, 0, 0, 7200, USDC_ADDRESS, ethers.encodeBytes32String("NUMERICAL"), signer.getAddress(), false)
    
            // Get address of create contract
            const txReceipt = await tx.wait()
    
            console.log('TX RECEIPT: ', txReceipt.hash)
            
            const logs:any = txReceipt?.logs.map((log:any) => orderBookiefactory.interface.parseLog(log))
    
            // Find event with Name OrderBookieEvent
            const event = logs?.find((log:any) => log?.name === "OrderBookieEvent")
    
            // Print the arg
            console.log('OrderBookie Address: ', event?.args[0])
            address = event?.args[0]
        }
        else {  
            return {message: `Ancillary data is required for bookies`}
        }
       
    }

    try {
        await createEvent(eventName, startDate, oddsArray, optionsArray, prompt, host, address)
        revalidatePath('/')
        return {message: `Created event: ${eventName}`}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to create event: ${e}`}
    }

}

export async function settleEventAction(
    prevState: any, 
    formData: FormData
    ) {
        
    const schema = z.object({
        eventName: z.string(),
        result: z.number(),
    })
    const {eventName, result} = schema.parse({
        eventName: formData.get('eventName'),
        result: parseFloat(formData.get('result') as string),
    })

    try {
        await settleEvent(eventName, result)
        revalidatePath('/')
        return {message: `Settled event: ${eventName}`}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to settle event: ${e}`}
    }
}

export async function getEventAction(
    prevState: any, 
    formData: FormData
    ) {
        
    const schema = z.object({
        eventName: z.string(),
    })
    const {eventName} = schema.parse({
        eventName: formData.get('eventName'),
    })

    try {
        const eventData = await getEvent(eventName)
        revalidatePath('/')
        return {message: `Retrieved ${eventName}`, eventName: eventName, eventData: eventData}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to settle event: ${e}`, eventName: eventName, eventData: null}
    }
}
