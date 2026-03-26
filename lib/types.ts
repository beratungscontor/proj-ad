export interface OnPremisesExtensionAttributes {
  extensionAttribute1?: string | null;
  extensionAttribute2?: string | null;
  extensionAttribute3?: string | null;
  extensionAttribute4?: string | null;
  extensionAttribute5?: string | null;
  extensionAttribute6?: string | null;
  extensionAttribute7?: string | null;
  extensionAttribute8?: string | null;
  extensionAttribute9?: string | null;
  extensionAttribute10?: string | null;
  extensionAttribute11?: string | null;
  extensionAttribute12?: string | null;
  extensionAttribute13?: string | null;
  extensionAttribute14?: string | null;
  extensionAttribute15?: string | null;
}

export interface Employee {
  id: string;
  userPrincipalName: string;
  displayName: string;
  givenName: string;
  surname: string;
  mail: string;
  mobilePhone: string;
  officeLocation: string;
  businessPhones: string[];
  jobTitle: string;
  department: string;
  companyName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  manager?: {
    id: string;
    displayName: string;
    userPrincipalName: string;
  };
  onPremisesExtensionAttributes?: OnPremisesExtensionAttributes;
  photoUrl?: string;
}

export interface EmployeeUpdate {
  givenName?: string;
  surname?: string;
  displayName?: string;
  mail?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  officeLocation?: string;
  jobTitle?: string;
  department?: string;
  companyName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  onPremisesExtensionAttributes?: OnPremisesExtensionAttributes;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  changedBy: string;
  employeeId: string;
  employeeName: string;
  changes: Record<string, { old: string; new: string }>;
  status: 'success' | 'failed';
  errorMessage?: string;
  editType?: 'single' | 'bulk';
}

export interface AuthUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  groups?: string[];
}

export interface GraphAPIError {
  error: {
    code: string;
    message: string;
  };
}