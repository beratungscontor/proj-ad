import { Employee } from './types';

export function calculateChanges(original: Employee, updated: Partial<Employee>): Record<string, { old: string; new: string }> {
  const changes: Record<string, { old: string; new: string }> = {};

  const fields = [
    'givenName', 'surname', 'displayName', 'mail', 'mobilePhone',
    'businessPhones', 'officeLocation', 'jobTitle', 'department',
    'companyName', 'streetAddress', 'city', 'state', 'postalCode', 'country',
  ];

  fields.forEach((field) => {
    const key = field as keyof Employee;
    if (original[key] !== updated[key]) {
      changes[field] = {
        old: String(original[key] || ''),
        new: String(updated[key] || ''),
      };
    }
  });

  return changes;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}