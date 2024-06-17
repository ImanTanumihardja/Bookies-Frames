'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import { ThirdwebProvider } from 'thirdweb/react';

export default function Providers({children}: {children: React.ReactNode}) {
    
  return (
    <ThirdwebProvider>
        <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        config={{
            // Customize Privy's appearance in your app
            appearance: {
            theme: 'light',
            logo: `http://gobookies.xyz/favicon.ico`,
            },
            loginMethods: ['farcaster'] 
        }}
        >
        {children}
        </PrivyProvider>
    </ThirdwebProvider>
  );
}