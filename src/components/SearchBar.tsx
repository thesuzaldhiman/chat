"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  query,
  onChange,
  placeholder = "Search rooms by name or interest...",
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] shadow-2xs transition-all"
      />
      {query && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#1E293B] cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
