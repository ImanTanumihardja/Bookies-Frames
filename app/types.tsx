
export type Event = { 
    startDate: number;
    poll: number[]; 
    bets: Record<number, Bet>; 
    result: number 
    odds : number[]
    multiplier: number
    options: string[]
    prompt: string
}

// Old User type
// export type User = {
//     points: number;
//     streak: number;
//     wins: number;
//     losses: number;
//     numBets: number;
//     hasClaimed: boolean;
// }

export type User = {
    balance: number;
    availableBalance: number;
    streak: number;
    wins: number;
    losses: number;
    numBets: number;
    hasClaimed: boolean;
    bets: string[]
}

export type Bet = {
    stake: number
    odd: number
    prediction: number
    timeStamp: number
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