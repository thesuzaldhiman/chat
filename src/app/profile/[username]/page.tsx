"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { useCall } from "@/context/CallContext";
import { UserProfile } from "@/types";
import { MOCK_ROOMS } from "@/data/mockData";
import {
  User as UserIcon,
  Shield,
  MapPin,
  Calendar,
  Globe,
  UserPlus,
  Check,
  MessageSquare,
  Share2,
  ArrowLeft,
  Sparkles,
  Users,
  Clock,
  Phone,
  Video,
} from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params.username as string;
  const username = decodeURIComponent(rawUsername || "");

  const { getUserProfile, user: currentUser, openAuthModal } = useAuth();
  const { getFriendshipStatus, sendFriendRequest } = useFriends();
  const { startCall } = useCall();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (username) {
      const found = getUserProfile(username);
      setProfile(found);
      setLoading(false);
    }
  }, [username, getUserProfile]);

  const isImageAvatar = (av?: string) => av && av.startsWith("/");
  const isOwnProfile =
    currentUser &&
    profile &&
    (currentUser.id === profile.id ||
      currentUser.username?.toLowerCase() === profile.username?.toLowerCase());

  const status = profile ? getFriendshipStatus(profile.id) : "none";

  const handleAddFriend = () => {
    if (!currentUser || currentUser.isGuest) {
      openAuthModal("register");
      return;
    }
    if (profile) {
      sendFriendRequest(profile);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-58px)] flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-58px)] flex items-center justify-center py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-[#64748B] flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">
            User Not Found
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            We couldn&apos;t find a member with the handle <span className="font-semibold text-[#0F172A]">@{username}</span>.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore Chat Rooms</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div
            className={`h-36 sm:h-44 bg-gradient-to-r ${
              profile.bannerGradient || "from-[#1D4ED8] via-[#2563EB] to-[#3B82F6]"
            } relative`}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Profile Details Container */}
          <div className="px-6 sm:px-8 pb-8 relative pt-0">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
              {/* Avatar + Name */}
              <div className="flex items-end gap-4">
                <div className="relative">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white bg-slate-800 text-white shadow-lg flex items-center justify-center text-4xl font-bold">
                    {isImageAvatar(profile.avatar) ? (
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <span>{profile.avatar || profile.name[0]}</span>
                    )}
                  </div>
                  {profile.isOnline && (
                    <span
                      className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-white ring-1 ring-[#10B981]/20 animate-pulse"
                      title="Online"
                    />
                  )}
                </div>

                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                      {profile.name}
                    </h1>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                        profile.role === "Moderator"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-[#EFF6FF] text-[#2563EB] border border-[#EFF6FF]"
                      }`}
                    >
                      {profile.role === "Moderator" && <Shield className="w-3 h-3" />}
                      {profile.role || "Member"}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    @{profile.username}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                  title="Share profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {copied && (
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Link copied!
                  </span>
                )}

                {isOwnProfile ? (
                  <Link
                    href="/profile?tab=edit"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Edit Profile</span>
                  </Link>
                ) : (
                  <>
                    {status === "pending_sent" ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Request Sent</span>
                      </span>
                    ) : status === "friends" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startCall(profile, "voice")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#2563EB]/20 transition-colors cursor-pointer"
                          title="Voice Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Voice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => startCall(profile, "video")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors shadow-xs cursor-pointer"
                          title="Video Call"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Video</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddFriend}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Friend</span>
                      </button>
                    )}

                    <Link
                      href={`/messages?user=${profile.username}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-xl transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl mb-6 text-center">
              <div>
                <p className="text-base font-bold text-[#0F172A]">
                  {profile.friendsCount + (status === "friends" ? 1 : 0)}
                </p>
                <p className="text-[11px] text-[#64748B]">Friends</p>
              </div>
              <div>
                <p className="text-base font-bold text-[#0F172A]">
                  {profile.mutualFriendsCount || 0}
                </p>
                <p className="text-[11px] text-[#64748B]">Mutual Friends</p>
              </div>
              <div>
                <p className="text-base font-bold text-[#0F172A]">
                  {profile.roomsJoined ? profile.roomsJoined.length : 2}
                </p>
                <p className="text-[11px] text-[#64748B]">Rooms Joined</p>
              </div>
            </div>

            {/* About / Bio */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                {profile.bio || "This user prefers to keep their bio mysterious!"}
              </p>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {profile.location && (
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#2563EB]" />
                  <div>
                    <p className="text-[10px] text-[#64748B]">Location</p>
                    <p className="text-xs font-semibold text-[#0F172A]">{profile.location}</p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#2563EB]" />
                <div>
                  <p className="text-[10px] text-[#64748B]">Joined</p>
                  <p className="text-xs font-semibold text-[#0F172A]">{profile.joinedAt}</p>
                </div>
              </div>

              {profile.website && (
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#2563EB]" />
                  <div>
                    <p className="text-[10px] text-[#64748B]">Website</p>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#2563EB] hover:underline truncate max-w-[140px] block"
                    >
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Interests & Topics */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Interests &amp; Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] border border-[#EFF6FF] rounded-xl text-xs font-semibold"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Communities & Rooms */}
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
                Communities &amp; Chat Rooms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_ROOMS.slice(0, 2).map((room) => (
                  <div
                    key={room.slug}
                    className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: room.accentBg, color: room.accentColor }}
                      >
                        {room.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0F172A]">{room.name}</p>
                        <p className="text-[10px] text-[#64748B]">{room.onlineCount.toLocaleString()} members online</p>
                      </div>
                    </div>
                    <Link
                      href={`/rooms/${room.slug}`}
                      className="px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-lg transition-colors"
                    >
                      Chat
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
