
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
    latestBet: Bet
}

export type Bet = {
    eventName: string
    wagerAmount: number
    prediction: number
    timeStamp: number
}