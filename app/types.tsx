export type Event = { 
    startDate: number;
    poll: number[]; 
    voted: Record<string, any>; 
    result: number }