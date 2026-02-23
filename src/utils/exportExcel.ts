import * as XLSX from 'xlsx';
import type { Project, Expense, Commitment, PaymentSchedule, Loan } from '../types';
import { formatDate, formatCurrency } from './date';
import { calcProjectStats } from './calculations';

export function exportProjectReport(
  project: Project,
  expenses: Expense[],
  commitments: Commitment[],
  payments: PaymentSchedule[],
  loans: Loan[],
  allProjects: Project[]
) {
  const wb = XLSX.utils.book_new();
  const stats = calcProjectStats(project, expenses, commitments, payments, loans);

  // Summary sheet
  const summaryData = [
    ['פרויקט', project.name],
    ['מקור מימון', project.source],
    ['תיאור', project.description],
    ['תאריך התחלה', formatDate(project.startDate)],
    ['תאריך סיום', formatDate(project.endDate)],
    ['סטטוס', project.status],
    [''],
    ['תקציב מאושר', formatCurrency(stats.approvedBudget)],
    ['סך הוצאות', formatCurrency(stats.totalExpenses)],
    ['סך התחייבויות', formatCurrency(stats.totalCommitments)],
    ['יתרה תקציבית', formatCurrency(stats.budgetBalance)],
    ['סך תקבולים', formatCurrency(stats.totalReceived)],
    ['יתרת מזומן', formatCurrency(stats.cashBalance)],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'תקציר');

  // Categories sheet
  const catHeaders = ['סעיף', 'סעיף אב', 'מאושר', 'הוצאות', 'התחייבויות', 'יתרה'];
  const catRows = project.categories.flatMap(cat => {
    const catExpenses = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0);
    const catCommitments = commitments.filter(c => c.categoryId === cat.id && c.status !== 'cancelled' && c.status !== 'paid').reduce((s, c) => s + c.amount, 0);
    const rows: (string | number)[][] = [[cat.name, '', cat.approvedAmount, catExpenses, catCommitments, cat.approvedAmount - catExpenses - catCommitments]];
    if (cat.children) {
      for (const sub of cat.children) {
        const subExp = expenses.filter(e => e.categoryId === sub.id).reduce((s, e) => s + e.amount, 0);
        const subComm = commitments.filter(c => c.categoryId === sub.id && c.status !== 'cancelled' && c.status !== 'paid').reduce((s, c) => s + c.amount, 0);
        rows.push([sub.name, cat.name, sub.approvedAmount, subExp, subComm, sub.approvedAmount - subExp - subComm]);
      }
    }
    return rows;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([catHeaders, ...catRows]), 'סעיפים');

  // Expenses sheet
  const expHeaders = ['תאריך', 'ספק', 'תיאור', 'סעיף', 'סכום'];
  const expRows = expenses
    .filter(e => e.projectId === project.id)
    .map(e => {
      const cat = project.categories.find(c => c.id === e.categoryId) ??
        project.categories.flatMap(c => c.children ?? []).find(c => c.id === e.categoryId);
      return [formatDate(e.date), e.vendor, e.description, cat?.name ?? '', e.amount];
    });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([expHeaders, ...expRows]), 'הוצאות');

  // Commitments sheet
  const commHeaders = ['תאריך', 'ספק', 'תיאור', 'סכום', 'תאריך תשלום צפוי', 'סטטוס'];
  const commRows = commitments
    .filter(c => c.projectId === project.id)
    .map(c => [formatDate(c.date), c.vendor, c.description, c.amount, formatDate(c.expectedPaymentDate), c.status]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([commHeaders, ...commRows]), 'התחייבויות');

  // Payment schedules sheet
  const payHeaders = ['תאריך צפוי', 'סכום', 'תנאי', 'סטטוס', 'תאריך קבלה', 'סכום שהתקבל', 'הערות'];
  const payRows = payments
    .filter(p => p.projectId === project.id)
    .map(p => [formatDate(p.expectedDate), p.amount, p.condition, p.status, p.receivedDate ? formatDate(p.receivedDate) : '', p.receivedAmount ?? '', p.notes]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([payHeaders, ...payRows]), 'פעימות');

  // Loans sheet
  const loanHeaders = ['מלווה', 'לווה', 'סכום', 'תאריך', 'תאריך פירעון', 'יתרה', 'סטטוס', 'תיאור'];
  const loanRows = loans
    .filter(l => l.lenderProjectId === project.id || l.borrowerProjectId === project.id)
    .map(l => {
      const lender = allProjects.find(p => p.id === l.lenderProjectId)?.name ?? l.lenderProjectId;
      const borrower = allProjects.find(p => p.id === l.borrowerProjectId)?.name ?? l.borrowerProjectId;
      return [lender, borrower, l.amount, formatDate(l.date), formatDate(l.dueDate), l.remainingAmount, l.status, l.description];
    });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([loanHeaders, ...loanRows]), 'הלוואות');

  XLSX.writeFile(wb, `${project.name}_דוח.xlsx`);
}

export function exportAllProjectsSummary(
  projects: Project[],
  expenses: Expense[],
  commitments: Commitment[],
  payments: PaymentSchedule[],
  loans: Loan[]
) {
  const wb = XLSX.utils.book_new();
  const headers = ['שם פרויקט', 'מקור מימון', 'תקציב מאושר', 'הוצאות', 'התחייבויות', 'יתרה', 'תקבולים', 'יתרת מזומן', 'ניצול %'];
  const rows = projects.map(p => {
    const s = calcProjectStats(p, expenses, commitments, payments, loans);
    return [p.name, p.source, s.approvedBudget, s.totalExpenses, s.totalCommitments, s.budgetBalance, s.totalReceived, s.cashBalance, s.utilizationPercent.toFixed(1) + '%'];
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'סיכום כל הפרויקטים');
  XLSX.writeFile(wb, 'דוח_כולל.xlsx');
}
