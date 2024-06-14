'use client'
import {CreateEventForm} from '@components/modules/createEvent-form';
import {GetEventForm} from '@components/modules/getEvent-form';


export default function Page() {

  return (
    <main>
      <GetEventForm />
      <CreateEventForm />
    </main>
  )
}

export const maxDuration = 300;
