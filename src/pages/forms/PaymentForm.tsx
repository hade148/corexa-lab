import { useState } from 'react';
import { useStore } from '../../store';

interface PaymentFormProps {
  projectId: string;
  onDone: () => void;
}

export default function PaymentForm({ projectId, onDone }: PaymentFormProps) {
  const addPaymentSchedule = useStore(s => s.addPaymentSchedule);
  const [form, setForm] = useState({
    expectedDate: '',
    amount: '',
    condition: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.expectedDate || !form.amount) return;
    addPaymentSchedule({
      projectId,
      expectedDate: form.expectedDate,
      amount: Number(form.amount),
      condition: form.condition,
      notes: form.notes,
      status: 'pending',
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך צפוי *</label>
          <input type="date" required value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סכום (₪) *</label>
          <input type="number" required min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תנאי קבלה</label>
          <input type="text" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="כגון: הגשת דוח" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
          <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="הערות" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">הוסף פעימה</button>
        <button type="button" onClick={onDone} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">ביטול</button>
      </div>
    </form>
  );
}
