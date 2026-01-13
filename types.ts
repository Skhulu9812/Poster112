
export type UserRole = 'Super Admin' | 'Officer' | 'Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Added password field
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

export interface Permit {
  id: string;
  regNo: string;
  make: string;
  association: string;
  dateIssued: string;
  expiryDate: string;
  ownerName: string;
  status: 'Active' | 'Expired' | 'Pending';
  year: number;
  permitTitle: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
  type: 'create' | 'update' | 'delete' | 'export' | 'auth';
}

export interface DashboardStats {
  totalPermits: number;
  activePermits: number;
  expiredPermits: number;
  revenue: number;
}
