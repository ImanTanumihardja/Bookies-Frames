'use server'

import {z} from 'zod'
import createEvent from '../src/scripts/createEvent'
import settleEvent from '../src/scripts/settleEvent'
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
        multiplier: z.number(),
        options: z.string(),
        prompt: z.string()
    })
    const {eventName, startDate, odds, multiplier, options, prompt} = schema.parse({
        eventName: formData.get('eventName'),
        startDate: parseInt(formData.get('startDate') as string),
        odds: formData.get('odds'),
        multiplier: parseInt(formData.get('multiplier') as string),
        options: formData.get('options'),
        prompt: formData.get('prompt')
    })

    // Parse odds to be float array
    const oddsArray = odds.split(', ').map((odd) => parseFloat(odd))
    console.log(oddsArray)
    
    // Parse options to be string array
    const optionsArray = options.split(', ')
    console.log(optionsArray)

    try {
        await createEvent(eventName, startDate, oddsArray, multiplier, optionsArray, prompt)
        revalidatePath('/')
        return {message: `Created event: ${eventName}`}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to create event: ${eventName}`}
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
        result: parseInt(formData.get('result') as string),
    })

    try {
        await settleEvent(eventName, result)
        revalidatePath('/')
        return {message: `Settled event: ${eventName}`}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to settle event: ${eventName}`}
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
        return {message: `Failed to settle event: ${eventName}`, eventName: eventName, eventData: null}
    }
}