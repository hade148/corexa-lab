import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project, Category, PaymentSchedule, Expense, Commitment, Loan, LoanRepayment, AuditLog, User
} from '../types';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SEED_CATEGORIES_1: Category[] = [
  { id: 'c1a', projectId: 'p1', name: 'שכר עבודה', approvedAmount: 500000, parentId: null, children: [
    { id: 'c1a1', projectId: 'p1', name: 'שכר עובדים קבועים', approvedAmount: 350000, parentId: 'c1a' },
    { id: 'c1a2', projectId: 'p1', name: 'שכר עובדים זמניים', approvedAmount: 150000, parentId: 'c1a' },
  ]},
  { id: 'c1b', projectId: 'p1', name: 'ציוד ותשתיות', approvedAmount: 300000, parentId: null, children: [
    { id: 'c1b1', projectId: 'p1', name: 'רכש ציוד', approvedAmount: 200000, parentId: 'c1b' },
    { id: 'c1b2', projectId: 'p1', name: 'תחזוקה', approvedAmount: 100000, parentId: 'c1b' },
  ]},
  { id: 'c1c', projectId: 'p1', name: 'הדרכה והכשרה', approvedAmount: 200000, parentId: null, children: [] },
];

const SEED_CATEGORIES_2: Category[] = [
  { id: 'c2a', projectId: 'p2', name: 'פיתוח תוכנה', approvedAmount: 800000, parentId: null, children: [
    { id: 'c2a1', projectId: 'p2', name: 'פיתוח פרונטאנד', approvedAmount: 350000, parentId: 'c2a' },
    { id: 'c2a2', projectId: 'p2', name: 'פיתוח בקאנד', approvedAmount: 450000, parentId: 'c2a' },
  ]},
  { id: 'c2b', projectId: 'p2', name: 'תשתיות ענן', approvedAmount: 400000, parentId: null, children: [
    { id: 'c2b1', projectId: 'p2', name: 'שרתים', approvedAmount: 250000, parentId: 'c2b' },
    { id: 'c2b2', projectId: 'p2', name: 'אבטחת מידע', approvedAmount: 150000, parentId: 'c2b' },
  ]},
  { id: 'c2c', projectId: 'p2', name: 'שיווק והפצה', approvedAmount: 300000, parentId: null, children: [] },
];

const SEED_CATEGORIES_3: Category[] = [
  { id: 'c3a', projectId: 'p3', name: 'הכשרה מקצועית', approvedAmount: 200000, parentId: null, children: [
    { id: 'c3a1', projectId: 'p3', name: 'קורסים', approvedAmount: 120000, parentId: 'c3a' },
    { id: 'c3a2', projectId: 'p3', name: 'סדנאות', approvedAmount: 80000, parentId: 'c3a' },
  ]},
  { id: 'c3b', projectId: 'p3', name: 'תמיכה חברתית', approvedAmount: 150000, parentId: null, children: [] },
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'פרויקט שיקום שכונות',
    description: 'פרויקט לשיקום ופיתוח שכונות מוחלשות ברחבי העיר',
    source: 'משרד הפנים',
    approvedBudget: 1000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    categories: SEED_CATEGORIES_1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'p2',
    name: 'דיגיטציה שירותי עיריה',
    description: 'מיזם לדיגיטציה ושיפור שירותים דיגיטליים לתושבים',
    source: 'קרן פילנתרופית',
    approvedBudget: 1500000,
    startDate: '2024-03-01',
    endDate: '2025-06-30',
    status: 'active',
    categories: SEED_CATEGORIES_2,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'p3',
    name: 'תעסוקה לנוער בסיכון',
    description: 'תוכנית הכשרה ותעסוקה לנוער בסיכון',
    source: 'ג\'וינט',
    approvedBudget: 350000,
    startDate: '2024-06-01',
    endDate: '2024-12-20',
    status: 'active',
    categories: SEED_CATEGORIES_3,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
];

