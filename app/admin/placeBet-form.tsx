'use client'

import { useFormState, useFormStatus } from "react-dom";
import { placeBetAction } from "../actions"

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending}>
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
      <h1>Place Bet</h1>
      <form action={placeBetFormAction}>
        <label htmlFor="bettor">Bettor Address </label>
        <input type="string" id="bettor" name="bettor" required />
        <br />
        <br />
        <label htmlFor="orderBookie">OrderBookie Address </label>
        <input type="string" id="orderBookie" name="orderBookie" required />
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
        <label htmlFor="odd">Odd </label>
        <input type="number" id="odd" name="odd"  min="0" max="1" step="0.0001" required />
        <br />
        <br />
        <SubmitButton />
      </form>
    </div>
  );
}
