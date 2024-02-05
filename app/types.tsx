export type Event = { 
    startDate: number;
    poll: Map<string, number>; 
    voted: Map<number, number>; 
    result: number }