const SEED_PAYMENTS: PaymentSchedule[] = [
  { id: 'ps1', projectId: 'p1', expectedDate: '2024-01-15', amount: 400000, condition: 'אישור תחילת פרויקט', status: 'received', receivedDate: '2024-01-20', receivedAmount: 400000, notes: 'התקבל בזמן' },
  { id: 'ps2', projectId: 'p1', expectedDate: '2024-06-15', amount: 350000, condition: 'דוח אמצע תקופה', status: 'received', receivedDate: '2024-06-20', receivedAmount: 350000, notes: '' },
  { id: 'ps3', projectId: 'p1', expectedDate: '2024-12-01', amount: 250000, condition: 'דוח סיום', status: 'pending', notes: 'ממתין לאישור' },
  { id: 'ps4', projectId: 'p2', expectedDate: '2024-04-01', amount: 600000, condition: 'חתימת הסכם', status: 'received', receivedDate: '2024-04-05', receivedAmount: 600000, notes: '' },
  { id: 'ps5', projectId: 'p2', expectedDate: '2024-09-01', amount: 500000, condition: 'אבן דרך ראשונה', status: 'received', receivedDate: '2024-09-10', receivedAmount: 500000, notes: '' },
  { id: 'ps6', projectId: 'p2', expectedDate: '2025-01-01', amount: 400000, condition: 'אבן דרך שניה', status: 'pending', notes: '' },
  { id: 'ps7', projectId: 'p3', expectedDate: '2024-05-15', amount: 200000, condition: 'אישור תוכנית', status: 'received', receivedDate: '2024-05-20', receivedAmount: 200000, notes: '' },
  { id: 'ps8', projectId: 'p3', expectedDate: '2024-09-15', amount: 150000, condition: 'דוח ביניים', status: 'overdue', notes: 'מאחר - לבדוק' },
];

const SEED_EXPENSES: Expense[] = [
  { id: 'e1', projectId: 'p1', categoryId: 'c1a1', vendor: 'חב׳ כוח אדם בע"מ', date: '2024-02-01', description: 'שכר חודש ינואר', amount: 85000, createdAt: '2024-02-01T00:00:00Z', createdBy: 'u1' },
  { id: 'e2', projectId: 'p1', categoryId: 'c1a1', vendor: 'חב׳ כוח אדם בע"מ', date: '2024-03-01', description: 'שכר חודש פברואר', amount: 85000, createdAt: '2024-03-01T00:00:00Z', createdBy: 'u1' },
  { id: 'e3', projectId: 'p1', categoryId: 'c1b1', vendor: 'ספק ציוד מקצועי', date: '2024-03-15', description: 'רכש ציוד בנייה', amount: 120000, createdAt: '2024-03-15T00:00:00Z', createdBy: 'u1' },
  { id: 'e4', projectId: 'p1', categoryId: 'c1c', vendor: 'מכון הכשרה', date: '2024-04-10', description: 'הדרכה עובדים', amount: 45000, createdAt: '2024-04-10T00:00:00Z', createdBy: 'u1' },
  { id: 'e5', projectId: 'p2', categoryId: 'c2a1', vendor: 'סטארטאפ פיתוח', date: '2024-05-01', description: 'פיתוח מודול ראשון', amount: 180000, createdAt: '2024-05-01T00:00:00Z', createdBy: 'u1' },
  { id: 'e6', projectId: 'p2', categoryId: 'c2a2', vendor: 'חב׳ תוכנה בע"מ', date: '2024-06-15', description: 'פיתוח API', amount: 220000, createdAt: '2024-06-15T00:00:00Z', createdBy: 'u1' },
  { id: 'e7', projectId: 'p2', categoryId: 'c2b1', vendor: 'ספק ענן', date: '2024-07-01', description: 'שירותי ענן Q2', amount: 75000, createdAt: '2024-07-01T00:00:00Z', createdBy: 'u1' },
  { id: 'e8', projectId: 'p3', categoryId: 'c3a1', vendor: 'מכללה מקצועית', date: '2024-07-01', description: 'קורס מכניקה', amount: 55000, createdAt: '2024-07-01T00:00:00Z', createdBy: 'u1' },
  { id: 'e9', projectId: 'p3', categoryId: 'c3b', vendor: 'עמותת תמיכה', date: '2024-08-15', description: 'תמיכה חברתית חודש אוגוסט', amount: 30000, createdAt: '2024-08-15T00:00:00Z', createdBy: 'u1' },
];

