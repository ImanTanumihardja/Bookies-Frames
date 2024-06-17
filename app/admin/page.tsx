'use client'
import {CreateEventForm} from '@components/modules/CreateEventForm';
import {GetEventForm} from '@components/modules/GetEventForm';


export default function Page() {

  return (
    <main>
      <GetEventForm />
      <CreateEventForm />
    </main>
  )
}

export const maxDuration = 300;
