import { FilterStatus } from "@/types/vocabulary";

interface FilterButtonsProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

export const FilterButtons = ({ currentFilter, onFilterChange }: FilterButtonsProps) => {
  const filters = [
    { key: "all" as const, label: "All", bgColor: "bg-[#082408]" },
    { key: "learning" as const, label: "Learning", bgColor: "bg-[#240808]" },
    { key: "familiar" as const, label: "Familiar", bgColor: "bg-[#4E4211]" },
    { key: "mastered" as const, label: "Mastered", bgColor: "bg-[#082408]" },
  ];

  return (
    <div className="flex space-x-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            currentFilter === filter.key
              ? `${filter.bgColor} text-white`
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};