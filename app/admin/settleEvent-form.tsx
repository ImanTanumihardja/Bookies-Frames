'use client'

import { useFormState, useFormStatus } from "react-dom";
import {settleEventAction} from "../actions"

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending}>
      Settle
    </button>
  );
}

export function SettleEventForm() {
  const [state, formAction] = useFormState(settleEventAction, {message: ""});

  if (state.message !== "") 
  {
    alert(state.message)
    state.message = ""
  }
  return (
    <div>
      <h1>Settle Event</h1>
      <form action={formAction}>
        <label htmlFor="eventName">Event Name </label>
        <input type="text" id="eventName" name="eventName" required />
        <br />
        <br />
        <label htmlFor="result">Result </label>
        <input type="decimal" id="result" name="result" required />
        <br />
        <br />
        <SubmitButton />
      </form>
    </div>
  );
}
