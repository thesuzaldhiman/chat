"use client";

import React from "react";
import { siteConfig } from "@/config/site";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {siteConfig.categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-[#2563EB] text-white shadow-2xs"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A] hover:border-slate-300"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
