"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import {
  X,
  MapPin,
  Calendar,
  UserPlus,
  Check,
  MessageSquare,
  Shield,
  Sparkles,
  ExternalLink,
  Users,
  Clock,
} from "lucide-react";

interface UserProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  const { user: currentUser, openAuthModal } = useAuth();
  const { getFriendshipStatus, sendFriendRequest } = useFriends();

  if (!isOpen || !user) return null;

  const isImageAvatar = (av?: string) => av && av.startsWith("/");
  const isOwn = currentUser && (currentUser.id === user.id || currentUser.username === user.username);
  const status = getFriendshipStatus(user.id);

  const handleAddFriend = () => {
    if (!currentUser || currentUser.isGuest) {
      openAuthModal("register");
      return;
    }
    sendFriendRequest(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Banner with gradient */}
        <div className={`relative h-24 bg-gradient-to-r ${user.bannerGradient || "from-[#1D4ED8] via-[#2563EB] to-[#3B82F6]"} p-4 flex items-start justify-end`}>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 relative pt-0">
          {/* Avatar & Online status */}
          <div className="flex justify-between items-end -mt-12 mb-3">
            <div className="relative">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white bg-slate-800 text-white shadow-md flex items-center justify-center text-3xl font-bold">
                {isImageAvatar(user.avatar) ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span>{user.avatar || user.name[0]}</span>
                )}
              </div>
              {user.isOnline && (
                <span
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-white"
                  title="Online now"
                />
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                  user.role === "Moderator"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-[#EFF6FF] text-[#2563EB] border border-[#d2ebe7]"
                }`}
              >
                {user.role === "Moderator" && <Shield className="w-3 h-3" />}
                {user.role || "Member"}
              </span>
            </div>
          </div>

          {/* Name & Username */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
              {user.name}
            </h3>
            <p className="text-xs text-[#64748B]">
              @{user.username}
            </p>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-xs text-[#334155] leading-relaxed mb-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
              {user.bio}
            </p>
          )}

          {/* Metadata: Location & Joined */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] mb-4">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {user.joinedAt}</span>
            </div>
          </div>

          {/* Social Stats Row */}
          <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl mb-4 text-center">
            <div>
              <p className="text-xs font-bold text-[#0F172A]">
                {user.friendsCount + (status === "friends" ? 1 : 0)}
              </p>
              <p className="text-[10px] text-[#64748B]">Friends</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F172A]">
                {user.mutualFriendsCount || 0}
              </p>
              <p className="text-[10px] text-[#64748B]">Mutual</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F172A]">
                {user.roomsJoined ? user.roomsJoined.length : 1}
              </p>
              <p className="text-[10px] text-[#64748B]">Rooms</p>
            </div>
          </div>

          {/* Interests Tags */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Interests &amp; Topics
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2.5 py-1 rounded-lg font-medium"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2.5">
            <Link
              href={`/profile/${user.username}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Profile</span>
            </Link>

            <div className="flex items-center gap-2">
              {!isOwn ? (
                <>
                  {status === "pending_sent" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Request Sent</span>
                    </span>
                  ) : status === "friends" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>Friends</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddFriend}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-xs transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Friend</span>
                    </button>
                  )}
                  <Link
                    href={`/messages?user=${user.username}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-xl transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/profile?tab=edit"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Edit My Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
