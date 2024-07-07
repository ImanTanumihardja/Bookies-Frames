'use client';

import {base} from 'viem/chains'
import {PrivyProvider} from '@privy-io/react-auth';
import initShield3PrivyConfig from "@0xshield3/privy"
import { Shield3Provider } from '@shield3/react-sdk';
import { myChain } from '@utils/constants';

export default function Providers({children}: {children: React.ReactNode}) {
  const privyConfig = initShield3PrivyConfig(
    process.env.NEXT_PUBLIC_SHIELD3_API_KEY || "",
    {
      defaultChain: base,
      supportedChains: [base],
      appearance: {
        theme: 'dark',
        logo: `http://gobookies.xyz/favicon.ico`,
      },
      loginMethods: ['farcaster'],
      externalWallets: {
        coinbaseWallet: {connectionOptions: 'all'}
      }
    }
  );
  return (
    <Shield3Provider apiKey={process.env.NEXT_PUBLIC_SHIELD3_API_KEY}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
          config={privyConfig}
        >
        {children}
        </PrivyProvider>
      </Shield3Provider>
  );
}