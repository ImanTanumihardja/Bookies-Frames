
export type Event = { 
    startDate: number;
    result: number 
    odds : number[]
    options: string[]
    prompt: string
    host: string
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
    transactionId: number;
    connectedAddress: number;
}