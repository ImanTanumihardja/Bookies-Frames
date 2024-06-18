'use client'

import { useFormState, useFormStatus } from "react-dom";
import {settleEventAction} from "../../app/actions"

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    !pending &&
    <button className="admin-button" type="submit" aria-disabled={pending}>
      Settle
    </button>
  );
}

export function SettleEventForm({eventName, options}: {eventName: string, options: string[]}) {
  const [state, formAction] = useFormState(settleEventAction, {message: ""});

  if (state.message !== "") 
  {
    alert(state.message)
    state.message = ""
  }
  return (
    <div>
      <h1 className="admin-heading">Settle Event</h1>
      <form action={formAction}>
        <input type="hidden" id="eventName" name="eventName" value={eventName} />
        <label htmlFor="result">Result </label>
        <select id="result" name="result">
          <option value="0">{options[0]}</option>
          <option value="1">{options[1]}</option>
        </select>
        <br />
        <br />
        <SubmitButton />
      </form>
    </div>
  );
}
