import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import msalConfig from '../lib/msal-config';
import '../styles/globals.css';

const msalInstance = new PublicClientApplication(msalConfig);

export default function App({ Component, pageProps }: AppProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    msalInstance.initialize().then(() => {
      // Set active account
      if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
      }

      // Listen for login success to set active account
      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload as any;
          if (payload.account) {
            msalInstance.setActiveAccount(payload.account);
          }
        }
      });

      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return <div style={{ background: '#0f1117', height: '100vh' }}></div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <Component {...pageProps} />
    </MsalProvider>
  );
}