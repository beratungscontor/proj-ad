import { useMsal } from '@azure/msal-react';
import { ReactNode } from 'react';
import styles from '../styles/dashboard.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { instance, accounts } = useMsal();

  const handleLogout = async () => {
    await instance.logout();
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Employee Admin Dashboard</h1>
          <div className={styles.userInfo}>
            <span>{accounts[0]?.name}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className={styles.container}>{children}</main>
    </div>
  );
}