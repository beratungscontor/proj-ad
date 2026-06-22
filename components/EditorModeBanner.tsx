import React, { useState, useEffect } from 'react';
import styles from '../styles/dashboard.module.css';

interface EditorModeBannerProps {
  hasWriteAccess: boolean;
  writeExpiresAt: string | null;
  onShowInstructions: () => void;
}

export default function EditorModeBanner({ hasWriteAccess, writeExpiresAt, onShowInstructions }: EditorModeBannerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!hasWriteAccess || !writeExpiresAt) {
      setTimeLeft('');
      return;
    }

    const update = () => {
      const now = Date.now();
      const end = new Date(writeExpiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('abgelaufen');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(hours > 0 ? `${hours}h ${mins}min verbleibend` : `${mins}min verbleibend`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [hasWriteAccess, writeExpiresAt]);

  if (hasWriteAccess) {
    return (
      <div className={`${styles.editorBanner} ${styles.editorBannerActive}`}>
        <div className={styles.editorBannerContent}>
          <span className={styles.editorBannerIcon}>&#9679;</span>
          <span><strong>Editor-Modus aktiv</strong> — Alle Bearbeitungsfunktionen sind freigeschaltet.</span>
        </div>
        {timeLeft && <span className={styles.editorTimer}>{timeLeft}</span>}
      </div>
    );
  }

  return (
    <div className={`${styles.editorBanner} ${styles.editorBannerLocked}`}>
      <div className={styles.editorBannerContent}>
        <span className={styles.editorBannerIcon}>&#128274;</span>
        <span><strong>Nur-Lese-Modus</strong> — Sie können Daten einsehen, aber nicht bearbeiten.</span>
      </div>
      <button className={styles.editorInstructionsBtn} onClick={onShowInstructions}>
        Anleitung: Editor-Berechtigung aktivieren
      </button>
    </div>
  );
}
