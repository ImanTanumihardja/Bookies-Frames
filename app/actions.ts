'use server'

import {z} from 'zod'
import createEvent from '../scripts/createEvent'
import settleEvent from '../scripts/settleEvent'
import placeBet from '../scripts/placeBet'
import getEvent from '../scripts/getEvent'
import { revalidatePath } from 'next/cache'
import { Accounts } from '@utils/constants'

export async function createEventAction(
    _: any, 
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
        creator: z.string(),
    })
    const {eventName, startDate, odds, options, prompt, host, description, acceptedToken, creator} = schema.parse({
        eventName: formData.get('eventName'),
        startDate: parseInt(formData.get('startDate') as string),
        odds: formData.get('odds'),
        options: formData.get('options'),
        prompt: formData.get('prompt'),
        host: formData.get('host'),
        description: formData.get('description') || '',
        acceptedToken: formData.get('acceptedToken') || '',
        creator: formData.get('creator'),
    })

    // Parse odds to be float array
    const oddsArray = odds.split(', ').map((odd) => parseFloat(odd))
    console.log(oddsArray)
    
    // Parse options to be string array
    const optionsArray = options.split(', ')
    console.log(optionsArray)

    try {
        await createEvent(eventName, startDate, oddsArray, optionsArray, prompt, host, description, acceptedToken, parseInt(creator))
        revalidatePath('/')
        return {message: `Created event: ${eventName}`}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to create event: ${e}`}
    }
}

export async function settleEventAction(
    _: any, 
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
    _: any, 
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

        const isBookies = eventData?.host === Accounts.BOOKIES || eventData?.host === Accounts.BOTH
        const isAlea = eventData?.host === Accounts.ALEA || eventData?.host === Accounts.BOTH

        return {message: `Retrieved ${eventName}`, eventName: eventName, eventData: eventData, isAlea: isAlea, isBookies: isBookies}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to settle event: ${e}`, eventName: eventName, eventData: null, isAlea: true, isBookies: true}
    }
}

export async function placeBetAction(
    _: any, 
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
