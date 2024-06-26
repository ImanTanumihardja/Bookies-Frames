'use client'

import { useFormState, useFormStatus } from "react-dom";
import { createMarketAction } from "../../app/actions";
import { CldUploadWidget } from 'next-cloudinary';
import { DEGEN_ADDRESS, USDC_ADDRESS } from "@addresses";
import { ChangeEvent, useState } from 'react';
import { Accounts } from '@utils/constants';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="admin-button" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Creating..." : "Create"}
    </button>
  );
}

export function CreateMarketForm() {
  const [state, formAction] = useFormState(createMarketAction, { message: "" });
  const [host, setHost] = useState("bookies");

  if (state.message !== "") {
    alert(state.message);
    state.message = "";
  }

  const handleHostChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setHost(e.target.value);
  };

  return (
    <div className="font-body">
      <h1 className="admin-heading">Create Market</h1>
      <form action={formAction}>
        <label htmlFor="marketId">Market Id </label>
        <input type="text" id="marketId" name="marketId" placeholder="lal-lac-ml" required />
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
          <option value={Accounts.ALEA}>Alea</option>
          <option value={Accounts.BOOKIES}>Bookies</option>
          <option value={Accounts.BOTH}>Both</option>
        </select>
        <br />
        <br />
        {(host === Accounts.BOOKIES || host === Accounts.BOTH) && (
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
        <input type="hidden" id="creator" name="creator" value={host === Accounts.ALEA ? 391387 : 244367} />
        <SubmitButton />
      </form>
      <br />
      <CldUploadWidget uploadPreset="thumbnails" signatureEndpoint={"../api/sign-image"}>
        {({ open }) => {
          return (
            <button className="admin-button" type="button" onClick={() => open()}>
              Upload Thumbnail
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
