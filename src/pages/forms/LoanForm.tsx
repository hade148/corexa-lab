import { useState } from 'react';
import { useStore } from '../../store';
import { calcProjectStats } from '../../utils/calculations';
import { formatCurrency } from '../../utils/date';

interface LoanFormProps {
  sourceProjectId: string;
  onDone: () => void;
}

export default function LoanForm({ sourceProjectId, onDone }: LoanFormProps) {
  const { projects, paymentSchedules, expenses, commitments, loans, addLoan } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    lenderProjectId: sourceProjectId,
    borrowerProjectId: '',
    amount: '',
    date: today,
    dueDate: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  const otherProjects = projects.filter(p => p.id !== form.lenderProjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.borrowerProjectId || !form.amount || !form.dueDate) return;

    const lender = projects.find(p => p.id === form.lenderProjectId);
    if (!lender) return;

    const lenderStats = calcProjectStats(lender, expenses, commitments, paymentSchedules, loans);
    if (Number(form.amount) > lenderStats.cashBalance) {
      setError(`הלוואה חורגת מיתרת המזומן הזמינה! יתרה: ${formatCurrency(lenderStats.cashBalance)}`);
      return;
    }

    addLoan({
      lenderProjectId: form.lenderProjectId,
      borrowerProjectId: form.borrowerProjectId,
      amount: Number(form.amount),
      date: form.date,
      dueDate: form.dueDate,
      description: form.description,
      status: 'active',
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm">
          ⚠️ {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">פרויקט מלווה *</label>
          <select
            required
            value={form.lenderProjectId}
            onChange={e => setForm(f => ({ ...f, lenderProjectId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">פרויקט לווה *</label>
          <select
            required
            value={form.borrowerProjectId}
            onChange={e => setForm(f => ({ ...f, borrowerProjectId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- בחר פרויקט --</option>
            {otherProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סכום (₪) *</label>
          <input type="number" required min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך פירעון *</label>
          <input type="date" required value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
          <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="תיאור ההלוואה" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">הוסף הלוואה</button>
        <button type="button" onClick={onDone} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">ביטול</button>
      </div>
    </form>
  );
}
