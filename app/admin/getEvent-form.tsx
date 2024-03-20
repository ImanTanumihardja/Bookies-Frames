'use client'

import { useFormState, useFormStatus } from "react-dom";
import {getEventAction} from "../actions"

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
  
  return (
    <div>
      <h1>Get Event</h1>
      <form action={formAction}>
        <label htmlFor="eventName">Event Name</label>
        <input type="text" id="eventName" name="eventName" required />
        <SubmitButton />
      </form>
      {state.eventData &&
        <div>
          <h2>Event Data</h2>
          <p>Event Name: {state.eventName}</p>
          <p>Start Date: {(new Date(parseInt(state.eventData?.startDate?.toString() || ''))).toString()}</p>
          <p>Multiplier: {state.eventData.multiplier}</p>
          <p>Prompt: {state.eventData.prompt}</p>
          <p>Host: {state.eventData.host}</p>
          <p>Result: {state.eventData.result}</p>
          <div>Options: 
            <ul>{state.eventData?.options?.map((option:string, index:number) => 
              <li key={index}>
                {`${option} (odd=${state.eventData?.odds?.[index]}) (votes=${state.eventData?.pollData?.[index]})`}
              </li>)}
            </ul>
          </div>
          <p>Bettors(n={state.eventData.bettors.length}): {state.eventData.bettors.toString()}</p>
        </div>    
      }
    </div>
  );
}
