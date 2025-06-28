import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="text-center py-8">
    <p className="text-red-500 mb-4">{error}</p>
    <Button
      onClick={onRetry}
      className="bg-[#082408] text-white px-4 py-2 rounded-full hover:bg-opacity-90"
    >
      Try Again
    </Button>
  </div>
);