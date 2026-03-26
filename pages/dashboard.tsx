import React, { useState, useEffect, useCallback } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import Head from 'next/head';
import { useRouter } from 'next/router';
import EmployeeSearch from '../components/EmployeeSearch';
import BulkUpdateSelected from '../components/BulkUpdateSelected';
import EmployeeForm from '../components/EmployeeForm';
import UserDirectory from '../components/UserDirectory';
import Layout from '../components/Layout';
import { Employee } from '../lib/types';
import styles from '../styles/dashboard.module.css';

export default function Dashboard() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts, inProgress } = useMsal();
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      checkAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, inProgress]);

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
        setAccessError('Sie sind kein Mitglied der erforderlichen Sicherheitsgruppe für den Zugriff auf dieses Dashboard.');
      }
    } catch {
      setAccessError('Überprüfung Ihrer Zugriffsrechte fehlgeschlagen. Bitte melden Sie sich erneut an.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeRefreshed = useCallback((refreshed: Employee) => {
    setSelectedEmployee(refreshed);
    // trigger directory refresh so the table shows updated data
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCloseForm = () => {
    setSelectedEmployee(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Ihre Zugangsberechtigungen werden überprüft...</p>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <div className={styles.accessDenied}>
            <div className={styles.accessDeniedIcon}>🚫</div>
            <h2>Zugriff verweigert</h2>
            <p>{accessError}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard — Mitarbeiter-Portal</title>
        <meta name="description" content="Verwalten Sie Mitarbeiterprofile in Microsoft Entra ID." />
      </Head>
      <Layout>
        <div className={styles.dashboardHeader}>
          <div className={styles.headerRow}>
            <div>
              <h1>Mitarbeiterverzeichnis</h1>
              <p>Klicken Sie auf ein Feld, um es direkt zu bearbeiten. Klicken Sie auf das Profilbild, um die Detailansicht zu öffnen.</p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.toolbarToggle}
                onClick={() => setShowSidebar((v) => !v)}
              >
                {showSidebar ? '✕ Werkzeuge ausblenden' : '🔧 Suche & Massenänderung'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* collapsible tools panel */}
          {showSidebar && (
            <div className={styles.sidebar}>
              <EmployeeSearch onEmployeeSelected={setSelectedEmployee} />
              <BulkUpdateSelected />
            </div>
          )}

          {/* main: always-visible directory table */}
          <div className={styles.main}>
            <UserDirectory
              onEmployeeSelected={setSelectedEmployee}
              refreshKey={refreshKey}
            />
          </div>
        </div>

        {/* employee detail form — slide-in overlay */}
        {selectedEmployee && (
          <div className={styles.formOverlay}>
            <div className={styles.formPanel}>
              <button className={styles.closeBtn} onClick={handleCloseForm} title="Schließen">✕</button>
              <EmployeeForm
                key={selectedEmployee.id}
                employee={selectedEmployee}
                onEmployeeRefreshed={handleEmployeeRefreshed}
              />
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}