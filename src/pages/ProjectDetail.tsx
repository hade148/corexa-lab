import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { calcProjectStats, calcCategoryBalance } from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/date';
import AlertBanner from '../components/AlertBanner';
import { isOverdue } from '../utils/date';
import { Plus, CheckCircle, ArrowLeft, FileDown } from 'lucide-react';
import { exportProjectReport } from '../utils/exportExcel';

// Forms embedded in the page
import ExpenseForm from './forms/ExpenseForm';
import CommitmentForm from './forms/CommitmentForm';
import PaymentForm from './forms/PaymentForm';
import LoanForm from './forms/LoanForm';

type ActiveForm = 'expense' | 'commitment' | 'payment' | 'loan' | null;

const paymentStatusLabel: Record<string, string> = { pending: 'ממתין', received: 'התקבל', overdue: 'באיחור' };
const paymentStatusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  received: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

const commitmentStatusLabel: Record<string, string> = {
  open: 'פתוח', partially_paid: 'שולם חלקית', paid: 'שולם', cancelled: 'בוטל'
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { projects, paymentSchedules, expenses, commitments, loans, markPaymentReceived, convertCommitmentToExpense } = useStore();

  const project = projects.find(p => p.id === id);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [markingPaymentId, setMarkingPaymentId] = useState<string | null>(null);
  const [markAmount, setMarkAmount] = useState('');
  const [markDate, setMarkDate] = useState(() => new Date().toISOString().slice(0, 10));

  const projectExpenses = useMemo(() => expenses.filter(e => e.projectId === id), [expenses, id]);
  const projectCommitments = useMemo(() => commitments.filter(c => c.projectId === id), [commitments, id]);
  const projectPayments = useMemo(() => paymentSchedules.filter(ps => ps.projectId === id), [paymentSchedules, id]);
  const projectLoans = useMemo(() => loans.filter(l => l.lenderProjectId === id || l.borrowerProjectId === id), [loans, id]);

  const stats = useMemo(() => {
    if (!project) return null;
    return calcProjectStats(project, expenses, commitments, paymentSchedules, loans);
  }, [project, expenses, commitments, paymentSchedules, loans]);

  const alerts = useMemo(() => {
    const result: Array<{ type: 'warning' | 'danger'; message: string }> = [];
    projectPayments.filter(ps => ps.status !== 'received' && isOverdue(ps.expectedDate))
      .forEach(ps => result.push({ type: 'danger', message: `פעימה באיחור - ₪${ps.amount.toLocaleString()}` }));
    if (stats && stats.budgetBalance < 0)
      result.push({ type: 'danger', message: `חריגה תקציבית! יתרה: ${formatCurrency(stats.budgetBalance)}` });
    return result;
  }, [projectPayments, stats]);

  const getCategoryName = (catId: string) => {
    if (!project) return catId;
    const flat = [...project.categories, ...project.categories.flatMap(c => c.children ?? [])];
    return flat.find(c => c.id === catId)?.name ?? catId;
  };

  if (!project || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">פרויקט לא נמצא</p>
        <Link to="/projects" className="text-blue-600 mt-2 inline-block">חזור לרשימת הפרויקטים</Link>
      </div>
    );
  }

  const handleExport = () => {
    exportProjectReport(project, projectExpenses, projectCommitments, projectPayments, projectLoans, projects);
  };

  const handleMarkPayment = (psId: string) => {
    const ps = paymentSchedules.find(p => p.id === psId);
    if (!ps) return;
    markPaymentReceived(psId, markDate, Number(markAmount) || ps.amount);
    setMarkingPaymentId(null);
    setMarkAmount('');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3 h-3" /> חזור לפרויקטים
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{project.source} | {project.description}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport} className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors">
            <FileDown className="w-4 h-4" /> ייצוא Excel
          </button>
          <button onClick={() => setActiveForm('payment')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors">
            <Plus className="w-4 h-4" /> פעימה
          </button>
          <button onClick={() => setActiveForm('commitment')} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors">
            <Plus className="w-4 h-4" /> התחייבות
          </button>
          <button onClick={() => setActiveForm('expense')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors">
            <Plus className="w-4 h-4" /> הוצאה
          </button>
          <button onClick={() => setActiveForm('loan')} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors">
            <Plus className="w-4 h-4" /> הלוואה
          </button>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      {/* Active Form Panel */}
      {activeForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              {activeForm === 'expense' ? 'הוצאה חדשה' :
               activeForm === 'commitment' ? 'התחייבות חדשה' :
               activeForm === 'payment' ? 'פעימה חדשה' : 'הלוואה חדשה'}
            </h2>
            <button onClick={() => setActiveForm(null)} className="text-gray-400 hover:text-gray-600 text-sm">ביטול</button>
          </div>
          {activeForm === 'expense' && <ExpenseForm projectId={project.id} categories={project.categories} onDone={() => setActiveForm(null)} expenses={projectExpenses} commitments={projectCommitments} />}
          {activeForm === 'commitment' && <CommitmentForm projectId={project.id} categories={project.categories} onDone={() => setActiveForm(null)} />}
          {activeForm === 'payment' && <PaymentForm projectId={project.id} onDone={() => setActiveForm(null)} />}
          {activeForm === 'loan' && <LoanForm sourceProjectId={project.id} onDone={() => setActiveForm(null)} />}
        </div>
      )}

      {/* Budget Thermometer */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">מצב תקציבי</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">מאושר</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(stats.approvedBudget)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">הוצאות</div>
            <div className="text-lg font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">התחייבויות</div>
            <div className="text-lg font-bold text-orange-500">{formatCurrency(stats.totalCommitments)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">יתרה</div>
            <div className={`text-lg font-bold ${stats.budgetBalance < 0 ? 'text-red-700' : 'text-green-700'}`}>
              {formatCurrency(stats.budgetBalance)}
            </div>
          </div>
        </div>
        {/* Stacked bar */}
        <div className="h-6 rounded-full overflow-hidden flex bg-gray-100">
          <div
            className="bg-red-500 h-full transition-all"
            style={{ width: `${Math.min(100, (stats.totalExpenses / stats.approvedBudget) * 100)}%` }}
            title={`הוצאות: ${formatCurrency(stats.totalExpenses)}`}
          />
          <div
            className="bg-orange-400 h-full transition-all"
            style={{ width: `${Math.min(100 - (stats.totalExpenses / stats.approvedBudget) * 100, (stats.totalCommitments / stats.approvedBudget) * 100)}%` }}
            title={`התחייבויות: ${formatCurrency(stats.totalCommitments)}`}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> הוצאות</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block" /> התחייבויות</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" /> יתרה</span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">תקבולים שהתקבלו:</span>
            <span className="font-medium text-green-700">{formatCurrency(stats.totalReceived)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">יתרת מזומן:</span>
            <span className={`font-medium ${stats.cashBalance < 0 ? 'text-red-600' : 'text-blue-700'}`}>{formatCurrency(stats.cashBalance)}</span>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">סעיפי תקציב</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-600">סעיף</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">מאושר</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">הוצאות</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">התחייבויות</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">יתרה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {project.categories.map(cat => {
              const catBal = calcCategoryBalance(cat.id, cat.approvedAmount, projectExpenses, projectCommitments);
              return [
                <tr key={cat.id} className="font-medium bg-gray-50/50">
                  <td className="px-4 py-2.5 text-gray-800">{cat.name}</td>
                  <td className="px-4 py-2.5 text-left text-gray-700">{formatCurrency(cat.approvedAmount)}</td>
                  <td className="px-4 py-2.5 text-left text-red-600">{formatCurrency(catBal.expenses)}</td>
                  <td className="px-4 py-2.5 text-left text-orange-600">{formatCurrency(catBal.commitments)}</td>
                  <td className={`px-4 py-2.5 text-left font-semibold ${catBal.balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {formatCurrency(catBal.balance)}
                  </td>
                </tr>,
                ...(cat.children ?? []).map(sub => {
                  const subBal = calcCategoryBalance(sub.id, sub.approvedAmount, projectExpenses, projectCommitments);
                  return (
                    <tr key={sub.id} className="text-gray-600">
                      <td className="px-4 py-2 pr-8 text-gray-600">↳ {sub.name}</td>
                      <td className="px-4 py-2 text-left">{formatCurrency(sub.approvedAmount)}</td>
                      <td className="px-4 py-2 text-left text-red-500">{formatCurrency(subBal.expenses)}</td>
                      <td className="px-4 py-2 text-left text-orange-500">{formatCurrency(subBal.commitments)}</td>
                      <td className={`px-4 py-2 text-left ${subBal.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(subBal.balance)}
                      </td>
                    </tr>
                  );
                })
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* Two column layout for payments and expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment Schedules */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">פעימות ({projectPayments.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {projectPayments.length === 0 && <p className="text-sm text-gray-400 p-4">אין פעימות</p>}
            {projectPayments.map(ps => (
              <div key={ps.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-800">{formatCurrency(ps.amount)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(ps.expectedDate)} | {ps.condition || 'ללא תנאי'}
                    </div>
                    {ps.notes && <div className="text-xs text-gray-400 mt-0.5">{ps.notes}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColor[ps.status] ?? ''}`}>
                      {paymentStatusLabel[ps.status] ?? ps.status}
                    </span>
                    {ps.status !== 'received' && markingPaymentId !== ps.id && (
                      <button
                        onClick={() => { setMarkingPaymentId(ps.id); setMarkAmount(String(ps.amount)); }}
                        className="text-xs text-green-600 hover:text-green-800 flex items-center gap-0.5"
                      >
                        <CheckCircle className="w-3 h-3" /> סמן כהתקבל
                      </button>
                    )}
                  </div>
                </div>
                {markingPaymentId === ps.id && (
                  <div className="mt-2 flex items-center gap-2">
                    <input type="date" value={markDate} onChange={e => setMarkDate(e.target.value)} className="text-xs border rounded px-2 py-1" />
                    <input type="number" value={markAmount} onChange={e => setMarkAmount(e.target.value)} className="text-xs border rounded px-2 py-1 w-24" placeholder="סכום" />
                    <button onClick={() => handleMarkPayment(ps.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">אשר</button>
                    <button onClick={() => setMarkingPaymentId(null)} className="text-xs text-gray-500">ביטול</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">הוצאות אחרונות ({projectExpenses.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {projectExpenses.length === 0 && <p className="text-sm text-gray-400 p-4">אין הוצאות</p>}
            {[...projectExpenses].reverse().slice(0, 8).map(exp => (
              <div key={exp.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-800">{exp.vendor}</div>
                  <div className="text-xs text-gray-500">{formatDate(exp.date)} | {getCategoryName(exp.categoryId)}</div>
                  <div className="text-xs text-gray-400">{exp.description}</div>
                </div>
                <div className="font-semibold text-red-600 text-sm">{formatCurrency(exp.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commitments */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">התחייבויות ({projectCommitments.length})</h2>
        </div>
        {projectCommitments.length === 0 ? (
          <p className="text-sm text-gray-400 p-4">אין התחייבויות</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-2 font-semibold text-gray-600">ספק</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-600 hidden md:table-cell">תיאור</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-600">סכום</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-600 hidden md:table-cell">תאריך תשלום</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-600">סטטוס</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projectCommitments.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 text-gray-800 font-medium">{c.vendor}</td>
                  <td className="px-4 py-2.5 text-gray-600 hidden md:table-cell">{c.description}</td>
                  <td className="px-4 py-2.5 text-orange-600 font-medium">{formatCurrency(c.amount)}</td>
                  <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{formatDate(c.expectedPaymentDate)}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      {commitmentStatusLabel[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {(c.status === 'open' || c.status === 'partially_paid') && (
                      <button
                        onClick={() => convertCommitmentToExpense(c.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        המר להוצאה
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Loans */}
      {projectLoans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">הלוואות ({projectLoans.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {projectLoans.map(loan => {
              const lender = projects.find(p => p.id === loan.lenderProjectId);
              const borrower = projects.find(p => p.id === loan.borrowerProjectId);
              const isLender = loan.lenderProjectId === id;
              return (
                <div key={loan.id} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {isLender ? `הלוואה ל-${borrower?.name}` : `הלוואה מ-${lender?.name}`}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(loan.date)} | פירעון: {formatDate(loan.dueDate)}</div>
                    <div className="text-xs text-gray-400">{loan.description}</div>
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold text-sm ${isLender ? 'text-red-600' : 'text-green-700'}`}>
                      {isLender ? '-' : '+'}{formatCurrency(loan.remainingAmount)}
                    </div>
                    <div className="text-xs text-gray-400">מתוך {formatCurrency(loan.amount)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
