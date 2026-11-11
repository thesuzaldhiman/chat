"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MOCK_ROOMS } from "@/data/mockData";
import { ChatRoom } from "@/types";
import RoomCard from "@/components/RoomCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import { ArrowUpDown, SearchX, Plus, X, Sparkles } from "lucide-react";

function RoomsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState("All Rooms");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<"popular" | "alphabetical">("popular");
  const [customRooms, setCustomRooms] = useState<ChatRoom[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Room Form State
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCategory, setNewRoomCategory] = useState("General");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomColor, setNewRoomColor] = useState("#2563EB");

  // Sync searchQuery with URL query parameter
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Load custom rooms from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("chatverse_custom_rooms");
      if (stored) {
        setCustomRooms(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Combine default rooms with custom rooms
  const allRooms = useMemo(() => {
    return [...MOCK_ROOMS, ...customRooms];
  }, [customRooms]);

  // Filtering & Sorting
  const filteredRooms = useMemo(() => {
    let result = [...allRooms];

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
  }, [allRooms, selectedCategory, searchQuery, sortBy]);

  const handleReset = () => {
    setSelectedCategory("All Rooms");
    setSearchQuery("");
    setSortBy("popular");
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newRoomName.trim();
    if (!cleanName) return;

    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const initials = cleanName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newRoom: ChatRoom = {
      slug: slug || `room-${Date.now()}`,
      name: cleanName,
      category: newRoomCategory,
      shortDescription: newRoomDesc.trim() || `Welcome to ${cleanName}! Join the live conversation.`,
      longDescription: newRoomDesc.trim() || `An open community room for ${cleanName}. Meet members and share thoughts.`,
      onlineCount: 1,
      totalMembers: 1,
      isPrivate: false,
      initials: initials || "CR",
      accentBg: "#EFF6FF",
      accentColor: newRoomColor,
    };

    const updated = [newRoom, ...customRooms];
    setCustomRooms(updated);
    try {
      localStorage.setItem("chatverse_custom_rooms", JSON.stringify(updated));
    } catch {}

    setIsCreateModalOpen(false);
    setNewRoomName("");
    setNewRoomDesc("");
    router.push(`/rooms/${newRoom.slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
            Explore Chat Rooms
          </h1>
          <p className="text-sm text-[#64748B]">
            Find a room, join the conversation, and meet new people.
          </p>
        </div>

        {/* Create Room Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Room</span>
        </button>
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
            className="text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#2563EB] cursor-pointer shadow-2xs"
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
          Showing <strong className="text-[#0F172A]">{filteredRooms.length}</strong>{" "}
          {filteredRooms.length === 1 ? "room" : "rooms"}
        </span>
        {(selectedCategory !== "All Rooms" || searchQuery) && (
          <button
            onClick={handleReset}
            className="text-[#2563EB] hover:underline font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Room Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard key={room.slug} room={room} />
          ))}
        </div>
      ) : (
        /* Empty Search State */
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center max-w-lg mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-[#64748B] flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mb-1">
            No rooms found
          </h3>
          <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
            We couldn&apos;t find any rooms matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try adjusting your search term or creating a new room.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-all cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Create This Room
            </button>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">Create a Chat Room</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. AI Founders & Coders"
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Category
                </label>
                <select
                  value={newRoomCategory}
                  onChange={(e) => setNewRoomCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
                >
                  <option value="General">General</option>
                  <option value="Friendship">Friendship</option>
                  <option value="Love & Relationships">Love & Relationships</option>
                  <option value="Music">Music</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="Late Night">Late Night</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="What is this room about? Share the vibe..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {["#2563EB", "#7C3AED", "#059669", "#DC2626", "#D97706", "#DB2777"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewRoomColor(color)}
                      className={`w-7 h-7 rounded-xl transition-all cursor-pointer ${
                        newRoomColor === color ? "ring-2 ring-offset-2 ring-[#0F172A] scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Create & Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 text-xs text-slate-400">Loading rooms...</div>}>
      <RoomsPageContent />
    </Suspense>
  );
}