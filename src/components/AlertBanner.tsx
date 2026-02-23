import { AlertTriangle, X } from 'lucide-react';

interface Alert {
  type: 'warning' | 'danger';
  message: string;
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: () => void;
}

export default function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  const hasDanger = alerts.some(a => a.type === 'danger');
  const bg = hasDanger ? 'bg-red-50 border-red-300 text-red-800' : 'bg-yellow-50 border-yellow-300 text-yellow-800';

  return (
    <div className={`border rounded-lg p-3 mb-4 flex items-start gap-3 ${bg}`}>
      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-semibold text-sm mb-1">התראות ({alerts.length})</div>
        <ul className="text-sm space-y-0.5">
          {alerts.map((a, i) => (
            <li key={i} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.type === 'danger' ? 'bg-red-500' : 'bg-yellow-500'}`} />
              {a.message}
            </li>
          ))}
        </ul>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 rounded hover:bg-black/10">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
