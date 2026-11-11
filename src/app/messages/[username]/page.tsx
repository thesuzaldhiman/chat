"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { useMessages } from "@/context/MessageContext";
import { UserProfile } from "@/types";
import {
  MessageSquare,
  UserPlus,
  Check,
  Clock,
  ArrowLeft,
  Shield,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function DirectMessagePage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params.username as string;
  const username = decodeURIComponent(rawUsername || "");

  const { user, getUserProfile, openAuthModal } = useAuth();
  const { getFriendshipStatus, sendFriendRequest } = useFriends();
  const { getOrCreateConversation } = useMessages();

  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      const found = getUserProfile(username);
      setTargetUser(found);
      setLoading(false);
      if (found) {
        router.replace(`/messages?user=${found.username}`);
      }
    }
  }, [username, getUserProfile, router]);

  const isImageAvatar = (av?: string) => av && av.startsWith("/");

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-58px)] flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.isGuest) {
    return (
      <div className="min-h-[calc(100vh-58px)] flex items-center justify-center py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">
            Sign In for Private Messaging
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Private 1-to-1 chats are reserved for registered members to protect community safety.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => openAuthModal("login")}
              className="px-5 py-2 text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => openAuthModal("register")}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-[calc(100vh-58px)] flex items-center justify-center py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-xs">
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Member Not Found</h2>
          <p className="text-xs text-[#64748B] mb-6">
            Could not find user @{username} to start a conversation with.
          </p>
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Messages</span>
          </Link>
        </div>
      </div>
    );
  }

  const friendshipStatus = getFriendshipStatus(targetUser.id);

  // If already friends, redirect seamlessly into `/messages?user=${targetUser.username}`
  if (friendshipStatus === "friends") {
    router.replace(`/messages?user=${targetUser.username}`);
    return (
      <div className="min-h-[calc(100vh-58px)] flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 text-center">
        {/* User Card */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
          {isImageAvatar(targetUser.avatar) ? (
            <Image
              src={targetUser.avatar}
              alt={targetUser.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span>{targetUser.avatar || targetUser.name[0]}</span>
          )}
          {targetUser.isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white ring-1 ring-[#10B981]/20 animate-pulse" />
          )}
        </div>

        <h2 className="text-lg font-bold text-[#0F172A]">
          {targetUser.name}
        </h2>
        <p className="text-xs text-[#64748B] mb-4">
          @{targetUser.username}
        </p>

        {/* Restriction Alert */}
        <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#475569] leading-relaxed mb-6">
          <p className="font-semibold text-[#0F172A] mb-1">
            Friend Request Required
          </p>
          <p>
            To keep ChatVerse a safe and spam-free space, members can only send private messages to accepted friends.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2.5">
          {friendshipStatus === "pending_sent" ? (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Friend Request Pending Approval</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => sendFriendRequest(targetUser)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add {targetUser.name} as Friend</span>
            </button>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Link
              href={`/profile/${targetUser.username}`}
              className="flex-1 py-2 px-3 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              View Profile
            </Link>
            <Link
              href="/messages"
              className="flex-1 py-2 px-3 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
