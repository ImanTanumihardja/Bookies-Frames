export function formatOdd(impliedProbability: number):string {
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

export function parseOdd(odd: string):number {
    let impliedProbability;

    if (odd[0] === '-') {
        // Negative American odds
        const odds = parseInt(odd.slice(1));
        impliedProbability = odds / (odds + 100);
    } else {
        // Positive American odds
        const odds = parseInt(odd[0] === '+' ? odd.slice(1) : odd);
        impliedProbability = 100 / (odds + 100);
    }

    return parseFloat(impliedProbability.toFixed(4));
}

export function calculatePayout(impliedProbability: number, stake: number){
    const payout = (1 / impliedProbability) * (stake)
    return payout
}

export function formatCompactNumber(number) {
    if (number < 1000) {
      return number;
    } else if (number >= 1000 && number < 1_000_000) {
      return (number / 1000).toFixed(1) + "K";
    } else if (number >= 1_000_000 && number < 1_000_000_000) {
      return (number / 1_000_000).toFixed(1) + "M";
    } else if (number >= 1_000_000_000 && number < 1_000_000_000_000) {
      return (number / 1_000_000_000).toFixed(1) + "B";
    } else if (number >= 1_000_000_000_000 && number < 1_000_000_000_000_000) {
      return (number / 1_000_000_000_000).toFixed(1) + "T";
    }
}

export function formatTimeAgo(timestamp: number): string{
    const now = new Date().getTime() / 1000;
    const elapsedSeconds = Math.ceil(now - timestamp);
    let timeAgo;
    if (elapsedSeconds < 60) {
        timeAgo = `${elapsedSeconds} seconds ago`;
    } else if (elapsedSeconds < 3600) {
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);
        timeAgo = `${elapsedMinutes} minutes ago`;
    } else if (elapsedSeconds < 86400) {
        const elapsedHours = Math.floor(elapsedSeconds / 3600);
        timeAgo = `${elapsedHours} hours ago`;
    }
    else {
        const elapsedDays = Math.floor(elapsedSeconds / 86400);
        timeAgo = `${elapsedDays} days ago`;
    }

    return timeAgo;
}