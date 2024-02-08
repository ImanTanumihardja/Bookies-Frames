import { NextRequest } from 'next/server'

export enum RequestProps {
    FID = 'fid',
    IS_FOLLOWING = 'isFollowing',
    HAS_CLAIMED = 'hasClaimed',
    AMOUNT = 'amount',
}

export const RequestPropsTypes = {
    [RequestProps.FID]: 0,
    [RequestProps.IS_FOLLOWING]: true,
    [RequestProps.HAS_CLAIMED]: true,
    [RequestProps.AMOUNT]: 0,
}

export function getRequestProps(req: NextRequest, params: RequestProps[]): Record<string, any> {
    // Loop throug each RequestParams
    let returnParams: Record<string, any> = {}
    for (const key of params) {;
        if (!req.nextUrl.searchParams.has(key)) {
            // Throw error if required param is missing
            throw new Error(`Missing required param: ${key}`)
        }

        const value = req.nextUrl.searchParams.get(key) || ''

        // Parse Props
        switch (typeof RequestPropsTypes[key]) {
            case 'string':
                returnParams[key] = value
                break;
            case 'number':
                returnParams[key] = parseInt(value)
                break;
            case 'boolean':
                returnParams[key] = value.toLowerCase() === 'true';
                break;
        }
    }

    return returnParams
}

export function generateImageUrl(frameName: string, params: Record<string, any>): string {
    let url = `${process.env['HOST']}/api/frames/${frameName}/image?`

    if (process.env['HOST']?.includes('localhost') || process.env['HOST']?.includes('staging')) {
        url += `?timestamp=${new Date().getTime()}`
    }

    // Loop through each param
    for (const key in params) {
        url += `&${key}=${params[key]}`
    }
    return url
}