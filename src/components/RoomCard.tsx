"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatRoom } from "@/types";
import { useGuest } from "@/context/GuestContext";
import { useNotifications } from "@/context/NotificationContext";
import { Users, Lock, Globe, ArrowRight, Sparkles } from "lucide-react";

const ROOM_THUMBNAILS: Record<string, string> = {
  "love-chat": "/images/thumb-love.png",
  "friendship-zone": "/images/thumb-friendship.png",
  "general-chat": "/images/thumb-general.png",
  "music-lovers": "/images/thumb-music.png",
};

interface RoomCardProps {
  room: ChatRoom;
}

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();
  const { guestUser, openGuestModal } = useGuest();
  const { showToast } = useNotifications();

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (room.isPrivate) {
      showToast(
        "This is a private room. An invitation code or invite link is required to enter.",
        "warning",
        "Private Community"
      );
      return;
    }

    if (!guestUser) {
      openGuestModal(room.slug);
    } else {
      router.push(`/rooms/${room.slug}`);
    }
  };

  const imageSrc = ROOM_THUMBNAILS[room.slug];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between hover:border-[#2563EB]/40 hover:shadow-md transition-all duration-300 group">
      <div>
        {/* Top: Thumbnail & Status badges */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {imageSrc ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <Image
                src={imageSrc}
                alt={room.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm tracking-wide shadow-2xs group-hover:scale-105 transition-transform duration-200"
              style={{
                backgroundColor: room.accentBg || "#EFF6FF",
                color: room.accentColor || "#2563EB",
              }}
            >
              {room.initials}
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 rounded-full">
              {room.isPrivate ? (
                <>
                  <Lock className="w-2.5 h-2.5 text-slate-500" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="w-2.5 h-2.5 text-[#2563EB]" />
                  Public
                </>
              )}
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] rounded-full border border-[#2563EB]/15">
              {room.category}
            </span>
          </div>
        </div>

        {/* Room Info */}
        <h4 className="text-base font-bold text-[#0F172A] mb-1.5 leading-snug group-hover:text-[#2563EB] transition-colors">
          {room.name}
        </h4>
        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2 mb-4 font-normal">
          {room.shortDescription}
        </p>
      </div>

      {/* Footer: Online count & Join Button */}
      <div className="pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          <span className="font-semibold text-[#0F172A]">{room.onlineCount}</span>
          <span>online</span>
        </div>

        <button
          onClick={handleJoinClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-95"
        >
          <span>Join Room</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
