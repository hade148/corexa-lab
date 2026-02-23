import { useState } from 'react';
import { useStore } from '../store';
import { calcProjectStats } from '../utils/calculations';
import { formatCurrency, formatDate, isOverdue } from '../utils/date';
import { Plus } from 'lucide-react';

const loanStatusLabel: Record<string, string> = {
  active: 'פעיל', partially_returned: 'הוחזר חלקית', returned: 'הוחזר', overdue: 'באיחור'
};
const loanStatusColor: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  partially_returned: 'bg-yellow-100 text-yellow-800',
  returned: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

export default function Loans() {
  const { projects, loans, paymentSchedules, expenses, commitments, addLoan, addLoanRepayment } = useStore();
  const [showNewLoan, setShowNewLoan] = useState(false);
  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentDate, setRepaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [repaymentNotes, setRepaymentNotes] = useState('');

  const [newLoan, setNewLoan] = useState({
    lenderProjectId: projects[0]?.id ?? '',
    borrowerProjectId: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    dueDate: '',
    description: '',
  });
  const [loanError, setLoanError] = useState<string | null>(null);

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanError(null);
    const lender = projects.find(p => p.id === newLoan.lenderProjectId);
    if (!lender) return;
    const stats = calcProjectStats(lender, expenses, commitments, paymentSchedules, loans);
    if (Number(newLoan.amount) > stats.cashBalance) {
      setLoanError(`סכום חורג מיתרת המזומן של ${lender.name}! יתרה: ${formatCurrency(stats.cashBalance)}`);
      return;
    }
    addLoan({
      lenderProjectId: newLoan.lenderProjectId,
      borrowerProjectId: newLoan.borrowerProjectId,
      amount: Number(newLoan.amount),
      date: newLoan.date,
      dueDate: newLoan.dueDate,
      description: newLoan.description,
      status: 'active',
    });
    setShowNewLoan(false);
    setNewLoan({ lenderProjectId: projects[0]?.id ?? '', borrowerProjectId: '', amount: '', date: new Date().toISOString().slice(0, 10), dueDate: '', description: '' });
  };

  const handleRepayment = (loanId: string) => {
    if (!repaymentAmount) return;
    addLoanRepayment(loanId, {
      amount: Number(repaymentAmount),
      date: repaymentDate,
      notes: repaymentNotes,
    });
    setRepayingLoanId(null);
    setRepaymentAmount('');
    setRepaymentNotes('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הלוואות בין פרויקטים</h1>
          <p className="text-sm text-gray-500 mt-1">{loans.length} הלוואות במערכת</p>
        </div>
        <button
          onClick={() => setShowNewLoan(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> הלוואה חדשה
        </button>
      </div>

      {showNewLoan && (
        <form onSubmit={handleAddLoan} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">הלוואה חדשה</h2>
          {loanError && <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm mb-3">⚠️ {loanError}</div>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">פרויקט מלווה *</label>
              <select required value={newLoan.lenderProjectId} onChange={e => setNewLoan(f => ({ ...f, lenderProjectId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">פרויקט לווה *</label>
              <select required value={newLoan.borrowerProjectId} onChange={e => setNewLoan(f => ({ ...f, borrowerProjectId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- בחר --</option>
                {projects.filter(p => p.id !== newLoan.lenderProjectId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סכום *</label>
              <input type="number" required min="0" value={newLoan.amount} onChange={e => setNewLoan(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="₪" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך פירעון *</label>
              <input type="date" required value={newLoan.dueDate} onChange={e => setNewLoan(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
              <input type="text" value={newLoan.description} onChange={e => setNewLoan(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="תיאור" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">צור הלוואה</button>
            <button type="button" onClick={() => setShowNewLoan(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">ביטול</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loans.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            אין הלוואות בין פרויקטים
          </div>
        )}
        {loans.map(loan => {
          const lender = projects.find(p => p.id === loan.lenderProjectId);
          const borrower = projects.find(p => p.id === loan.borrowerProjectId);
          const overdue = isOverdue(loan.dueDate) && loan.status !== 'returned';
          return (
            <div key={loan.id} className={`bg-white rounded-xl border p-5 ${overdue ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    {lender?.name} <span className="text-gray-400 font-normal">→</span> {borrower?.name}
                  </div>
                  <div className="text-sm text-gray-500">{loan.description}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${loanStatusColor[loan.status] ?? ''}`}>
                  {loanStatusLabel[loan.status] ?? loan.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                <div>
                  <div className="text-gray-500 text-xs">סכום מקורי</div>
                  <div className="font-medium">{formatCurrency(loan.amount)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">יתרה</div>
                  <div className="font-medium text-orange-600">{formatCurrency(loan.remainingAmount)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">פירעון</div>
                  <div className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>{formatDate(loan.dueDate)}</div>
                </div>
              </div>

              {loan.repayments.length > 0 && (
                <div className="text-xs text-gray-500 mb-3">
                  {loan.repayments.map(r => (
                    <span key={r.id} className="ml-2">{formatDate(r.date)}: {formatCurrency(r.amount)}</span>
                  ))}
                </div>
              )}

              {loan.status !== 'returned' && (
                repayingLoanId === loan.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="number" value={repaymentAmount} onChange={e => setRepaymentAmount(e.target.value)}
                      placeholder="סכום" className="border border-gray-300 rounded px-2 py-1 text-sm w-28" />
                    <input type="date" value={repaymentDate} onChange={e => setRepaymentDate(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm" />
                    <input type="text" value={repaymentNotes} onChange={e => setRepaymentNotes(e.target.value)}
                      placeholder="הערות" className="border border-gray-300 rounded px-2 py-1 text-sm flex-1" />
                    <button onClick={() => handleRepayment(loan.id)}
                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded transition-colors hover:bg-green-700">אשר</button>
                    <button onClick={() => setRepayingLoanId(null)} className="text-gray-500 text-xs">ביטול</button>
                  </div>
                ) : (
                  <button onClick={() => setRepayingLoanId(loan.id)}
                    className="text-sm text-green-600 hover:text-green-800 font-medium">
                    + רשום החזר
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
