import { NextRequest } from 'next/server'

export enum RequestProps {
    ACCOUNT_ADDRESS = 'accountAddress',
    IS_FOLLOWING = 'isFollowing',
    HAS_CLAIMED = 'hasClaimed',
}

export const RequestPropsTypes = {
    [RequestProps.ACCOUNT_ADDRESS]: "string",
    [RequestProps.IS_FOLLOWING]: true,
    [RequestProps.HAS_CLAIMED]: true,
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
            case 'number':
                returnParams[key] = parseInt(value)
            case 'boolean':
                returnParams[key] = value.toLowerCase() === 'true';
        }
    }

    return returnParams
}

export function generateImageUrl(frameName: string, params: Record<string, any>): string {
    const timestamp = new Date().getTime()
    let url = `${process.env['HOST']}/api/frames/${frameName}/image?timestamp=${timestamp}`

    // Loop through each param
    for (const key of params.keys()) {
        if (!url.includes('?')) {
            url += '?'
        } else {
            url += '&'
        }

        url += `${key}=${params[key]}`
    }
    return url
}