'use server'

import {z} from 'zod'
import createMarket from '@scripts/createMarket'
import settleMarket from '@scripts/settleMarket'
import placeBet from '@scripts/placeBet'
import getMarket from '@scripts/getMarket'
import { revalidatePath } from 'next/cache'
import { Accounts, DatabaseKeys } from '@utils/constants'
import { kv } from '@vercel/kv'

export async function createMarketAction(
    _: any, 
    formData: FormData
    ) {
    const schema = z.object({
        marketId: z.string(),
        startDate: z.number(),
        odds: z.string(),
        options: z.string(),
        prompt: z.string(),
        host: z.string(),
        description: z.string().optional(),
        acceptedToken: z.string().optional(),
        creator: z.string(),
    })
    const {marketId, startDate, odds, options, prompt, host, description, acceptedToken, creator} = schema.parse({
        marketId: formData.get('marketId'),
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
        await createMarket(marketId, startDate, oddsArray, optionsArray, prompt, host, description, acceptedToken, parseInt(creator))
        revalidatePath('/')
        return {message: `Created event: ${marketId}`}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to create event: ${e}`}
    }
}

export async function settleMarketAction(
    marketId: string,
    _: any, 
    formData: FormData
    ) {
        
    const schema = z.object({
        result: z.number(),
    })
    const {result} = schema.parse({
        marketId: formData.get('marketId'),
        result: parseFloat(formData.get('result') as string),
    })

    try {
        await settleMarket(marketId, result)
        revalidatePath('/')
        return {message: `Settled event: ${marketId}`}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to settle event: ${e}`}
    }
}

export async function getMarketAction(
    _: any, 
    formData: FormData
    ) {
        
    const schema = z.object({
        marketId: z.string(),
    })
    const {marketId} = schema.parse({
        marketId: formData.get('marketId'),
    })

    try {
        const marketData = await getMarket(marketId)
        revalidatePath('/')

        const isBookies = marketData?.host === Accounts.BOOKIES || marketData?.host === Accounts.BOTH
        const isAlea = marketData?.host === Accounts.ALEA || marketData?.host === Accounts.BOTH

        return {message: `Retrieved ${marketId}`, marketId: marketId, marketData: marketData, isAlea: isAlea, isBookies: isBookies}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to settle event: ${e}`, marketId: marketId, marketData: null, isAlea: true, isBookies: true}
    }
}

export async function getAllMarketsAction() {
    try {
        // Get events from database
    
        let result = await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.MARKETS}`, 0);
        let cursor = result[0];
        let marketIds:string[] = result[1] as string[];

        while (cursor && cursor !== '0' && parseFloat(cursor) !== 0) {
            result = await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.MARKETS}`, cursor);
            cursor = result[0];
            marketIds = marketIds.concat(result[1] as string[]);
        }

        // For each event, get the event data
        const markets = {}
        for (const marketId of marketIds) {
            const marketData = await getMarket(marketId)
            markets[marketId] = marketData
        }

        revalidatePath('/')

        return markets
    }
    catch (e) {
        console.error(e)
    }
}

export async function placeBetForAction(
    marketId: string,
    _: any, 
    formData: FormData
    ) {
        
    const schema = z.object({
        bettor: z.string(),
        fid: z.number(),
        stake: z.number(),
        pick: z.number(),
    })
    const { bettor, fid, stake, pick } = schema.parse({
        bettor: formData.get('bettor'),
        fid: parseInt(formData.get('fid') as string),
        stake: parseFloat(formData.get('stake') as string),
        pick: parseFloat(formData.get('pick') as string),
    })

    try {
        await placeBet(bettor, marketId, fid, stake, pick)
        revalidatePath('/')
        return {message: `Placed bet for ${fid} on option ${pick + 1} with ${stake} stake`}
    }
    catch (e) {
        console.error(e)
        return {message: `Failed to place bet: ${e}` }
    }
}

export async function saveBetData(fid: number, marketId: string, address: string) {
    // Add users connect address
    await kv.sadd(`${fid.toString()}:addresses`, address).catch(async (e) => {
        console.log('Error adding address to kv: ', e)
        // Try again
        await kv.sadd(`${fid.toString()}:addresses`, address)
    })

    // Add reverse search
    await kv.hset(address, {"fid": fid.toString()}).catch(async (e) => {
        console.log('Error adding address to kv: ', e)
        // Try again
        await kv.hset(address, {"fid": fid.toString()})
    })

    // Add user to bettors list
    await kv.sadd(`${Accounts.BOOKIES}:${marketId}:${DatabaseKeys.BETTORS}`, fid).catch(async (error) => {
        console.error('Error adding user to bettors list: ', error);
        // Try again
        await kv.sadd(`${Accounts.BOOKIES}:${marketId}:${DatabaseKeys.BETTORS}`, fid).catch(() => {
        throw new Error('Error creating bet');
        })
    })

    // Add market to user's bet list
    await kv.sadd(`${fid}:${DatabaseKeys.BETS}`, marketId).catch(async (error) => {
        console.error('Error adding event to user:', error);
        // Try again
        await kv.sadd(`${fid}:${DatabaseKeys.BETS}`, marketId).catch(() => {
        throw new Error('Error creating bet');
        })
    })
}