const SEED_COMMITMENTS: Commitment[] = [
  { id: 'cm1', projectId: 'p1', categoryId: 'c1a2', vendor: 'קבלן עצמאי', description: 'עבודות בנייה Q4', amount: 90000, date: '2024-09-01', expectedPaymentDate: '2024-12-15', status: 'open' },
  { id: 'cm2', projectId: 'p1', categoryId: 'c1b2', vendor: 'חב׳ תחזוקה', description: 'תחזוקה חצי שנתית', amount: 40000, date: '2024-08-01', expectedPaymentDate: '2024-11-30', status: 'open' },
  { id: 'cm3', projectId: 'p2', categoryId: 'c2a1', vendor: 'פרילנסר', description: 'עיצוב UI', amount: 60000, date: '2024-09-01', expectedPaymentDate: '2025-01-15', status: 'open' },
  { id: 'cm4', projectId: 'p2', categoryId: 'c2c', vendor: 'סוכנות שיווק', description: 'קמפיין השקה', amount: 120000, date: '2024-10-01', expectedPaymentDate: '2025-02-01', status: 'open' },
  { id: 'cm5', projectId: 'p3', categoryId: 'c3a2', vendor: 'מרכז הכשרה', description: 'סדנאות Q4', amount: 35000, date: '2024-10-01', expectedPaymentDate: '2024-12-10', status: 'open' },
];

const SEED_LOANS: Loan[] = [
  {
    id: 'l1',
    lenderProjectId: 'p2',
    borrowerProjectId: 'p3',
    amount: 80000,
    date: '2024-08-01',
    dueDate: '2024-12-31',
    status: 'active',
    description: 'הלוואה לכיסוי פער תזרימי',
    repayments: [
      { id: 'lr1', loanId: 'l1', amount: 20000, date: '2024-10-01', notes: 'החזר ראשון' },
    ],
    remainingAmount: 60000,
  },
];

const SEED_AUDIT: AuditLog[] = [
  { id: 'al1', timestamp: '2024-01-01T10:00:00Z', userId: 'u1', userName: 'ישראל ישראלי', action: 'create', entityType: 'project', entityId: 'p1', details: 'נוצר פרויקט: פרויקט שיקום שכונות' },
  { id: 'al2', timestamp: '2024-03-01T09:00:00Z', userId: 'u1', userName: 'ישראל ישראלי', action: 'create', entityType: 'project', entityId: 'p2', details: 'נוצר פרויקט: דיגיטציה שירותי עיריה' },
  { id: 'al3', timestamp: '2024-06-01T08:00:00Z', userId: 'u1', userName: 'ישראל ישראלי', action: 'create', entityType: 'project', entityId: 'p3', details: 'נוצר פרויקט: תעסוקה לנוער בסיכון' },
];

const DEFAULT_USER: User = {
  id: 'u1',
  name: 'ישראל ישראלי',
  email: 'israel@municipality.gov.il',
  role: 'admin',
};

interface StoreState {
  projects: Project[];
  paymentSchedules: PaymentSchedule[];
  expenses: Expense[];
  commitments: Commitment[];
  loans: Loan[];
  auditLogs: AuditLog[];
  currentUser: User;

  // Project actions
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Category actions
  addCategory: (projectId: string, cat: Omit<Category, 'id' | 'projectId'>) => void;
  updateCategory: (projectId: string, catId: string, updates: Partial<Category>) => void;
  deleteCategory: (projectId: string, catId: string) => void;

