import React from 'react';
import styles from '../styles/dashboard.module.css';

interface PimInstructionsProps {
  onClose: () => void;
}

export default function PimInstructions({ onClose }: PimInstructionsProps) {
  return (
    <div className={styles.pimOverlay} onClick={onClose}>
      <div className={styles.pimModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.pimCloseBtn} onClick={onClose}>&#10005;</button>
        <h2 className={styles.pimTitle}>Editor-Berechtigung aktivieren</h2>
        <p className={styles.pimSubtitle}>
          Folgen Sie diesen Schritten, um die Berechtigung zum Bearbeiten zu aktivieren:
        </p>
        <ol className={styles.pimSteps}>
          <li>
            <strong>Azure Portal öffnen</strong>
            <p>Öffnen Sie <a href="https://portal.azure.com/#view/Microsoft_Azure_PIMCommon/ActivationMenuBlade/~/aadgroup" target="_blank" rel="noopener noreferrer">Azure PIM - Gruppenaktivierung</a> in einem neuen Tab.</p>
          </li>
          <li>
            <strong>Rolle aktivieren</strong>
            <p>Suchen Sie <strong>"HR-Portal-Editors"</strong> und klicken Sie auf <strong>"Aktivieren"</strong>.</p>
          </li>
          <li>
            <strong>Begründung eingeben</strong>
            <p>Geben Sie eine kurze Begründung ein (z.B. "Abteilungsdaten aktualisieren").</p>
          </li>
          <li>
            <strong>Auf Genehmigung warten</strong>
            <p>Ein IT-Admin muss Ihre Anfrage genehmigen. Sie werden per E-Mail benachrichtigt.</p>
          </li>
          <li>
            <strong>Seite neu laden</strong>
            <p>Sobald genehmigt, laden Sie diese Seite neu (F5). Der Editor-Modus wird automatisch aktiviert.</p>
          </li>
        </ol>
        <div className={styles.pimNote}>
          <strong>Hinweis:</strong> Die Berechtigung ist für 2 Stunden gültig und wird danach automatisch deaktiviert.
        </div>
      </div>
    </div>
  );
}
