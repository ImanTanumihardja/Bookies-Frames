'use client'

import { useFormState, useFormStatus } from "react-dom";
import { placeBetAction } from "../actions"

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    !pending &&
    <button className="admin-button" type="submit" aria-disabled={pending}>
      Place Bet
    </button>
  );
}

export function PlaceBetForm() {

  const [placeBetState, placeBetFormAction] = useFormState(placeBetAction, {message: ""});

  if (placeBetState.message !== "") 
  {
    alert(placeBetState.message)
    placeBetState.message = ""
  }

  return (
    <div>
      <h1 className="admin-heading">Place Bet</h1>
      <form action={placeBetFormAction}>
        <label htmlFor="bettor">Bettor Address </label>
        <input type="string" id="bettor" name="bettor" required />
        <br />
        <br />
        <label htmlFor="eventName">Event Name </label>
        <input type="string" id="eventName" name="eventName" required />
        <br />
        <br />
        <label htmlFor="fid">FID </label>
        <input type="number" id="fid" name="fid" required />
        <br />
        <br />
        <label htmlFor="stake">Stake </label>
        <input type="number" id="stake" name="stake" required />
        <br />
        <br />
        <label htmlFor="pick">Pick </label>
        <select id="pick" name="pick">
          <option value="0">Option 1</option>
          <option value="1">Option 2</option>
        </select>
        <br />
        <br />
        <SubmitButton />
      </form>
    </div>
  );
}
