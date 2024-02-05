
export type Event = { 
    startDate: number;
    poll: number[]; 
    bets: Record<number, Bet>; 
    result: number }

export type User = {
    fid: number;
    points: number;
    streak: number;
}

export type Bet = {
    wagerAmount: number
    prediction: number
    timeStamp: number
}