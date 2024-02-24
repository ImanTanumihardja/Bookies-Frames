
export type Event = { 
    startDate: number;
    result: number 
    odds : number[]
    multiplier: number
    options: string[]
    prompt: string
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
    followingBookies: boolean; // Check if following Bookies
    input: string;
    fid: number;
    custody_address: string;
    verified_accounts: string[];
    liked: boolean;
    recasted: boolean;
}