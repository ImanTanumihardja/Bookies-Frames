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
        url: z.string(),
    })
    const {eventName, result, url} = schema.parse({
        eventName: formData.get('eventName'),
        result: parseFloat(formData.get('result') as string),
        url: formData.get('url'),
    })

    try {
        await settleEvent(eventName, result, url)
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
            eventName: z.string(),
            fid: z.number(),
            stake: z.number(),
            pick: z.number(),
        })
        const { bettor, eventName, fid, stake, pick } = schema.parse({
            bettor: formData.get('bettor'),
            eventName: formData.get('eventName'),
            fid: parseInt(formData.get('fid') as string),
            stake: parseFloat(formData.get('stake') as string),
            pick: parseFloat(formData.get('pick') as string),
        })
    
        try {
            await placeBet(bettor, eventName, fid, stake, pick)
            revalidatePath('/')
            return {message: `Placed bet for ${fid} on option ${pick + 1} with ${stake} stake`}
        }
        catch (e) {
            console.error(e)
            return {message: `Failed to place bet: ${e}` }
        }
    }
