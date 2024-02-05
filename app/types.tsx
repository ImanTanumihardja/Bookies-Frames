export type Event = { 
    poll: Map<string, number>; 
    voted: Map<number, number>; 
    result: number }