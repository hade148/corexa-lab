export interface Project {
  id: string;
  name: string;
  description: string;
  source: string;
  approvedBudget: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'suspended';
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  projectId: string;
  name: string;
  approvedAmount: number;
  parentId: string | null;
  children?: Category[];
}

export interface PaymentSchedule {
  id: string;
  projectId: string;
  expectedDate: string;
  amount: number;
  condition: string;
  status: 'pending' | 'received' | 'overdue';
  receivedDate?: string;
  receivedAmount?: number;
  documentUrl?: string;
  notes: string;
}

export interface Expense {
  id: string;
  projectId: string;
  categoryId: string;
  vendor: string;
  date: string;
  description: string;
  amount: number;
  invoiceUrl?: string;
  invoiceFileName?: string;
  createdAt: string;
  createdBy: string;
}

export interface Commitment {
  id: string;
  projectId: string;
  categoryId: string;
  vendor: string;
  description: string;
  amount: number;
  date: string;
  expectedPaymentDate: string;
  status: 'open' | 'partially_paid' | 'paid' | 'cancelled';
  convertedExpenseId?: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  notes: string;
}

export interface Loan {
  id: string;
  lenderProjectId: string;
  borrowerProjectId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'active' | 'partially_returned' | 'returned' | 'overdue';
  description: string;
  repayments: LoanRepayment[];
  remainingAmount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'finance' | 'manager' | 'viewer';
}

export interface ProjectStats {
  projectId: string;
  approvedBudget: number;
  totalExpenses: number;
  totalCommitments: number;
  totalReceived: number;
  budgetBalance: number;
  cashBalance: number;
  utilizationPercent: number;
}
