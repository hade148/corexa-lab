import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { calcProjectStats } from '../utils/calculations';
import { formatCurrency } from '../utils/date';
import ProgressBar from '../components/ProgressBar';
import { Plus } from 'lucide-react';

const statusLabel: Record<string, string> = { active: 'פעיל', closed: 'סגור', suspended: 'מושהה' };
const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  suspended: 'bg-yellow-100 text-yellow-800',
};

export default function Projects() {
  const { projects, paymentSchedules, expenses, commitments, loans } = useStore();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">פרויקטים / תב"רים</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} פרויקטים במערכת</p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          פרויקט חדש
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">שם פרויקט</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">מקור מימון</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">תקציב מאושר</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 hidden lg:table-cell">הוצאות</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 hidden lg:table-cell">יתרה</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">ניצול</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">סטטוס</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map(project => {
              const s = calcProjectStats(project, expenses, commitments, paymentSchedules, loans);
              return (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.description.slice(0, 50)}{project.description.length > 50 ? '...' : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{project.source}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(s.approvedBudget)}</td>
                  <td className="px-4 py-3 text-sm text-red-600 hidden lg:table-cell">{formatCurrency(s.totalExpenses)}</td>
                  <td className="px-4 py-3 text-sm hidden lg:table-cell">
                    <span className={s.budgetBalance < 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {formatCurrency(s.budgetBalance)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell w-32">
                    <ProgressBar value={s.utilizationPercent} size="sm" showLabel={false} />
                    <div className="text-xs text-gray-500 mt-0.5">{s.utilizationPercent.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[project.status] ?? ''}`}>
                      {statusLabel[project.status] ?? project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      פרטים
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
