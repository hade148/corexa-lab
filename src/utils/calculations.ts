import type { Project, Expense, Commitment, PaymentSchedule, Loan } from '../types';

export function calcProjectStats(
  project: Project,
  expenses: Expense[],
  commitments: Commitment[],
  payments: PaymentSchedule[],
  loans: Loan[]
) {
  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const projectCommitments = commitments.filter(
    c => c.projectId === project.id && c.status !== 'cancelled' && c.status !== 'paid'
  );
  const projectPayments = payments.filter(p => p.projectId === project.id && p.status === 'received');

  const totalExpenses = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCommitments = projectCommitments.reduce((sum, c) => sum + c.amount, 0);
  const totalReceived = projectPayments.reduce((sum, p) => sum + (p.receivedAmount ?? p.amount), 0);

  const outgoingLoans = loans
    .filter(l => l.lenderProjectId === project.id && l.status !== 'returned')
    .reduce((sum, l) => sum + l.remainingAmount, 0);

  const incomingRepayments = loans
    .filter(l => l.borrowerProjectId === project.id)
    .reduce((sum, l) => sum + l.repayments.reduce((rs, r) => rs + r.amount, 0), 0);

  const budgetBalance = project.approvedBudget - totalExpenses - totalCommitments;
  const cashBalance = totalReceived - totalExpenses - outgoingLoans + incomingRepayments;
  const utilizationPercent = project.approvedBudget > 0
    ? Math.min(100, ((totalExpenses + totalCommitments) / project.approvedBudget) * 100)
    : 0;

  return {
    projectId: project.id,
    approvedBudget: project.approvedBudget,
    totalExpenses,
    totalCommitments,
    totalReceived,
    budgetBalance,
    cashBalance,
    utilizationPercent,
  };
}

export function calcCategoryBalance(
  categoryId: string,
  approvedAmount: number,
  expenses: Expense[],
  commitments: Commitment[]
) {
  const catExpenses = expenses.filter(e => e.categoryId === categoryId).reduce((s, e) => s + e.amount, 0);
  const catCommitments = commitments
    .filter(c => c.categoryId === categoryId && c.status !== 'cancelled' && c.status !== 'paid')
    .reduce((s, c) => s + c.amount, 0);
  return {
    expenses: catExpenses,
    commitments: catCommitments,
    balance: approvedAmount - catExpenses - catCommitments,
  };
}
