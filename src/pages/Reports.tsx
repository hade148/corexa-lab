import { useStore } from '../store';
import { calcProjectStats } from '../utils/calculations';
import { formatCurrency } from '../utils/date';
import { exportProjectReport, exportAllProjectsSummary } from '../utils/exportExcel';
import { FileDown, FileBarChart } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';

export default function Reports() {
  const { projects, paymentSchedules, expenses, commitments, loans } = useStore();

  const handleExportAll = () => {
    exportAllProjectsSummary(projects, expenses, commitments, paymentSchedules, loans);
  };

  const handleExportProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const projExpenses = expenses.filter(e => e.projectId === projectId);
    const projCommitments = commitments.filter(c => c.projectId === projectId);
    const projPayments = paymentSchedules.filter(p => p.projectId === projectId);
    const projLoans = loans.filter(l => l.lenderProjectId === projectId || l.borrowerProjectId === projectId);
    exportProjectReport(project, projExpenses, projCommitments, projPayments, projLoans, projects);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">דוחות וייצוא</h1>
          <p className="text-sm text-gray-500 mt-1">ייצוא נתונים לקובץ Excel</p>
        </div>
        <button
          onClick={handleExportAll}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <FileBarChart className="w-4 h-4" />
          ייצוא כל הפרויקטים
        </button>
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">סיכום כלל הפרויקטים</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">פרויקט</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">מקור</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">מאושר</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">הוצאות</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">התחייבויות</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">יתרה</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">ניצול</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map(project => {
              const s = calcProjectStats(project, expenses, commitments, paymentSchedules, loans);
              return (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{project.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{project.source}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(s.approvedBudget)}</td>
                  <td className="px-4 py-3 text-red-600 hidden lg:table-cell">{formatCurrency(s.totalExpenses)}</td>
                  <td className="px-4 py-3 text-orange-500 hidden lg:table-cell">{formatCurrency(s.totalCommitments)}</td>
                  <td className={`px-4 py-3 font-medium ${s.budgetBalance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {formatCurrency(s.budgetBalance)}
                  </td>
                  <td className="px-4 py-3 w-32 hidden md:table-cell">
                    <ProgressBar value={s.utilizationPercent} size="sm" showLabel={false} />
                    <div className="text-xs text-gray-400 mt-0.5">{s.utilizationPercent.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleExportProject(project.id)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      <FileDown className="w-3 h-3" /> Excel
                    </button>
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
