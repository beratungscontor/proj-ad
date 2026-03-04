import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import Head from 'next/head';
import styles from '../styles/dashboard.module.css';

export default function Home() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      await instance.loginPopup();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Employee Admin Dashboard - Login</title>
      </Head>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>Employee Admin Dashboard</h1>
          <p>Manage employee profiles in Microsoft Entra ID</p>
          <button className={styles.loginButton} onClick={handleLogin}>
            🔐 Sign in with Microsoft
          </button>
        </div>
      </div>
    </>
  );
}