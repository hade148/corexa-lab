import { useState } from 'react';
import { useStore } from '../../store';
import type { Category } from '../../types';

interface CommitmentFormProps {
  projectId: string;
  categories: Category[];
  onDone: () => void;
}

export default function CommitmentForm({ projectId, categories, onDone }: CommitmentFormProps) {
  const addCommitment = useStore(s => s.addCommitment);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    vendor: '',
    description: '',
    amount: '',
    categoryId: '',
    date: today,
    expectedPaymentDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendor || !form.amount || !form.categoryId) return;
    addCommitment({
      projectId,
      categoryId: form.categoryId,
      vendor: form.vendor,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      expectedPaymentDate: form.expectedPaymentDate,
      status: 'open',
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ספק *</label>
          <input type="text" required value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="שם הספק" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סעיף *</label>
          <select required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
          <input type="number" required min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך תשלום צפוי</label>
          <input type="date" value={form.expectedPaymentDate} onChange={e => setForm(f => ({ ...f, expectedPaymentDate: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
          <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="תיאור" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">הוסף התחייבות</button>
        <button type="button" onClick={onDone} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">ביטול</button>
      </div>
    </form>
  );
}
