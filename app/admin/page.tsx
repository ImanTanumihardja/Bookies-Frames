'use client'
import { Container } from '@chakra-ui/react';
import {CreateEventForm} from '@components/modules/CreateEventForm';
import {GetEventForm} from '@components/modules/GetEventForm';


export default function Page() {

  return (
    <Container maxW="container.md" p={3} marginTop={25} as="main" minH="70vh">
      <GetEventForm />
      <CreateEventForm />
    </Container>
  )
}

export const maxDuration = 300;
