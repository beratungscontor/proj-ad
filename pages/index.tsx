import React, { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/dashboard.module.css';

export default function Home() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Use MSAL's built-in status to determine if we are currently loading/interacting
  const isLoading = inProgress !== InteractionStatus.None;

  useEffect(() => {
    // Only redirect if authenticated and MSAL has finished all interactions
    if (isAuthenticated && inProgress === InteractionStatus.None) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, inProgress, router]);

  const handleLogin = () => {
    setError(null);
    instance.loginRedirect({
      scopes: ['User.Read', 'profile', 'openid', 'email'],
    });
  };

  return (
    <>
      <Head>
        <title>Anmelden | Mitarbeiter-Portal</title>
      </Head>
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginBrand}>
            <div className={styles.loginLogoIcon}>✨</div>
            <h1 className={styles.loginTitle}>Mitarbeiter-Portal</h1>
          </div>

          <p className={styles.loginSubtitle}>
            Verwalten Sie das Profil Ihres Teams. Alle Updates werden sofort mit Microsoft Entra ID (Azure AD) synchronisiert.
          </p>

          <div className={styles.loginFeatures}>
            <div className={styles.loginFeature}>
              <span>⚡</span>
              <span>Echtzeit-Updates in Entra ID</span>
            </div>
            <div className={styles.loginFeature}>
              <span>📋</span>
              <span>Vollständiges detailliertes Audit-Log</span>
            </div>
            <div className={styles.loginFeature}>
              <span>🔒</span>
              <span>Sicherer Login über Microsoft</span>
            </div>
          </div>

          {error && <div className={styles.loginError}>✕ {error}</div>}

          <button
            className={styles.loginButton}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Anmelden...' : 'Mit Microsoft anmelden'}
          </button>

          <p className={styles.loginFooter}>
            Gesichert durch Microsoft Entra ID · Nur für HR &amp; IT Zugriff
          </p>
        </div>
      </div>
    </>
  );
}