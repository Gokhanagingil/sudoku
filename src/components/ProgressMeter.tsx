interface ProgressMeterProps {
  value: number;
  max: number;
  label: string;
}

export function ProgressMeter({ value, max, label }: ProgressMeterProps) {
  const percentage = max <= 0 ? 100 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-meter" aria-label={`${label}: yüzde ${percentage}`}>
      <div className="progress-meter__track">
        <span style={{ width: `${percentage}%` }} />
      </div>
      <small>{label}</small>
    </div>
  );
}
