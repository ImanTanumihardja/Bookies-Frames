'use client'

import { useFormState, useFormStatus } from "react-dom";
import {createEventAction} from "../actions"

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending}>
      Create
    </button>
  );
}

export function CreateEventForm() {
  const [state, formAction] = useFormState(createEventAction, {message: ""});

  if (state.message !== "") 
  {
    alert(state.message)
    state.message = ""
  }

  return (
    <div>
      <h1>Create Event</h1>
      <form action={formAction}>
        <label htmlFor="eventName">Event Name</label>
        <input type="text" id="eventName" name="eventName" required />
        <label htmlFor="startDate">Start Date</label>
        <input type="number" id="startDate" name="startDate" required />
        <label htmlFor="odds">Odds</label>
        <input type="text" id="odds" name="odds" required />
        <label htmlFor="multiplier">Multiplier</label>
        <input type="number" id="multiplier" name="multiplier" required />
        <label htmlFor="options">Options</label>
        <input type="text" id="options" name="options" required />
        <label htmlFor="prompt">Prompt</label>
        <input type="text" id="prompt" name="prompt" required />
        <SubmitButton />
      </form>
    </div>
  );
}
