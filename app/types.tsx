
export type Market = { 
    startDate: number;
    result: number 
    odds : number[]
    options: string[]
    prompt: string
    host: string
    address: string
    creator: number
    rules: string
}

export type User = {
    balance: number;
    streak: number;
    wins: number;
    losses: number;
    numBets: number;
    hasClaimed: boolean;
    bets: Record<string, Bet[]>;
}

export type UserType ={
    address: string
    fid: number
    username: string
    pfpUrl: string
}

export type Bet = {
    stake: number
    odd: number
    pick: number
    timeStamp: number
    settled: boolean
}

export type FrameValidationData = {
    button: number;
    following: boolean;
    followingHost: boolean; // Check if following Bookies
    input: string;
    fid: number;
    custodyAddress: string;
    verifiedAccounts: string[];
    liked: boolean;
    recasted: boolean;
    transactionId: string;
    connectedAddress: number;
    casterFID: number;
}

export type MarketData = {
    startDate: number;
    result: number 
    odds : number[]
    options: string[]
    prompt: string
    host: string
    address: string
    creator: number
    rules: string
    aleaBettors: string[];
    bookiesBettors: string[];
    pollData: number[];
    orderBookieInfo: {
        eventID: string;
        result: number;
        startDate: number;
        isCancelled: boolean;
        owner: string;
        factoryAddress: string;
        settlementManagerAddress: string;
        acceptedTokenAddress: string;
        totalStakedOutcome1: number;
        totalStakedOutcome2: number;
        totalUnfilledOutcome1: number;
        totalUnfilledOutcome2: number;
        bettors: string[];
    }
}