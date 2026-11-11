"use client";

import React, { useState, useMemo } from "react";
import { MOCK_ROOMS } from "@/data/mockData";
import RoomCard from "@/components/RoomCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import { ArrowUpDown, SearchX } from "lucide-react";

export default function RoomsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Rooms");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "alphabetical">("popular");

  // Filtering & Sorting
  const filteredRooms = useMemo(() => {
    let result = [...MOCK_ROOMS];

    // Filter by Category
    if (selectedCategory !== "All Rooms") {
      result = result.filter((room) => room.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(q) ||
          room.shortDescription.toLowerCase().includes(q) ||
          room.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "popular") {
      result.sort((a, b) => b.onlineCount - a.onlineCount);
    } else if (sortBy === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  const handleReset = () => {
    setSelectedCategory("All Rooms");
    setSearchQuery("");
    setSortBy("popular");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Page Header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight mb-2">
          Explore Chat Rooms
        </h1>
        <p className="text-sm text-[#64748B]">
          Find a room, join the conversation, and meet new people.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="w-full sm:max-w-md">
          <SearchBar
            query={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search rooms by name or interest..."
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "popular" | "alphabetical")}
            className="text-xs font-semibold text-[#1E293B] bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#2563EB] cursor-pointer shadow-2xs"
          >
            <option value="popular">Most Active (Online)</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-8">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Rooms Counter */}
      <div className="flex items-center justify-between text-xs text-[#64748B] mb-4">
        <span>
          Showing <strong className="text-[#1E293B]">{filteredRooms.length}</strong>{" "}
          {filteredRooms.length === 1 ? "room" : "rooms"}
        </span>
        {(selectedCategory !== "All Rooms" || searchQuery) && (
          <button
            onClick={handleReset}
            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Room Cards Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRooms.map((room) => (
            <RoomCard key={room.slug} room={room} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full py-16 px-4 bg-white border border-[#E2E8F0] rounded-2xl text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-[#64748B] flex items-center justify-center mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1E293B] mb-1">No rooms found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-5">
            We couldn&apos;t find any rooms matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try adjusting your search term or exploring another category.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
