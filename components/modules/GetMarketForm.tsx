'use client'

import { useFormState, useFormStatus } from "react-dom";
import {getMarketAction} from "../../app/actions"
import {SettleMarketForm} from './SettleMarketForm';
import {PlaceBetForm} from './PlaceBetForm';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    (
      <button className="admin-button ml-2.5" type="submit" aria-disabled={pending}>
        Get Event
      </button>
    )
  );
}

export function GetMarketForm() {
  const [marketState, getMarketFormAction] = useFormState(getMarketAction, {message: "", marketId:"", marketData: null, isAlea: true, isBookies: true});

  return (
    <div className="font-body">
      <h1 className="admin-heading">Get Market</h1>
      <form action={getMarketFormAction}>
        <label htmlFor="marketId">Market Id </label>
        <input type="text" id="marketId" name="marketId" required />
        <SubmitButton />
      </form>
      {marketState.marketData &&
        <div>
          <p>Start Date: {(new Date(parseInt(marketState.marketData?.startDate?.toString() || '') * 1000)).toString()}</p>
          <p>Prompt: {marketState.marketData.prompt}</p>
          <p>Host: {marketState.marketData.host}</p>
          <p>Result: {marketState?.isAlea ? marketState.marketData.result : marketState.marketData.orderBookieInfo?.result}</p>
          <div>Options: 
            <ul className="ml-10">{marketState.marketData?.options?.map((option:string, index:number) => 
              <li key={index}>
                {`${option} (odd=${marketState.marketData?.odds?.[index]}) (votes=${marketState.marketData?.pollData?.[index]})`}
              </li>)}
            </ul>
          </div>
          { marketState?.isAlea && 
          <div>
            <p>Alea Bettors(n={marketState.marketData.aleaBettors.length}): {marketState.marketData.aleaBettors.join(', ')}</p>
            <SettleMarketForm marketId={marketState.marketId} options={marketState.marketData.options}/>
          </div>
          }
          { 
          marketState?.isBookies && marketState.marketData.orderBookieInfo && 
          <>
            <p>OrderBookie Address: {marketState.marketData.address}</p>
            <p>Bookies Bettors(n={marketState.marketData.bookiesBettors.length}): {marketState.marketData.bookiesBettors.join(', ')}</p> 
            <p>Option 1 Stake: {marketState.marketData.orderBookieInfo.totalStakedOutcome1}</p>
            <p>Option 2 Stake: {marketState.marketData.orderBookieInfo.totalStakedOutcome2}</p>
            <p>Option 1 Unfilled: {marketState.marketData.orderBookieInfo.totalUnfilledOutcome1}</p>
            <p>Option 2 Unfilled: {marketState.marketData.orderBookieInfo.totalUnfilledOutcome2}</p>

            <PlaceBetForm marketId={marketState.marketId} options={marketState.marketData.options}/>
          </>
          }
        </div>}
    </div>
  );
}
