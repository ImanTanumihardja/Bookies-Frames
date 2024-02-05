
export type Event = { 
    startDate: number;
    poll: number[]; 
    voted: Record<number, {prediction: number, timeStamp: number}>; 
    result: number }

export type User = {
    fid: number;
    points: number;
}