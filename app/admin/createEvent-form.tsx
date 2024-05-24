'use client'

import { useFormState, useFormStatus } from "react-dom";
import { createEventAction } from "../actions";
import { CldUploadWidget } from 'next-cloudinary';
import { DEGEN_ADDRESS, USDC_ADDRESS } from "../json/addresses.json";
import { ChangeEvent, useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Creating..." : "Create"}
    </button>
  );
}

export function CreateEventForm() {
  const [state, formAction] = useFormState(createEventAction, { message: "" });
  const [host, setHost] = useState("bookies");

  if (state.message !== "") {
    alert(state.message);
    state.message = "";
  }

  const handleHostChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setHost(e.target.value);
  };

  return (
    <div>
      <h1>Create Event</h1>
      <form action={formAction}>
        <label htmlFor="eventName">Event Name </label>
        <input type="text" id="eventName" name="eventName" placeholder="lal-lac-ml" required />
        <br />
        <br />
        <label htmlFor="startDate">Start Date (Unix) </label>
        <input type="number" id="startDate" name="startDate" placeholder="1709777045" required />
        <br />
        <br />
        <label htmlFor="odds">Odds </label>
        <input type="text" id="odds" name="odds" placeholder="0.5, 0.5" required />
        <br />
        <br />
        <label htmlFor="options">Options </label>
        <input type="text" id="options" name="options" placeholder="LAL, LAC" required />
        <br />
        <br />
        <label htmlFor="prompt">Prompt </label>
        <input type="text" id="prompt" name="prompt" placeholder="Lakers vs Clippers" required />
        <br />
        <br />
        <label htmlFor="host">Host </label>
        <select id="host" name="host" value={host} onChange={handleHostChange}>
          <option value="alea">Alea</option>
          <option value="bookies">Bookies</option>
          <option value="both">Both</option>
        </select>
        <br />
        <br />
        {(host === 'bookies' || host === 'both') && (
          <>
            <label htmlFor="description">Description (*bookies only*) </label>
            <input type="text" id="description" name="description" />
            <br />
            <br />
            <label htmlFor="acceptedToken">Accepted Token (*bookies only*) </label>
            <select id="acceptedToken" name="acceptedToken">
              <option value={USDC_ADDRESS}>USDC</option>
              <option value={DEGEN_ADDRESS}>DEGEN</option>
            </select>
            <br />
            <br />
          </>
        )}
        <SubmitButton />
      </form>
      <br />
      <CldUploadWidget uploadPreset="thumbnails" signatureEndpoint={"../api/sign-image"}>
        {({ open }) => {
          return (
            <button type="button" onClick={() => open()}>
              Upload Thumbnail
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
