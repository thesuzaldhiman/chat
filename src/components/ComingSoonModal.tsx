"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGuest } from "@/context/GuestContext";
import { X, Clock, MessagesSquare } from "lucide-react";

export default function ComingSoonModal() {
  const { comingSoonFeature, closeComingSoon } = useGuest();
  const router = useRouter();

  if (!comingSoonFeature) return null;

  const handleExploreRooms = () => {
    closeComingSoon();
    router.push("/rooms");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden text-center p-6">
        <div className="flex justify-end">
          <button
            onClick={closeComingSoon}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4 shadow-2xs">
          <Clock className="w-6 h-6 stroke-[2]" />
        </div>

        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] rounded-full mb-2.5">
          Coming Soon
        </span>

        <h3 className="text-lg font-bold text-[#1E293B] mb-2">{comingSoonFeature}</h3>
        <p className="text-xs sm:text-sm text-[#64748B] mb-6 leading-relaxed max-w-sm mx-auto">
          This feature is scheduled in our phase-wise development roadmap. In the meantime, discover vibrant discussions in our live chat rooms!
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleExploreRooms}
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <MessagesSquare className="w-4 h-4" />
            <span>Explore Chat Rooms</span>
          </button>
          <button
            onClick={closeComingSoon}
            className="w-full py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
