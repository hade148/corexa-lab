import { useStore } from '../store';
import { formatDate } from '../utils/date';

const actionLabel: Record<string, string> = {
  create: 'יצירה',
  update: 'עדכון',
  delete: 'מחיקה',
};

const entityTypeLabel: Record<string, string> = {
  project: 'פרויקט',
  expense: 'הוצאה',
  commitment: 'התחייבות',
  payment: 'פעימה',
  loan: 'הלוואה',
  loan_repayment: 'החזר הלוואה',
};

const actionColor: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
};

export default function AuditLog() {
  const { auditLogs } = useStore();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">יומן פעולות</h1>
        <p className="text-sm text-gray-500 mt-1">{auditLogs.length} רשומות</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">תאריך ושעה</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">משתמש</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">פעולה</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">סוג</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">פרטים</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">אין רשומות</td>
              </tr>
            )}
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  <div>{formatDate(log.timestamp.slice(0, 10))}</div>
                  <div className="text-xs text-gray-400">{log.timestamp.slice(11, 19)}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 hidden md:table-cell">{log.userName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColor[log.action] ?? 'bg-gray-100 text-gray-700'}`}>
                    {actionLabel[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                  {entityTypeLabel[log.entityType] ?? log.entityType}
                </td>
                <td className="px-4 py-3 text-gray-700">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
