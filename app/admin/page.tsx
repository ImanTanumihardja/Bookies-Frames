'use client'
import {CreateEventForm} from './createEvent-form';
import {SettleEventForm} from './settleEvent-form';
import {GetEventForm} from './getEvent-form';

export default function Page() {

  return (
    <main>
      <GetEventForm />
      <CreateEventForm />
      <SettleEventForm />
    </main>
  )
}