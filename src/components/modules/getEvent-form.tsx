'use client'

import { useFormState, useFormStatus } from "react-dom";
import {getEventAction} from "../../../app/actions"
import {SettleEventForm} from './settleEvent-form';
import {PlaceBetForm} from './placeBet-form';

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

export function GetEventForm() {
  const [eventstate, getEventFormAction] = useFormState(getEventAction, {message: "", eventName:"", eventData: null, isAlea: true, isBookies: true});

  return (
    <div className="font-body">
      <h1 className="admin-heading">Get Event</h1>
      <form action={getEventFormAction}>
        <label htmlFor="eventName">Event Name </label>
        <input type="text" id="eventName" name="eventName" required />
        <SubmitButton />
      </form>
      {eventstate.eventData &&
        <div>
          <p>Start Date: {(new Date(parseInt(eventstate.eventData?.startDate?.toString() || '') * 1000)).toString()}</p>
          <p>Prompt: {eventstate.eventData.prompt}</p>
          <p>Host: {eventstate.eventData.host}</p>
          <p>Result: {eventstate?.isAlea ? eventstate.eventData.result : eventstate.eventData.orderBookieInfo?.result}</p>
          <div>Options: 
            <ul>{eventstate.eventData?.options?.map((option:string, index:number) => 
              <li key={index}>
                {`${option} (odd=${eventstate.eventData?.odds?.[index]}) (votes=${eventstate.eventData?.pollData?.[index]})`}
              </li>)}
            </ul>
          </div>
          { eventstate?.isAlea && 
          <div>
            <p>Alea Bettors(n={eventstate.eventData.aleaBettors.length}): {eventstate.eventData.aleaBettors.join(', ')}</p>
            <SettleEventForm eventName={eventstate.eventName} options={eventstate.eventData.options}/>
          </div>
          }
          { 
          eventstate?.isBookies && eventstate.eventData.orderBookieInfo && 
          <>
            <p>OrderBookie Address: {eventstate.eventData.address}</p>
            <p>Bookies Bettors(n={eventstate.eventData.bookiesBettors.length}): {eventstate.eventData.bookiesBettors.join(', ')}</p> 
            <p>Option 1 Stake: {eventstate.eventData.orderBookieInfo.totalStakedOutcome1}</p>
            <p>Option 2 Stake: {eventstate.eventData.orderBookieInfo.totalStakedOutcome2}</p>
            <p>Option 1 Unfilled: {eventstate.eventData.orderBookieInfo.totalUnfilledOutcome1}</p>
            <p>Option 2 Unfilled: {eventstate.eventData.orderBookieInfo.totalUnfilledOutcome2}</p>

            <PlaceBetForm eventName={eventstate.eventName} options={eventstate.eventData.options}/>
          </>
          }
        </div>}
    </div>
  );
}
