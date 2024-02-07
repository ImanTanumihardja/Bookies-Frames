
export type Event = { 
    startDate: number;
    poll: number[]; 
    bets: Record<number, Bet>; 
    result: number }

export type User = {
    points: number;
    streak: number;
    wins: number;
    losses: number;
    numBets: number;
    hasClaimed: boolean;
}

export const DEFAULT_USER: User = {
    points: 0,
    streak: 0,
    wins: 0,
    losses: 0,
    numBets: 0,
    hasClaimed: false,
}

export type Bet = {
    eventName: string
    wagerAmount: number
    prediction: number
    timeStamp: number
}

export const DEFAULT_BET: Bet = {
    eventName: "",
    wagerAmount: 0,
    prediction: -1,
    timeStamp: 0
}