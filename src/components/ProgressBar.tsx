interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, showLabel = true, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color = clamped >= 90 ? 'bg-red-500' : clamped >= 70 ? 'bg-yellow-500' : 'bg-green-500';
  const height = size === 'sm' ? 'h-2' : 'h-3';

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-500 mt-1">{clamped.toFixed(1)}% נוצל</div>
      )}
    </div>
  );
}
