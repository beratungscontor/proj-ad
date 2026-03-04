import { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import Head from 'next/head';
import EmployeeSearch from '../components/EmployeeSearch';
import EmployeeForm from '../components/EmployeeForm';
import Layout from '../components/Layout';
import { Employee } from '../lib/types';
import styles from '../styles/dashboard.module.css';

export default function Dashboard() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    checkAccess();
  }, [isAuthenticated]);

  const checkAccess = async () => {
    try {
      const account = accounts[0];
      if (!account) return;

      const response = await instance.acquireTokenSilent({
        scopes: ['User.Read'],
        account,
      });

      const accessCheckResponse = await fetch('/api/auth/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: response.accessToken }),
      });

      const accessData = await accessCheckResponse.json();
      setHasAccess(accessData.hasAccess);
      if (!accessData.hasAccess) {
        setAccessError('You do not have permission to access this dashboard');
      }
    } catch (error) {
      setAccessError('Failed to verify access permissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className={styles.loading}>Loading...</div></Layout>;

  if (!hasAccess) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>✕ {accessError}</div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head><title>Dashboard - Employee Admin</title></Head>
      <Layout>
        <div className={styles.dashboard}>
          <h1>Employee Profile Management</h1>
          <div className={styles.content}>
            <div className={styles.sidebar}>
              <EmployeeSearch onEmployeeSelected={setSelectedEmployee} />
            </div>
            <div className={styles.main}>
              {selectedEmployee ? (
                <EmployeeForm employee={selectedEmployee} />
              ) : (
                <div className={styles.placeholder}>
                  <p>Select an employee to manage their profile</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}