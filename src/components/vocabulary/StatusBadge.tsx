import { WordStatus } from "@/types/vocabulary";

interface StatusBadgeProps {
  status: WordStatus;
  className?: string;
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const statusConfig = {
    learning: {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      label: "Learning",
    },
    familiar: {
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      label: "Familiar",
    },
    mastered: {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      label: "Mastered",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.label}
    </span>
  );
};
