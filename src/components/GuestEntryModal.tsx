"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGuest } from "@/context/GuestContext";
import { GUEST_AVATARS } from "@/data/mockData";
import { X, UserCheck, Sparkles } from "lucide-react";

export default function GuestEntryModal() {
  const { isModalOpen, closeGuestModal, setGuestIdentity, targetRoomSlug, guestUser } = useGuest();
  const router = useRouter();

  const [name, setName] = useState(guestUser?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(guestUser?.avatar || GUEST_AVATARS[0]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Guest_${Math.floor(100 + Math.random() * 900)}`;
    setGuestIdentity(finalName, selectedAvatar);
    closeGuestModal();

    if (targetRoomSlug) {
      router.push(`/rooms/${targetRoomSlug}`);
    }
  };

  const handleRandomName = () => {
    const adjectives = ["Curious", "Sunny", "Swift", "Calm", "Brisk", "Gentle", "Bright"];
    const nouns = ["Voyager", "Echo", "Sparrow", "Comet", "Reader", "Thinker", "Nomad"];
    const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randNoun = nouns[Math.floor(Math.random() * nouns.length)];
    setName(`${randAdj}${randNoun}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#E7ECF0] shadow-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7ECF0]">
          <div>
            <h3 className="text-base font-semibold text-[#243447]">Join as Guest</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Enter a temporary display name to join public rooms
            </p>
          </div>
          <button
            onClick={closeGuestModal}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#243447] hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Display Name Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#243447]">
                Your Display Name
              </label>
              <button
                type="button"
                onClick={handleRandomName}
                className="inline-flex items-center gap-1 text-xs text-[#3D8B83] hover:text-[#316F69] font-medium transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Randomize
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AlexMorgan or Guest123"
              maxLength={24}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7ECF0] rounded-lg text-[#243447] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D8B83]/20 focus:border-[#3D8B83] transition-all"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#243447] mb-2">
              Choose an Avatar
            </label>
            <div className="grid grid-cols-5 gap-2">
              {GUEST_AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`h-11 rounded-lg text-lg flex items-center justify-center border transition-all ${
                    selectedAvatar === av
                      ? "border-[#3D8B83] bg-[#E8F4F1] scale-105"
                      : "border-[#E7ECF0] hover:bg-slate-50"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeGuestModal}
              className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#243447] transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#3D8B83] hover:bg-[#316F69] rounded-lg shadow-xs transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Join Conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
