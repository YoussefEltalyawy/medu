import { WordStatus } from "@/types/vocabulary";

interface StatusBadgeProps {
  status: WordStatus;
  className?: string;
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const statusConfig = {
    learning: {
      bgColor: "bg-red-800",
      textColor: "text-red-100",
      label: "Learning",
    },
    familiar: {
      bgColor: "bg-yellow-800",
      textColor: "text-yellow-100",
      label: "Familiar",
    },
    mastered: {
      bgColor: "bg-green-800",
      textColor: "text-green-100",
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
