import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VocabularyWord } from "@/types/vocabulary";
import { StatusBadge } from "./StatusBadge";

interface WordCardProps {
  word: VocabularyWord;
  onEdit: (word: VocabularyWord) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "learning" | "familiar" | "mastered") => void;
}

export const WordCard = ({ word, onEdit, onDelete, onStatusChange }: WordCardProps) => (
  <div className="bg-card rounded-2xl p-6 shadow-sm border border-[#5E7850]/20 dark:border-[#1d1d1d]">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-2">
          {word.german}
        </h3>
        <p className="opacity-50 mb-2">{word.english}</p>
        {word.example && (
          <p className="opacity-50 italic text-sm">
            &quot;{word.example}&quot;
          </p>
        )}
      </div>
      <div className="ml-4 flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(word)}
                disabled={word.isOptimistic}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(word.id)}
                disabled={word.isOptimistic}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <StatusBadge status={word.status} className="cursor-pointer" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {(["learning", "familiar", "mastered"] as const).map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onStatusChange(word.id, status)}
              >
                <StatusBadge status={status} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
);
