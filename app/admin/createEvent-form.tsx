'use client'

import { useFormState, useFormStatus } from "react-dom";
import {createEventAction} from "../actions"
import { CldUploadWidget } from 'next-cloudinary';

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
        <input type="text" id="eventName" name="eventName" placeholder="lal-lac-ml" required />
        <label htmlFor="startDate">Start Date (Unix)</label>
        <input type="number" id="startDate" name="startDate" placeholder="1709777045000" required />
        <label htmlFor="odds">Odds</label>
        <input type="text" id="odds" name="odds" placeholder="0.5, 0.5" required />
        <label htmlFor="multiplier">Multiplier</label>
        <input type="number" id="multiplier" name="multiplier" placeholder='1' required />
        <label htmlFor="options">Options</label>
        <input type="text" id="options" name="options" placeholder="LAL, LAC" required />
        <label htmlFor="prompt">Prompt</label>
        <input type="text" id="prompt" name="prompt" placeholder="Lakers vs Clippers" required />
        <SubmitButton />

        <CldUploadWidget uploadPreset="thumbnails">
        {({ open }) => {
          return (
            <button onClick={() => open()}>
              Upload Thumbnail
            </button>
          );
        }}
      </CldUploadWidget>
      </form>
    </div>
  );
}
