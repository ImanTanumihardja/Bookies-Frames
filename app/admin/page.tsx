'use client'
import {CreateEventForm} from './createEvent-form';
import {SettleEventForm} from './settleEvent-form';
import {GetEventForm} from './getEvent-form';
import {PlaceBetForm} from './placeBet-form';

export default function Page() {

  return (
    <main>
      <GetEventForm />
      <CreateEventForm />
      <SettleEventForm />
      <PlaceBetForm />
    </main>
  )
}

export const maxDuration = 300;
