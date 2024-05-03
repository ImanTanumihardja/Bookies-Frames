'use server'

import {z} from 'zod'
import createEvent from '../src/scripts/createEvent'
import settleEvent from '../src/scripts/settleEvent'
import placeBet from '../src/scripts/placeBet'
import getEvent from '../src/scripts/getEvent'
import { revalidatePath } from 'next/cache'

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
        description: z.string().optional(),
        acceptedToken: z.string().optional(),
    })
    const {eventName, startDate, odds, options, prompt, host, description, acceptedToken} = schema.parse({
        eventName: formData.get('eventName'),
        startDate: parseInt(formData.get('startDate') as string),
        odds: formData.get('odds'),
        options: formData.get('options'),
        prompt: formData.get('prompt'),
        host: formData.get('host'),
        description: formData.get('description'),
        acceptedToken: formData.get('acceptedToken'),
    })

    // Parse odds to be float array
    const oddsArray = odds.split(', ').map((odd) => parseFloat(odd))
    console.log(oddsArray)
    
    // Parse options to be string array
    const optionsArray = options.split(', ')
    console.log(optionsArray)

    try {
        await createEvent(eventName, startDate, oddsArray, optionsArray, prompt, host, description, acceptedToken)
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

    export async function placeBetAction(
        prevState: any, 
        formData: FormData
        ) {
            
        const schema = z.object({
            bettor: z.string(),
            orderBookie: z.string(),
            fid: z.number(),
            stake: z.number(),
            pick: z.number(),
            odd: z.number(),
        })
        const { bettor, orderBookie, fid, stake, pick, odd } = schema.parse({
            bettor: formData.get('bettor'),
            orderBookie: formData.get('orderBookie'),
            fid: parseInt(formData.get('fid') as string),
            stake: parseFloat(formData.get('stake') as string),
            pick: parseFloat(formData.get('pick') as string),
            odd: parseFloat(formData.get('odd') as string),
        })
    
        try {
            await placeBet(bettor, orderBookie, fid, stake, pick, odd)
            revalidatePath('/')
            return {message: `Placed bet for ${fid} on ${pick} with ${stake} stake and ${odd} odds`}
        }
        catch (e) {
            console.error(e)
            return {message: `Failed to place bet: ${e}` }
        }
    }
