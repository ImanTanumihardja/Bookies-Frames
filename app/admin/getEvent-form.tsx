'use client'

import { useFormState, useFormStatus } from "react-dom";
import {getEventAction} from "../actions"
import { Accounts } from "../../src/utils";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending}>
      Get Event
    </button>
  );
}

export function GetEventForm() {
  const [state, formAction] = useFormState(getEventAction, {message: "", eventName:"", eventData: null});
  
  let isBookies = true;
  let isAlea = true;
  if (state.eventData) {
    isBookies = state.eventData.host === Accounts.BOOKIES || state.eventData.host === Accounts.BOTH;
    isAlea = state.eventData.host === Accounts.ALEA || state.eventData.host === Accounts.BOTH;
  }

  return (
    <div>
      <h1>Get Event</h1>
      <form action={formAction}>
        <label htmlFor="eventName">Event Name </label>
        <input type="text" id="eventName" name="eventName" required />
        <SubmitButton />
      </form>
      {state.eventData &&
        <div>
          <h2>Event Data</h2>
          <p>Event Name: {state.eventName}</p>
          <p>Start Date: {(new Date(parseInt(state.eventData?.startDate?.toString() || '') * 1000)).toString()}</p>
          <p>Prompt: {state.eventData.prompt}</p>
          <p>Host: {state.eventData.host}</p>
          <p>Result: {isAlea ? state.eventData.result : state.eventData.orderBookieInfo?.result}</p>
          <div>Options: 
            <ul>{state.eventData?.options?.map((option:string, index:number) => 
              <li key={index}>
                {`${option} (odd=${state.eventData?.odds?.[index]}) (votes=${state.eventData?.pollData?.[index]})`}
              </li>)}
            </ul>
          </div>
          { isAlea && <p>Alea Bettors(n={state.eventData.aleaBettors.length}): {state.eventData.aleaBettors.join(', ')}</p>}
          { isBookies && state.eventData.orderBookieInfo && 
          <>
            <p>OrderBookie Address: {state.eventData.address}</p>
            <p>Bookies Bettors(n={state.eventData.bookiesBettors.length}): {state.eventData.bookiesBettors.join(', ')}</p> 
            <p>Outcome1 Stake: {state.eventData.orderBookieInfo.totalStakedOutcome1}</p>
            <p>Outcome2 Stake: {state.eventData.orderBookieInfo.totalStakedOutcome2}</p>
            <p>Outcome1 Unfilled: {state.eventData.orderBookieInfo.totalUnfilledOutcome1}</p>
            <p>Outcome2 Unfilled: {state.eventData.orderBookieInfo.totalUnfilledOutcome2}</p>
          </>
          }
        </div>    
      }
    </div>
  );
}
