interface EmptyStateProps {
  hasWords: boolean;
  filter: string;
}

export const EmptyState = ({ hasWords, filter }: EmptyStateProps) => (
  <div className="text-center py-8 text-gray-500">
    {!hasWords
      ? "No vocabulary words found. Add your first word!"
      : `No ${filter} words found.`}
  </div>
);