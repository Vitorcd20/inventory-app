import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  selectedCount?: number;
  selectedLabel?: string;
  actions?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "Pesquisar...",
  actions,
  disabled = false,
  className = "",
}: SearchBarProps) {
  return (
    <div className={`flex justify-between items-center gap-4 mb-6 ${className}`}>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled}
        />
      </div>


      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}