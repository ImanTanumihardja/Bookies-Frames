'use client'
import {CreateEventForm} from '../../src/components/modules/createEvent-form';
import {GetEventForm} from '../../src/components/modules/getEvent-form';


export default function Page() {

  return (
    <main>
      <GetEventForm />
      <CreateEventForm />
    </main>
  )
}

export const maxDuration = 300;