  // Payment schedule actions
  addPaymentSchedule: (ps: Omit<PaymentSchedule, 'id'>) => void;
  updatePaymentSchedule: (id: string, updates: Partial<PaymentSchedule>) => void;
  deletePaymentSchedule: (id: string) => void;
  markPaymentReceived: (id: string, receivedDate: string, receivedAmount: number) => void;

  // Expense actions
  addExpense: (exp: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Commitment actions
  addCommitment: (c: Omit<Commitment, 'id'>) => void;
  updateCommitment: (id: string, updates: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  convertCommitmentToExpense: (commitmentId: string) => void;

  // Loan actions
  addLoan: (l: Omit<Loan, 'id' | 'repayments' | 'remainingAmount'>) => void;
  addLoanRepayment: (loanId: string, repayment: Omit<LoanRepayment, 'id' | 'loanId'>) => void;
  updateLoanStatus: (loanId: string, status: Loan['status']) => void;

  // Audit
  addAuditLog: (action: string, entityType: string, entityId: string, details: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      projects: SEED_PROJECTS,
      paymentSchedules: SEED_PAYMENTS,
      expenses: SEED_EXPENSES,
      commitments: SEED_COMMITMENTS,
      loans: SEED_LOANS,
      auditLogs: SEED_AUDIT,
      currentUser: DEFAULT_USER,

      addProject: (p) => {
        const id = uid();
        const now = new Date().toISOString();
        const project: Project = { ...p, id, createdAt: now, updatedAt: now };
        set(s => ({ projects: [...s.projects, project] }));
        get().addAuditLog('create', 'project', id, `נוצר פרויקט: ${p.name}`);
        return id;
      },

      updateProject: (id, updates) => {
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
        }));
        get().addAuditLog('update', 'project', id, `עודכן פרויקט`);
      },

      deleteProject: (id) => {
        set(s => ({ projects: s.projects.filter(p => p.id !== id) }));
        get().addAuditLog('delete', 'project', id, `נמחק פרויקט`);
      },

      addCategory: (projectId, cat) => {
        const id = uid();
        const newCat: Category = { ...cat, id, projectId };
        set(s => ({
          projects: s.projects.map(p => {
            if (p.id !== projectId) return p;
            if (cat.parentId) {
              return {
                ...p,
                categories: p.categories.map(c =>
                  c.id === cat.parentId
                    ? { ...c, children: [...(c.children ?? []), newCat] }
                    : c
                ),
              };
            }
            return { ...p, categories: [...p.categories, { ...newCat, children: [] }] };
          })
        }));
      },

