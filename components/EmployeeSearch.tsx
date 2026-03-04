import { useState } from 'react';
import { Employee } from '../lib/types';
import styles from '../styles/form.module.css';

interface EmployeeSearchProps {
  onEmployeeSelected: (employee: Employee) => void;
}

export default function EmployeeSearch({ onEmployeeSelected }: EmployeeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/graph/search-users?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.users || []);
    } catch (err) {
      setError('Failed to search employees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <h2>Find Employee</h2>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className={styles.searchInput}
      />
      {loading && <div className={styles.loading}>Searching...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.searchResults}>
        {results.map((employee) => (
          <div
            key={employee.id}
            className={styles.resultItem}
            onClick={() => onEmployeeSelected(employee)}
          >
            <div className={styles.resultName}>{employee.displayName}</div>
            <div className={styles.resultEmail}>{employee.userPrincipalName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}