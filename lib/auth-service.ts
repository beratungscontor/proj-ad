import { IPublicClientApplication } from '@azure/msal-browser';
import { loginRequest, graphRequest } from './msal-config';
import { AuthUser } from './types';

export class AuthService {
  constructor(private pca: IPublicClientApplication) {}

  async login() {
    try {
      const response = await this.pca.loginPopup(loginRequest);
      return response.account;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      const response = await this.pca.acquireTokenSilent(graphRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.pca.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const account = this.pca.getActiveAccount();
    if (!account) return null;

    return {
      id: account.localAccountId,
      displayName: account.name || '',
      mail: account.username,
      userPrincipalName: account.username,
    };
  }

  isAuthenticated(): boolean {
    return this.pca.getActiveAccount() !== null;
  }
}