      updateCategory: (projectId, catId, updates) => {
        set(s => ({
          projects: s.projects.map(p => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              categories: p.categories.map(c => {
                if (c.id === catId) return { ...c, ...updates };
                return { ...c, children: (c.children ?? []).map(sc => sc.id === catId ? { ...sc, ...updates } : sc) };
              })
            };
          })
        }));
      },

      deleteCategory: (projectId, catId) => {
        set(s => ({
          projects: s.projects.map(p => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              categories: p.categories
                .filter(c => c.id !== catId)
                .map(c => ({ ...c, children: (c.children ?? []).filter(sc => sc.id !== catId) }))
            };
          })
        }));
      },

      addPaymentSchedule: (ps) => {
        const id = uid();
        set(s => ({ paymentSchedules: [...s.paymentSchedules, { ...ps, id }] }));
        get().addAuditLog('create', 'payment', id, `נוספה פעימה לפרויקט ${ps.projectId}`);
      },

      updatePaymentSchedule: (id, updates) => {
        set(s => ({ paymentSchedules: s.paymentSchedules.map(ps => ps.id === id ? { ...ps, ...updates } : ps) }));
      },

      deletePaymentSchedule: (id) => {
        set(s => ({ paymentSchedules: s.paymentSchedules.filter(ps => ps.id !== id) }));
      },

      markPaymentReceived: (id, receivedDate, receivedAmount) => {
        set(s => ({
          paymentSchedules: s.paymentSchedules.map(ps =>
            ps.id === id ? { ...ps, status: 'received', receivedDate, receivedAmount } : ps
          )
        }));
        get().addAuditLog('update', 'payment', id, `סומנה פעימה כהתקבלה`);
      },

      addExpense: (exp) => {
        const id = uid();
        const now = new Date().toISOString();
        const { currentUser } = get();
        set(s => ({ expenses: [...s.expenses, { ...exp, id, createdAt: now, createdBy: currentUser.name }] }));
        get().addAuditLog('create', 'expense', id, `נוספה הוצאה: ${exp.vendor} - ₪${exp.amount.toLocaleString()}`);
      },

      updateExpense: (id, updates) => {
        set(s => ({ expenses: s.expenses.map(e => e.id === id ? { ...e, ...updates } : e) }));
      },

      deleteExpense: (id) => {
        set(s => ({ expenses: s.expenses.filter(e => e.id !== id) }));
        get().addAuditLog('delete', 'expense', id, `נמחקה הוצאה`);
      },

      addCommitment: (c) => {
        const id = uid();
        set(s => ({ commitments: [...s.commitments, { ...c, id }] }));
        get().addAuditLog('create', 'commitment', id, `נוספה התחייבות: ${c.vendor} - ₪${c.amount.toLocaleString()}`);
      },

      updateCommitment: (id, updates) => {
        set(s => ({ commitments: s.commitments.map(c => c.id === id ? { ...c, ...updates } : c) }));
      },

      deleteCommitment: (id) => {
        set(s => ({ commitments: s.commitments.filter(c => c.id !== id) }));
      },

      convertCommitmentToExpense: (commitmentId) => {
        const { commitments, currentUser } = get();
        const commitment = commitments.find(c => c.id === commitmentId);
        if (!commitment) return;
        const expId = uid();
        const now = new Date().toISOString();
        const expense: Expense = {
          id: expId,
          projectId: commitment.projectId,
          categoryId: commitment.categoryId,
          vendor: commitment.vendor,
          date: new Date().toISOString().slice(0, 10),
          description: commitment.description,
          amount: commitment.amount,
          createdAt: now,
          createdBy: currentUser.name,
        };
        set(s => ({
          expenses: [...s.expenses, expense],
          commitments: s.commitments.map(c =>
            c.id === commitmentId ? { ...c, status: 'paid', convertedExpenseId: expId } : c
          )
        }));
        get().addAuditLog('create', 'expense', expId, `התחייבות הומרה להוצאה`);
      },

      addLoan: (l) => {
        const id = uid();
        set(s => ({ loans: [...s.loans, { ...l, id, repayments: [], remainingAmount: l.amount }] }));
        get().addAuditLog('create', 'loan', id, `נוספה הלוואה: ₪${l.amount.toLocaleString()}`);
      },

      addLoanRepayment: (loanId, repayment) => {
        const id = uid();
        const newRepayment: LoanRepayment = { ...repayment, id, loanId };
        set(s => ({
          loans: s.loans.map(l => {
            if (l.id !== loanId) return l;
            const newRemaining = l.remainingAmount - repayment.amount;
            const newStatus: Loan['status'] = newRemaining <= 0 ? 'returned' : 'partially_returned';
            return {
              ...l,
              repayments: [...l.repayments, newRepayment],
              remainingAmount: Math.max(0, newRemaining),
              status: newStatus,
            };
          })
        }));
        get().addAuditLog('create', 'loan_repayment', id, `נוסף החזר הלוואה: ₪${repayment.amount.toLocaleString()}`);
      },

      updateLoanStatus: (loanId, status) => {
        set(s => ({ loans: s.loans.map(l => l.id === loanId ? { ...l, status } : l) }));
      },

      addAuditLog: (action, entityType, entityId, details) => {
        const { currentUser } = get();
        const log: AuditLog = {
          id: uid(),
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
          userName: currentUser.name,
          action,
          entityType,
          entityId,
          details,
        };
        set(s => ({ auditLogs: [log, ...s.auditLogs].slice(0, 500) }));
      },
    }),
    {
      name: 'grantboard-storage',
    }
  )
);
