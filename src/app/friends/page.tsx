"use client";

import React, { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { useNotifications } from "@/context/NotificationContext";
import { useCall } from "@/context/CallContext";
import { UserProfile } from "@/types";
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Shield,
  MapPin,
  Sparkles,
  Check,
  X,
  ArrowRight,
  MoreVertical,
  ExternalLink,
  Ban,
  Clock,
  Phone,
  Video,
} from "lucide-react";

function FriendsPageContent() {
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();
  const { showToast } = useNotifications();
  const { startCall } = useCall();
  const {
    friends,
    onlineFriends,
    receivedRequests,
    sentRequests,
    blockedUserIds,
    discoverUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    unfriend,
    blockUser,
    unblockUser,
    getFriendshipStatus,
  } = useFriends();

  const paramTab = searchParams.get("tab");
  const validTabs = ["all", "online", "requests", "discover", "blocked"] as const;
  const initialTab = validTabs.includes(paramTab as typeof validTabs[number])
    ? (paramTab as typeof validTabs[number])
    : "all";

  const [activeTab, setActiveTab] = useState<"all" | "online" | "requests" | "discover" | "blocked">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    showToast(msg, "info");
    setTimeout(() => setActionNotice(null), 3000);
  };

  const isImageAvatar = (av?: string) => av && av.startsWith("/");

  // Filtered lists based on search query
  const query = searchQuery.trim().toLowerCase();

  const filteredFriends = useMemo(() => {
    const list = activeTab === "online" ? onlineFriends : friends;
    if (!query) return list;
    return list.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.username.toLowerCase().includes(query) ||
        (f.interests && f.interests.some((i) => i.toLowerCase().includes(query)))
    );
  }, [friends, onlineFriends, activeTab, query]);

  const filteredDiscover = useMemo(() => {
    if (!query) return discoverUsers;
    return discoverUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        (u.interests && u.interests.some((i) => i.toLowerCase().includes(query)))
    );
  }, [discoverUsers, query]);

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Guest Banner if unauthenticated or guest */}
        {(!user || user.isGuest) && (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Connect &amp; Build Your ChatVerse Network
                </h3>
                <p className="text-xs text-[#64748B]">
                  Create an account to add friends, send private messages, and maintain your social connections.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Sign Up Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Temporary Notification Banner */}
        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header & Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                  People &amp; Friends
                </h1>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Manage your friendships, respond to incoming requests, and discover active community members.
              </p>
            </div>

            {/* Instant Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, handle, or tag..."
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Clean Nav Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-[#E2E8F0] pb-px overflow-x-auto">
            {/* Tab: All Friends */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setOpenDropdownId(null);
              }}
              className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "all"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>All Friends</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold">
                {friends.length}
              </span>
            </button>

            {/* Tab: Online Now */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("online");
                setOpenDropdownId(null);
              }}
              className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "online"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Online Now</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 font-bold">
                {onlineFriends.length}
              </span>
            </button>

            {/* Tab: Pending Requests */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("requests");
                setOpenDropdownId(null);
              }}
              className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "requests"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>Requests</span>
              {receivedRequests.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold">
                  {receivedRequests.length}
                </span>
              )}
            </button>

            {/* Tab: Discover People */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("discover");
                setOpenDropdownId(null);
              }}
              className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "discover"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discover People</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700 font-bold">
                {discoverUsers.length}
              </span>
            </button>

            {/* Tab: Blocked */}
            {blockedUserIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("blocked");
                  setOpenDropdownId(null);
                }}
                className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === "blocked"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>Blocked</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-50 text-rose-700 font-bold">
                  {blockedUserIds.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            TAB CONTENT: ALL FRIENDS & ONLINE NOW
            ========================================================================= */}
        {(activeTab === "all" || activeTab === "online") && (
          <div>
            {filteredFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:border-[#2563EB]/30 transition-all flex flex-col justify-between relative group"
                  >
                    <div>
                      {/* Top Row: Avatar & Badges */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Link href={`/profile/${friend.username}`} className="relative flex-shrink-0 group/av">
                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-2xs border border-slate-100">
                              {isImageAvatar(friend.avatar) ? (
                                <Image
                                  src={friend.avatar}
                                  alt={friend.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover group-hover/av:scale-105 transition-transform"
                                />
                              ) : (
                                <span>{friend.avatar || friend.name[0]}</span>
                              )}
                            </div>
                            {friend.isOnline && (
                              <span
                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white ring-1 ring-[#10B981]/30 animate-pulse"
                                title="Online"
                              />
                            )}
                          </Link>

                          <div className="min-w-0">
                            <Link
                              href={`/profile/${friend.username}`}
                              className="text-sm font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors truncate block"
                            >
                              {friend.name}
                            </Link>
                            <p className="text-[11px] text-[#64748B] truncate">
                              @{friend.username}
                            </p>
                          </div>
                        </div>

                        {/* Status / Role Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                              friend.role === "Moderator"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-[#EFF6FF] text-[#2563EB] border border-[#EFF6FF]"
                            }`}
                          >
                            {friend.role === "Moderator" && <Shield className="w-3 h-3" />}
                            {friend.role || "Member"}
                          </span>

                          {/* Options Menu Button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdownId(openDropdownId === friend.id ? null : friend.id)
                              }
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openDropdownId === friend.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-[#E2E8F0] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                <Link
                                  href={`/profile/${friend.username}`}
                                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#0F172A] hover:bg-slate-50 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Profile</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    unfriend(friend.id);
                                    setOpenDropdownId(null);
                                    showNotice(`Removed ${friend.name} from friends.`);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Remove Friend</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    blockUser(friend.id);
                                    setOpenDropdownId(null);
                                    showNotice(`Blocked ${friend.name}.`);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                                >
                                  <Ban className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Block User</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {friend.bio && (
                        <p className="text-xs text-[#475569] leading-relaxed mb-3 line-clamp-2">
                          {friend.bio}
                        </p>
                      )}

                      {/* Location & Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B] mb-4">
                        {friend.location && (
                          <span className="flex items-center gap-1 bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{friend.location}</span>
                          </span>
                        )}
                        {friend.interests && friend.interests.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                        <span className={`w-2 h-2 rounded-full ${friend.isOnline ? "bg-[#10B981] animate-pulse" : "bg-slate-300"}`} />
                        <span>{friend.isOnline ? "Active in communities" : "Offline"}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Quick Voice Call */}
                        <button
                          type="button"
                          onClick={() => startCall(friend, "voice")}
                          className="p-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] transition-colors cursor-pointer"
                          title={`Voice call with ${friend.name}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Video Call */}
                        <button
                          type="button"
                          onClick={() => startCall(friend, "video")}
                          className="p-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] transition-colors cursor-pointer"
                          title={`Video call with ${friend.name}`}
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/messages?user=${friend.username}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-2xs transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-1">
                  {searchQuery ? "No Friends Found" : activeTab === "online" ? "No Friends Currently Online" : "No Friends Yet"}
                </h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-5">
                  {searchQuery
                    ? `No matching connections found for "${searchQuery}".`
                    : activeTab === "online"
                    ? "None of your friends are currently active. Check back soon or discover other community members!"
                    : "Start building your circle! Browse the community and send friend requests to people who share your interests."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("discover");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover People to Connect With</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT: PENDING REQUESTS (RECEIVED & SENT)
            ========================================================================= */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            {/* 1. Received Requests */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Received Requests ({receivedRequests.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#64748B]">
                  People who want to be your friend
                </span>
              </div>

              {receivedRequests.length > 0 ? (
                <div className="space-y-3">
                  {receivedRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${req.fromUser.username}`} className="relative flex-shrink-0">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                            {isImageAvatar(req.fromUser.avatar) ? (
                              <Image src={req.fromUser.avatar} alt={req.fromUser.name} fill sizes="44px" className="object-cover" />
                            ) : (
                              <span>{req.fromUser.avatar || req.fromUser.name[0]}</span>
                            )}
                          </div>
                          {req.fromUser.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white animate-pulse" />
                          )}
                        </Link>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${req.fromUser.username}`}
                              className="text-xs sm:text-sm font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors"
                            >
                              {req.fromUser.name}
                            </Link>
                            <span className="text-[10px] text-[#64748B]">@{req.fromUser.username}</span>
                          </div>
                          <p className="text-[11px] text-[#475569] line-clamp-1 mt-0.5">
                            {req.fromUser.bio || "Wants to connect with you on ChatVerse."}
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{req.timestamp}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            acceptFriendRequest(req.id);
                            showNotice(`You and ${req.fromUser.name} are now friends!`);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            declineFriendRequest(req.id);
                            showNotice(`Declined friend request from ${req.fromUser.name}.`);
                          }}
                          className="px-3.5 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B] py-4 text-center">
                  No pending friend requests received.
                </p>
              )}
            </div>

            {/* 2. Sent Requests */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#64748B]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Sent Requests ({sentRequests.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#64748B]">
                  Requests awaiting their acceptance
                </span>
              </div>

              {sentRequests.length > 0 ? (
                <div className="space-y-3">
                  {sentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {isImageAvatar(req.toUser.avatar) ? (
                            <Image src={req.toUser.avatar} alt={req.toUser.name} fill sizes="36px" className="object-cover" />
                          ) : (
                            <span>{req.toUser.avatar || req.toUser.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">{req.toUser.name}</p>
                          <p className="text-[10px] text-[#64748B]">@{req.toUser.username} • {req.timestamp}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          cancelFriendRequest(req.id);
                          showNotice("Friend request cancelled.");
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel Request
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B] py-4 text-center">
                  You have not sent any pending requests.
                </p>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT: DISCOVER PEOPLE
            ========================================================================= */}
        {activeTab === "discover" && (
          <div>
            {filteredDiscover.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDiscover.map((member) => {
                  const status = getFriendshipStatus(member.id);
                  return (
                    <div
                      key={member.id}
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:border-[#2563EB]/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top avatar & name */}
                        <div className="flex items-center gap-3 mb-3">
                          <Link href={`/profile/${member.username}`} className="relative flex-shrink-0 group/av">
                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-2xs border border-slate-100">
                              {isImageAvatar(member.avatar) ? (
                                <Image
                                  src={member.avatar}
                                  alt={member.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover group-hover/av:scale-105 transition-transform"
                                />
                              ) : (
                                <span>{member.avatar || member.name[0]}</span>
                              )}
                            </div>
                            {member.isOnline && (
                              <span
                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white ring-1 ring-[#10B981]/30 animate-pulse"
                                title="Online"
                              />
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/profile/${member.username}`}
                              className="text-xs sm:text-sm font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors truncate block"
                            >
                              {member.name}
                            </Link>
                            <p className="text-[11px] text-[#64748B] truncate">
                              @{member.username}
                            </p>
                          </div>
                        </div>

                        {/* Bio */}
                        {member.bio && (
                          <p className="text-xs text-[#475569] leading-relaxed mb-3 line-clamp-2">
                            {member.bio}
                          </p>
                        )}

                        {/* Interests */}
                        {member.interests && member.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {member.interests.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10.5px] bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-md font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Bottom CTA */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          href={`/profile/${member.username}`}
                          className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                        >
                          View Profile
                        </Link>

                        {status === "pending_sent" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Request Sent</span>
                          </span>
                        ) : status === "friends" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                            <span>Friends</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!user || user.isGuest) {
                                openAuthModal("register");
                                return;
                              }
                              const res = sendFriendRequest(member);
                              if (res.success) {
                                showNotice(`Friend request sent to ${member.name}!`);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-2xs transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add Friend</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-xs">
                <p className="text-xs text-[#64748B]">
                  No matching members found for &quot;{searchQuery}&quot;.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT: BLOCKED USERS
            ========================================================================= */}
        {activeTab === "blocked" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#0F172A] mb-2">
              Blocked Accounts ({blockedUserIds.length})
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Blocked users cannot see your online presence, send you friend requests, or message you.
            </p>

            <div className="space-y-2">
              {blockedUserIds.map((id) => (
                <div
                  key={id}
                  className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-[#0F172A]">User ID: {id}</span>
                  <button
                    type="button"
                    onClick={() => {
                      unblockUser(id);
                      showNotice("User unblocked.");
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FriendsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FriendsPageContent />
    </Suspense>
  );
}
