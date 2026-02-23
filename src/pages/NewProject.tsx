import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Category } from '../types';
import { Plus, Trash2 } from 'lucide-react';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function NewProject() {
  const navigate = useNavigate();
  const addProject = useStore(s => s.addProject);

  const [form, setForm] = useState({
    name: '',
    description: '',
    source: '',
    approvedBudget: '',
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'closed' | 'suspended',
  });

  const [categories, setCategories] = useState<Omit<Category, 'id' | 'projectId'>[]>([
    { name: '', approvedAmount: 0, parentId: null, children: [] }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.source || !form.approvedBudget) return;

    const id = addProject({
      ...form,
      approvedBudget: Number(form.approvedBudget),
      categories: categories
        .filter(c => c.name.trim())
        .map(c => ({ ...c, id: uid(), projectId: '' })),
    });
    navigate(`/projects/${id}`);
  };

  const addCategory = () => {
    setCategories(prev => [...prev, { name: '', approvedAmount: 0, parentId: null, children: [] }]);
  };

  const updateCategory = (i: number, updates: Partial<Omit<Category, 'id' | 'projectId'>>) => {
    setCategories(prev => prev.map((c, idx) => idx === i ? { ...c, ...updates } : c));
  };

  const removeCategory = (i: number) => {
    setCategories(prev => prev.filter((_, idx) => idx !== i));
  };

  const addSubCategory = (parentIdx: number) => {
    const parentTempId = `temp_${parentIdx}`;
    setCategories(prev => {
      const updated = [...prev];
      if (!updated[parentIdx].children) updated[parentIdx] = { ...updated[parentIdx], children: [] };
      updated[parentIdx] = {
        ...updated[parentIdx],
        children: [...(updated[parentIdx].children ?? []), { id: uid(), projectId: '', name: '', approvedAmount: 0, parentId: parentTempId }]
      };
      return updated;
    });
  };

  const updateSubCategory = (parentIdx: number, subIdx: number, updates: Partial<Category>) => {
    setCategories(prev => {
      const updated = [...prev];
      const children = [...(updated[parentIdx].children ?? [])];
      children[subIdx] = { ...children[subIdx], ...updates };
      updated[parentIdx] = { ...updated[parentIdx], children };
      return updated;
    });
  };

  const removeSubCategory = (parentIdx: number, subIdx: number) => {
    setCategories(prev => {
      const updated = [...prev];
      updated[parentIdx] = {
        ...updated[parentIdx],
        children: (updated[parentIdx].children ?? []).filter((_, i) => i !== subIdx)
      };
      return updated;
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">פרויקט חדש</h1>
        <p className="text-sm text-gray-500 mt-1">הוסף תב"ר / פרויקט חדש למערכת</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">פרטי הפרויקט</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם הפרויקט *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="שם הפרויקט"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="תיאור קצר של הפרויקט"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מקור מימון *</label>
              <input
                type="text"
                required
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="כגון: משרד הפנים, קרן X"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תקציב מאושר (₪) *</label>
              <input
                type="number"
                required
                min="0"
                value={form.approvedBudget}
                onChange={e => setForm(f => ({ ...f, approvedBudget: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך התחלה</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך סיום</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'closed' | 'suspended' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">פעיל</option>
              <option value="suspended">מושהה</option>
              <option value="closed">סגור</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">סעיפי תקציב</h2>
            <button type="button" onClick={addCategory} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Plus className="w-4 h-4" /> הוסף סעיף
            </button>
          </div>
          <div className="space-y-4">
            {categories.map((cat, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={e => updateCategory(i, { name: e.target.value })}
                    placeholder="שם הסעיף"
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={cat.approvedAmount || ''}
                    onChange={e => updateCategory(i, { approvedAmount: Number(e.target.value) })}
                    placeholder="סכום מאושר"
                    className="w-32 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => removeCategory(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub-categories */}
                {cat.children && cat.children.length > 0 && (
                  <div className="mr-4 space-y-2 mb-2">
                    {cat.children.map((sub, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-3 h-px bg-gray-300" />
                        <input
                          type="text"
                          value={sub.name}
                          onChange={e => updateSubCategory(i, j, { name: e.target.value })}
                          placeholder="שם תת-סעיף"
                          className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={sub.approvedAmount || ''}
                          onChange={e => updateSubCategory(i, j, { approvedAmount: Number(e.target.value) })}
                          placeholder="סכום"
                          className="w-28 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button type="button" onClick={() => removeSubCategory(i, j)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => addSubCategory(i)}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 mr-4"
                >
                  <Plus className="w-3 h-3" /> הוסף תת-סעיף
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            צור פרויקט
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
