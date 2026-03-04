import type { AppProps } from 'next/app';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import msalConfig from '../lib/msal-config';
import '../styles/globals.css';

const pca = new PublicClientApplication(msalConfig);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MsalProvider instance={pca}>
      <Component {...pageProps} />
    </MsalProvider>
  );
}