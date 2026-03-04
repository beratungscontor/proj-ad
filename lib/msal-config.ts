import { Configuration, LogLevel } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '',
    authority: process.env.NEXT_PUBLIC_AUTHORITY || '',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        console.log(`[MSAL] ${LogLevel[level]}: ${message}`);
      },
      level: LogLevel.Verbose,
      piiLoggingEnabled: false,
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'profile', 'openid', 'email'],
};

export const graphRequest = {
  scopes: ['User.Read'],
};

export default msalConfig;