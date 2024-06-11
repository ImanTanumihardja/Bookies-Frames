'use client'

import { useFormState, useFormStatus } from "react-dom";
import {settleEventAction} from "../../../app/actions"

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    !pending &&
    <button className="admin-button" type="submit" aria-disabled={pending}>
      Settle
    </button>
  );
}

export function SettleEventForm({eventName}: {eventName: string}) {
  const [state, formAction] = useFormState(settleEventAction, {message: ""});

  if (state.message !== "") 
  {
    alert(state.message)
    state.message = ""
  }
  return (
    <div>
      <h1 className="text-lg md:text-2xl lg:text-3xl font-bold mb-5 mt-10">Settle Event</h1>
      <form action={formAction}>
        <input type="hidden" id="eventName" name="eventName" value={eventName} />
        <label htmlFor="result">Result </label>
        <input type="decimal" id="result" name="result" required />
        <br />
        <br />
        <SubmitButton />
      </form>
    </div>
  );
}
