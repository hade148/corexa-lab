import { useMemo } from 'react';
import { useStore } from '../store';
import { calcProjectStats } from '../utils/calculations';
import { formatCurrency, isOverdue, isDueSoon } from '../utils/date';
import ProjectCard from '../components/ProjectCard';
import AlertBanner from '../components/AlertBanner';
import { TrendingUp, Wallet, Receipt, Handshake } from 'lucide-react';

export default function Dashboard() {
  const { projects, paymentSchedules, expenses, commitments, loans } = useStore();

  const allStats = useMemo(() =>
    projects.map(p => calcProjectStats(p, expenses, commitments, paymentSchedules, loans)),
    [projects, expenses, commitments, paymentSchedules, loans]
  );

  const totals = useMemo(() => ({
    approved: allStats.reduce((s, x) => s + x.approvedBudget, 0),
    received: allStats.reduce((s, x) => s + x.totalReceived, 0),
    expenses: allStats.reduce((s, x) => s + x.totalExpenses, 0),
    commitments: allStats.reduce((s, x) => s + x.totalCommitments, 0),
    balance: allStats.reduce((s, x) => s + x.budgetBalance, 0),
  }), [allStats]);

  const alerts = useMemo(() => {
    const result: Array<{ type: 'warning' | 'danger'; message: string }> = [];

    paymentSchedules
      .filter(ps => ps.status !== 'received')
      .forEach(ps => {
        if (isOverdue(ps.expectedDate)) {
          const proj = projects.find(p => p.id === ps.projectId);
          result.push({ type: 'danger', message: `פעימה באיחור בפרויקט "${proj?.name}" - ₪${ps.amount.toLocaleString()}` });
        }
      });

    loans
      .filter(l => l.status === 'active' || l.status === 'partially_returned')
      .forEach(l => {
        if (isOverdue(l.dueDate)) {
          const lender = projects.find(p => p.id === l.lenderProjectId);
          const borrower = projects.find(p => p.id === l.borrowerProjectId);
          result.push({ type: 'danger', message: `הלוואה באיחור: ${lender?.name} → ${borrower?.name} - ₪${l.remainingAmount.toLocaleString()}` });
        }
      });

    projects
      .filter(p => p.status === 'active')
      .forEach(p => {
        if (isDueSoon(p.endDate)) {
          result.push({ type: 'warning', message: `פרויקט "${p.name}" מסתיים בקרוב (${p.endDate})` });
        }
      });

    return result;
  }, [paymentSchedules, loans, projects]);

  const statCards = [
    { label: 'תקציב מאושר כולל', value: totals.approved, color: 'text-blue-700', bg: 'bg-blue-50', icon: TrendingUp },
    { label: 'סך תקבולים', value: totals.received, color: 'text-green-700', bg: 'bg-green-50', icon: Wallet },
    { label: 'סך הוצאות', value: totals.expenses, color: 'text-red-700', bg: 'bg-red-50', icon: Receipt },
    { label: 'יתרה תקציבית', value: totals.balance, color: totals.balance < 0 ? 'text-red-700' : 'text-indigo-700', bg: totals.balance < 0 ? 'bg-red-50' : 'bg-indigo-50', icon: Handshake },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">לוח בקרה ארגוני</h1>
        <p className="text-gray-500 text-sm mt-1">סקירה כללית של כלל הפרויקטים והתקציבים</p>
      </div>

      <AlertBanner alerts={alerts} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(card => (
          <div key={card.label} className={`rounded-xl p-4 ${card.bg} border border-gray-100`}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <span className="text-xs text-gray-600 font-medium">{card.label}</span>
            </div>
            <div className={`text-xl font-bold ${card.color}`}>{formatCurrency(card.value)}</div>
          </div>
        ))}
      </div>

      {/* Commitments summary bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">התחייבויות פתוחות: {formatCurrency(totals.commitments)}</div>
        <div className="text-xs text-gray-500">יתרה אחרי ניכוי התחייבויות: {formatCurrency(totals.balance)}</div>
      </div>

      {/* Projects grid */}
      <h2 className="text-lg font-bold text-gray-800 mb-3">פרויקטים ({projects.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project, i) => {
          const stats = allStats[i];
          return (
            <ProjectCard
              key={project.id}
              project={project}
              totalExpenses={stats.totalExpenses}
              totalCommitments={stats.totalCommitments}
              utilizationPercent={stats.utilizationPercent}
            />
          );
        })}
      </div>
    </div>
  );
}
