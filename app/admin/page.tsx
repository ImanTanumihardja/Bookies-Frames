'use client'
import { Container } from '@chakra-ui/react';
import {CreateMarketForm} from '@components/admin/CreateMarketForm';
import {GetMarketForm} from '@components/admin/GetMarketForm';


export default function Page() {

  return (
    <Container maxW="container.md" p={3} marginTop={25} as="main" minH="70vh">
      <GetMarketForm />
      <CreateMarketForm />
    </Container>
  )
}

export const maxDuration = 300;
