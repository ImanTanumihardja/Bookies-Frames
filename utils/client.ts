export function formatImpliedProbability(impliedProbability: number):string {
    if (impliedProbability <= 0 || impliedProbability >= 1) {
      throw new Error('Implied probability must be between 0 and 1 (exclusive).');
    }

    let americanOdds = 0;
  
    if (impliedProbability <= 0.5) {
        americanOdds =
            Math.round((10000 - ((impliedProbability * 100) * 100))/(impliedProbability * 100));
    }
    else {
        americanOdds =
            Math.round(((impliedProbability * 100) * 100) / (100 - (impliedProbability * 100)));
    }
  
    return (impliedProbability > 0.5 ? '-' : '+') + americanOdds.toString();
}

export function calculatePayout(impliedProbability: number, stake: number){
    const payout = (1 / impliedProbability) * (stake)
    return payout
}