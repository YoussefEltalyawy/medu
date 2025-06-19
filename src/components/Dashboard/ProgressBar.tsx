import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label, className = "" }) => {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      <div className="flex row justify-between">
        {label && <span className="text-sm text-black mb-1">{label}</span>}
        {value && <span className="text-sm text-black">{value} / {max}</span>}
      </div>
      <div
        className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemax={max}
        role="progressbar"
      >
        <div
          className="absolute left-0 top-0 h-full bg-brand-green rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 