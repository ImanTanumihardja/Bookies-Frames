'use client'

import { useFormState, useFormStatus } from "react-dom";
import {getEventAction, placeBetAction} from "../actions"
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
  const [eventstate, getEventFormAction] = useFormState(getEventAction, {message: "", eventName:"", eventData: null});

  const [placeBetState, placeBetFormAction] = useFormState(placeBetAction, {message: ""});
  
  let isBookies = true;
  let isAlea = true;

  if (eventstate.eventData) {
    isBookies = eventstate.eventData.host === Accounts.BOOKIES || eventstate.eventData.host === Accounts.BOTH;
    isAlea = eventstate.eventData.host === Accounts.ALEA || eventstate.eventData.host === Accounts.BOTH;
  }

  if (placeBetState.message !== "") 
    {
      alert(placeBetState.message)
      placeBetState.message = ""
    }

  return (
    <div>
      <h1>Get Event</h1>
      <form action={getEventFormAction}>
        <label htmlFor="eventName">Event Name </label>
        <input type="text" id="eventName" name="eventName" required />
        <SubmitButton />
      </form>
      {eventstate.eventData &&
        <div>
          <h2>Event Data</h2>
          <p>Event Name: {eventstate.eventName}</p>
          <p>Start Date: {(new Date(parseInt(eventstate.eventData?.startDate?.toString() || '') * 1000)).toString()}</p>
          <p>Prompt: {eventstate.eventData.prompt}</p>
          <p>Host: {eventstate.eventData.host}</p>
          <p>Result: {isAlea ? eventstate.eventData.result : eventstate.eventData.orderBookieInfo?.result}</p>
          <div>Options: 
            <ul>{eventstate.eventData?.options?.map((option:string, index:number) => 
              <li key={index}>
                {`${option} (odd=${eventstate.eventData?.odds?.[index]}) (votes=${eventstate.eventData?.pollData?.[index]})`}
              </li>)}
            </ul>
          </div>
          { isAlea && <p>Alea Bettors(n={eventstate.eventData.aleaBettors.length}): {eventstate.eventData.aleaBettors.join(', ')}</p>}
          { isBookies && eventstate.eventData.orderBookieInfo && 
          <>
            <p>OrderBookie Address: {eventstate.eventData.address}</p>
            <p>Bookies Bettors(n={eventstate.eventData.bookiesBettors.length}): {eventstate.eventData.bookiesBettors.join(', ')}</p> 
            <p>Option1 Stake: {eventstate.eventData.orderBookieInfo.totalStakedOutcome1}</p>
            <p>Option2 Stake: {eventstate.eventData.orderBookieInfo.totalStakedOutcome2}</p>
            <p>Option1 Unfilled: {eventstate.eventData.orderBookieInfo.totalUnfilledOutcome1}</p>
            <p>Option2 Unfilled: {eventstate.eventData.orderBookieInfo.totalUnfilledOutcome2}</p>
          </>
          }
        </div>}
    </div>
  );
}
