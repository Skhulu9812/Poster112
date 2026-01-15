
export type UserRole = 'Super Admin' | 'Officer' | 'Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  passwordLastChanged: string; // ISO date string
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
  issuedBy: string; // User ID
  // Branding & Design Customization
  authorityName?: string;
  authorityFontSize?: number;
  authorityFontStyle?: 'normal' | 'italic' | 'bold' | 'bold-italic';
  globalFontScale?: number;
  permitFontStyle?: 'sans' | 'serif' | 'mono' | 'display';
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
