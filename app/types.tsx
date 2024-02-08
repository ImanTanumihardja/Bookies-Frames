
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

export type Bet = {
    eventName: string
    wagerAmount: number
    prediction: number
    timeStamp: number
}

export type FarcasterProfile = {
    fid: number;
    custodyAddress: string;
    username: string;
    displayName: string;
    pfp: {
      url: string;
    };
    profile: {
      bio: object[]; // Adjust the type accordingly
      // Add other properties if needed
    };
    followerCount: number;
    followingCount: number;
    verifications: string[];
    activeStatus: "active" | "inactive"; // Assuming activeStatus can be one of these values
    timestamp: string;
  };

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