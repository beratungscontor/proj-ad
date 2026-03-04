import styles from '../styles/form.module.css';

interface ErrorMessageProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return <div className={styles.errorMessage}>✕ {error}</div>;
}