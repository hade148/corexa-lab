import { useState } from 'react';
import { useStore } from '../../store';
import type { Category, Expense, Commitment } from '../../types';
import { calcCategoryBalance } from '../../utils/calculations';
import { formatCurrency } from '../../utils/date';

interface ExpenseFormProps {
  projectId: string;
  categories: Category[];
  expenses: Expense[];
  commitments: Commitment[];
  onDone: () => void;
}

function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap(c => [c, ...(c.children ?? [])]);
}

export default function ExpenseForm({ projectId, categories, expenses, commitments, onDone }: ExpenseFormProps) {
  const addExpense = useStore(s => s.addExpense);
  const [form, setForm] = useState({
    vendor: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    amount: '',
    categoryId: '',
  });
  const [warning, setWarning] = useState<string | null>(null);

  const flatCats = flattenCategories(categories);

  const handleAmountChange = (val: string) => {
    setForm(f => ({ ...f, amount: val }));
    if (form.categoryId && val) {
      const cat = flatCats.find(c => c.id === form.categoryId);
      if (cat) {
        const bal = calcCategoryBalance(cat.id, cat.approvedAmount, expenses, commitments);
        if (Number(val) > bal.balance) {
          setWarning(`סכום חורג מיתרת הסעיף! יתרה: ${formatCurrency(bal.balance)}`);
        } else {
          setWarning(null);
        }
      }
    }
  };

  const handleCategoryChange = (catId: string) => {
    setForm(f => ({ ...f, categoryId: catId }));
    if (catId && form.amount) {
      const cat = flatCats.find(c => c.id === catId);
      if (cat) {
        const bal = calcCategoryBalance(cat.id, cat.approvedAmount, expenses, commitments);
        if (Number(form.amount) > bal.balance) {
          setWarning(`סכום חורג מיתרת הסעיף! יתרה: ${formatCurrency(bal.balance)}`);
        } else {
          setWarning(null);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendor || !form.amount || !form.categoryId) return;
    addExpense({
      projectId,
      categoryId: form.categoryId,
      vendor: form.vendor,
      date: form.date,
      description: form.description,
      amount: Number(form.amount),
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {warning && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-3 text-sm">
          ⚠️ {warning}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ספק *</label>
          <input
            type="text"
            required
            value={form.vendor}
            onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="שם הספק"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך *</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סעיף *</label>
          <select
            required
            value={form.categoryId}
            onChange={e => handleCategoryChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- בחר סעיף --</option>
            {categories.map(cat => (
              <optgroup key={cat.id} label={cat.name}>
                <option value={cat.id}>{cat.name}</option>
                {(cat.children ?? []).map(sub => (
                  <option key={sub.id} value={sub.id}>↳ {sub.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סכום (₪) *</label>
          <input
            type="number"
            required
            min="0"
            value={form.amount}
            onChange={e => handleAmountChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="תיאור ההוצאה"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          הוסף הוצאה
        </button>
        <button type="button" onClick={onDone} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          ביטול
        </button>
      </div>
    </form>
  );
}
