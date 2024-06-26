'use client'

import { useFormState, useFormStatus } from "react-dom";
import { settleMarketAction } from "../../app/actions"

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    !pending &&
    <button className="admin-button" type="submit" aria-disabled={pending}>
      Settle
    </button>
  );
}

export function SettleMarketForm({marketId, options}: {marketId: string, options: string[]}) {
  const settleMarketActionWithMarketId = settleMarketAction.bind(null, marketId)
  const [state, formAction] = useFormState(settleMarketActionWithMarketId, {message: ""});

  if (state.message !== "") 
  {
    alert(state.message)
    state.message = ""
  }
  return (
    <div>
      <h1 className="admin-heading">Settle Market</h1>
      <form action={formAction}>
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
