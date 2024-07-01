// Page that returns a frame
import { Frame, getFrame, getFrameFlattened } from "frames.js";
import type { Metadata } from "next";
import {GET} from '../../api/bookies/[eventName]/route'
import { NextRequest } from "next/server";
import { Accounts, ALEA_FID, BOOKIES_FID, ODDS_DECIMALS, PICK_DECIMALS, RequestProps } from "@utils/constants";
import { generateUrl, neynarClient } from "@utils";
import getMarket from "@scripts/getMarket";
import { MarketData } from "@types";
import InnerMarket from "@components/InnerMarket";
import {ethers} from 'ethers';
import {orderBookieABI, erc20ABI} from '@abis';
import { kv } from "@vercel/kv";
const axios = require('axios');

// Export Next.js metadata
export async function generateMetadata({ params: { marketId, odds } }: { params: { marketId: string, odds: number[] }; }): Promise<Metadata> {
    // Get the frame html from the GET function
    const url = generateUrl(`api/${Accounts.BOOKIES}/${marketId}`, {[RequestProps.ODDS]: odds}, false)
    const req : NextRequest = new NextRequest(url);
    const response = await GET(req, {params: {marketId: marketId}});
    const htmlString = await response.text();
    const frame:Frame = getFrame({htmlString: htmlString, url:url.toString()}).frame as Frame;
    const flattenedFrame = getFrameFlattened(frame);

    return {
        title: marketId,
        description: "Place your bets!",
        other: flattenedFrame as { [name: string]: string | number | (string | number)[] }
    };
};

export default async function MarketPage({ params: { marketId } }: { params: { marketId: string }; }) {
    // Get market data
    const marketData: MarketData = await getMarket(marketId)

    const creatorProfile = (await neynarClient.fetchBulkUsers([marketData.creator])).users.map((profile:any) => profile)[0]
    const creatorPFPUrl  = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/${encodeURI(creatorProfile.pfp_url)}` 

    const url = `https://api.basescan.org/api?module=account&action=txlistinternal&address=${marketData.address}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.BASESCAN_API_KEY}`;
    const response = await axios.get(url);
    const transactions = response.data.result;

    let creationTx = null
    if (transactions.length > 0) 
    {
        creationTx = transactions.find(tx => tx.to === '');
    } 

    // Get orderbookie contract
    const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);
    const orderBookie = new ethers.Contract(marketData.address, orderBookieABI, provider)
    const orderBookieInfo = await orderBookie.getBookieInfo()

    const acceptedToken = new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider);
    const decimals = await acceptedToken.decimals();
    const symbol = await acceptedToken.symbol();

     // Find payout transaction hash
     const filter = {
        address: marketData.address,
        fromBlock: 0,
        toBlock: 'latest'
    };

    const logs = await provider.getLogs(filter);
    const placedBetLogs = logs.filter(log => {
        const parsedLog = orderBookie.interface.parseLog(log);
        return parsedLog?.name === 'PlacedBet';
    }).reverse().slice(0, 10);

    let placedBetTxns = await Promise.all(placedBetLogs.map(async (log) => {
        const parsedLog = orderBookie.interface.parseLog(log);

        const bettor = parsedLog.args.bettor
        const stake = parseFloat(ethers.formatUnits(parsedLog.args.stake, decimals));
        const pick = parseFloat(ethers.formatUnits(parsedLog.args.pick, PICK_DECIMALS));
        const odd = parseFloat(ethers.formatUnits(parsedLog.args.odd, ODDS_DECIMALS));

        // Get profile if possible
        const fid = (await kv.hget(bettor, "fid")) as number
        let profile;
        let pfpUrl;
        if (fid !== null) {
            profile = (await neynarClient.fetchBulkUsers([fid])).users.map((profile:any) => profile)[0]
            pfpUrl = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168,h_168/${encodeURI(profile.pfp_url)}`
        }

        return {
            bettor: {
                address: bettor,
                fid: profile?.fid,
                username: profile?.username,
                displayName: profile?.display_name,
                pfpUrl: pfpUrl
            },
            stake: stake,
            pick: pick,
            odd: odd,
            timestamp: parseInt(parsedLog.args.timeStamp),
            txnHash: log.transactionHash
        };
    }));

    // Filter out alea and bookies bets
    placedBetTxns = placedBetTxns.filter(txn => txn.bettor.fid !== ALEA_FID && txn.bettor.fid !== BOOKIES_FID);
    
    return(
        <InnerMarket
            marketId={marketId}
            prompt={marketData?.prompt} 
            options={marketData?.options}
            odds={marketData.odds}
            startDate={marketData?.startDate}
            creator={{
                address: "",
                username: creatorProfile?.username,
                displayName: creatorProfile?.display_name,
                pfpUrl: creatorPFPUrl,
                fid: creatorProfile?.fid}}
            outcome1Staked={marketData?.orderBookieInfo.totalStakedOutcome1}
            outcome2Staked={marketData?.orderBookieInfo.totalStakedOutcome2}
            totalStaked={marketData?.orderBookieInfo.totalStakedOutcome1 + marketData?.orderBookieInfo.totalStakedOutcome2}
            address={marketData.address}
            rules={marketData.rules}
            umaTxn={creationTx.hash}
            placedBetTxns={placedBetTxns}
            symbol={symbol}/>
    );
}

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';