export interface ExpenseAttachment {
  id?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface ExpenseLineItem {
  date: string;
  category: string;
  description: string;
  amount: number;
  taxPercent: number;
  total: number;
}

export interface TravelExpenseClaim {
  id: string;
  claimDate: string;
  expenseReferenceNo: string;
  employeeName: string;
  department: string;
  expenseCategory: string;
  projectCode: string;
  totalAmount: number;
  status: 'All' | 'Pending' | 'Approved' | 'Rejected';
  project?: string;
  
  // Make these optional so the dashboard list parser doesn't require them
  paymentMode?: string;
  subTotal?: number;
  totalTax?: number;
  adjustment?: number;
  lineItems?: any[]; 
}
export interface DashboardStats {
  totalExpenses: number;
  approvedClaims: number;
  pendingApproval: number;
  reimbursement: number;
}
