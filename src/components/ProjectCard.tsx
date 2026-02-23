import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { formatCurrency } from '../utils/date';
import ProgressBar from './ProgressBar';

interface ProjectCardProps {
  project: Project;
  totalExpenses: number;
  totalCommitments: number;
  utilizationPercent: number;
}

const statusLabel: Record<string, string> = {
  active: 'פעיל',
  closed: 'סגור',
  suspended: 'מושהה',
};

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  suspended: 'bg-yellow-100 text-yellow-800',
};

export default function ProjectCard({ project, totalExpenses, totalCommitments, utilizationPercent }: ProjectCardProps) {
  const balance = project.approvedBudget - totalExpenses - totalCommitments;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base">{project.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{project.source}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[project.status] ?? 'bg-gray-100 text-gray-800'}`}>
          {statusLabel[project.status] ?? project.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <div className="text-gray-500">מאושר</div>
          <div className="font-semibold text-gray-900">{formatCurrency(project.approvedBudget)}</div>
        </div>
        <div>
          <div className="text-gray-500">יתרה</div>
          <div className={`font-semibold ${balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(balance)}</div>
        </div>
        <div>
          <div className="text-gray-500">הוצאות</div>
          <div className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</div>
        </div>
        <div>
          <div className="text-gray-500">התחייבויות</div>
          <div className="font-semibold text-orange-600">{formatCurrency(totalCommitments)}</div>
        </div>
      </div>

      <ProgressBar value={utilizationPercent} />

      <Link
        to={`/projects/${project.id}`}
        className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        צפה בפרויקט ←
      </Link>
    </div>
  );
}
