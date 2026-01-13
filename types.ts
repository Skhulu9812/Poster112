
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

export interface DashboardStats {
  totalPermits: number;
  activePermits: number;
  expiredPermits: number;
  revenue: number;
}
