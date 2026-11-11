"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import UserProfileModal from "@/components/UserProfileModal";
import { ChatRoom, UserProfile } from "@/types";
import { MOCK_ROOMS } from "@/data/mockData";
import { INITIAL_COMMUNITY_USERS } from "@/data/mockUsers";
import {
  MessageSquare,
  Search,
  Bell,
  Heart,
  Share2,
  Copy,
  Check,
  Send,
  Smile,
  Volume2,
  VolumeX,
  UserPlus,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Pencil,
  Users,
  X,
  Menu,
  Home,
  MessageCircle,
  Shuffle,
  Video,
  Mic,
} from "lucide-react";

interface MessageItem {
  id: string;
  senderName: string;
  avatarUrl?: string;
  isGuest?: boolean;
  timestamp: string;
  text: string;
  isOwn?: boolean;
}

export default function PixelPerfectChatRoom() {
  const params = useParams();
  const router = useRouter();
  const currentSlug = String(params.roomSlug || "general-chat");

  const { user, openAuthModal, getUserProfile, getAllCommunityUsers } = useAuth();
  const { unreadCount, showToast } = useNotifications();

  // Load custom rooms + default rooms
  const allRooms = useMemo<ChatRoom[]>(() => {
    let custom: ChatRoom[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("chatverse_custom_rooms");
        if (stored) custom = JSON.parse(stored);
      } catch {}
    }
    return [...MOCK_ROOMS, ...custom];
  }, []);

  // Find active room metadata
  const currentRoom = useMemo<ChatRoom>(() => {
    const found = allRooms.find((r) => r.slug === currentSlug);
    if (found) return found;
    return {
      slug: currentSlug,
      name: currentSlug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      category: "Community",
      shortDescription: `Welcome to the ${currentSlug.replace(/-/g, " ")} room. Join the conversation!`,
      longDescription: `An open space for community members to chat and share thoughts in #${currentSlug}.`,
      onlineCount: 1,
      totalMembers: 1,
      isPrivate: false,
      initials: currentSlug.substring(0, 2).toUpperCase(),
      accentBg: "#EFF6FF",
      accentColor: "#2563EB",
    };
  }, [allRooms, currentSlug]);

  const [activeTab, setActiveTab] = useState<"chat" | "members">("chat");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // User Profile Modal state
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Mobile drawer states
  const [mobileRoomsOpen, setMobileRoomsOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on roomSlug change
  useEffect(() => {
    try {
      const storageKey = `chatverse_room_msgs_${currentSlug}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
    setIsLoaded(true);
  }, [currentSlug]);

  // Real-time multi-tab room sync via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(`chatverse_room_${currentSlug}`);

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "NEW_MESSAGE" && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, { ...data.message, isOwn: false }];
        });
      } else if (data.type === "WAVE") {
        showToast(`${data.senderName} waved to the room! 👋`, "info");
      } else if (data.type === "REACTION") {
        showToast(`${data.senderName} sent ${data.emoji}`, "info");
      }
    };

    return () => {
      channel.close();
    };
  }, [currentSlug, showToast]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenProfile = (name: string) => {
    const clean = name.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const profile = getUserProfile(clean) || INITIAL_COMMUNITY_USERS.find(
      (u) => u.name.toLowerCase() === name.toLowerCase() || u.username.toLowerCase() === clean
    );
    if (profile) {
      setSelectedProfile(profile);
      setIsProfileModalOpen(true);
    }
  };

  // Helper to persist messages
  const saveRoomMessages = (newMessages: MessageItem[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(`chatverse_room_msgs_${currentSlug}`, JSON.stringify(newMessages));
    } catch {}
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    const currentName = user ? user.name : "Guest User";
    const currentAvatar = user ? user.avatar : undefined;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderName: currentName,
      avatarUrl: currentAvatar && currentAvatar.startsWith("/") ? currentAvatar : undefined,
      isGuest: user ? user.isGuest : true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: clean,
      isOwn: true,
    };

    const updated = [...messages, newMsg];
    saveRoomMessages(updated);
    setInputText("");
    setShowEmojiMenu(false);

    // Broadcast to other tabs
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel(`chatverse_room_${currentSlug}`);
        channel.postMessage({ type: "NEW_MESSAGE", message: newMsg });
        channel.close();
      }
    } catch {}
  };

  const handleSendGreeting = () => {
    const currentName = user ? user.name : "Guest User";
    const currentAvatar = user ? user.avatar : undefined;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderName: currentName,
      avatarUrl: currentAvatar && currentAvatar.startsWith("/") ? currentAvatar : undefined,
      isGuest: user ? user.isGuest : true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Hello everyone! Happy to connect in #${currentRoom.name} 👋`,
      isOwn: true,
    };

    const updated = [...messages, newMsg];
    saveRoomMessages(updated);

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel(`chatverse_room_${currentSlug}`);
        channel.postMessage({ type: "NEW_MESSAGE", message: newMsg });
        channel.close();
      }
    } catch {}
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiMenu(false);
  };

  const handleInvite = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      showToast("Room invite link copied to clipboard!", "success");
      setTimeout(() => setCopiedToast(false), 2200);
    }
  };

  const handleSendReaction = (emoji: string) => {
    const currentName = user ? user.name : "Guest User";
    const currentAvatar = user ? user.avatar : undefined;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderName: currentName,
      avatarUrl: currentAvatar && currentAvatar.startsWith("/") ? currentAvatar : undefined,
      isGuest: user ? user.isGuest : true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `${emoji} reacted with ${emoji}`,
      isOwn: true,
    };

    const updated = [...messages, newMsg];
    saveRoomMessages(updated);
    showToast(`Sent ${emoji} to the room!`, "success");

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel(`chatverse_room_${currentSlug}`);
        channel.postMessage({ type: "NEW_MESSAGE", message: newMsg });
        channel.postMessage({ type: "REACTION", emoji, senderName: currentName });
        channel.close();
      }
    } catch {}
  };

  const handleWave = () => {
    const currentName = user ? user.name : "Guest User";
    const currentAvatar = user ? user.avatar : undefined;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderName: currentName,
      avatarUrl: currentAvatar && currentAvatar.startsWith("/") ? currentAvatar : undefined,
      isGuest: user ? user.isGuest : true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `👋 Waved to everyone in #${currentRoom.name}!`,
      isOwn: true,
    };

    const updated = [...messages, newMsg];
    saveRoomMessages(updated);
    showToast(`You waved to #${currentRoom.name}! 👋`, "info");

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel(`chatverse_room_${currentSlug}`);
        channel.postMessage({ type: "NEW_MESSAGE", message: newMsg });
        channel.postMessage({ type: "WAVE", senderName: currentName });
        channel.close();
      }
    } catch {}
  };

  // Derive dynamic room members (community members + active self)
  const roomMembers = useMemo(() => {
    const community = getAllCommunityUsers();
    return community.slice(0, 6);
  }, [getAllCommunityUsers]);

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden flex flex-col bg-[#F8FAFC] select-none text-[#0F172A]">
      {/* =========================================================================
          TOP NAVIGATION BAR (Clean & Cohesive)
          ========================================================================= */}
      <header className="h-[54px] bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileRoomsOpen(!mobileRoomsOpen)}
            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] md:hidden cursor-pointer"
            aria-label="Toggle rooms drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/images/chatverse-logo.png"
                alt="ChatVerse Logo"
                fill
                sizes="28px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-[#0F172A]">
              ChatVerse
            </span>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10.5px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span>Room Live</span>
          </div>
        </div>

        {/* Center: Navigation Options */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5 stroke-[2]" />
            <span>Home</span>
          </Link>

          <Link
            href="/rooms"
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
            <span>Chat Rooms</span>
          </Link>

          <Link
            href="/random-chat"
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5 stroke-[2]" />
            <span>Random</span>
          </Link>

          <Link
            href="/random-video"
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5 stroke-[2]" />
            <span>Video</span>
          </Link>

          <Link
            href="/random-voice"
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Mic className="w-3.5 h-3.5 stroke-[2]" />
            <span>Voice</span>
          </Link>

          <Link
            href="/friends"
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 stroke-[2]" />
            <span>People</span>
          </Link>

          <Link
            href="/messages"
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 stroke-[2]" />
            <span>Messages</span>
          </Link>
        </nav>

        {/* Right: Notification Bell & User Capsule */}
        <div className="flex items-center gap-2.5">
          {/* Notification dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-[#334155] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-[18px] h-[18px] stroke-[1.9]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={notifDropdownOpen}
              onClose={() => setNotifDropdownOpen(false)}
            />
          </div>

          {/* User badge */}
          <Link
            href={user && !user.isGuest ? "/profile" : "/profile"}
            className="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-[#35485D] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {user?.avatar && user.avatar.startsWith("/") ? (
                <Image src={user.avatar} alt={user.name} fill sizes="24px" className="object-cover" />
              ) : (
                <span>{user?.avatar || (user ? user.name[0] : "G")}</span>
              )}
            </div>
            <span className="text-xs font-bold text-[#0F172A] max-w-[85px] sm:max-w-[120px] truncate">
              {user?.name || "Guest User"}
            </span>
          </Link>

          <button
            onClick={() => setMobileInfoOpen(!mobileInfoOpen)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] lg:hidden cursor-pointer"
            title="Room Information"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN 3-COLUMN CONTENT CANVAS
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden p-2.5 sm:p-3.5 gap-3.5 relative">
        {/* ================= COLUMN 1: LEFT SIDEBAR (ROOMS DIRECTORY) ================= */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-[240px] flex-shrink-0 bg-white rounded-2xl border border-[#E2E8F0] p-3 flex flex-col justify-between transition-transform duration-200 shadow-2xs ${
            mobileRoomsOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="overflow-y-auto space-y-1 pr-1 flex-1">
            {/* Header / Close button for mobile */}
            <div className="flex items-center justify-between px-2 py-1 mb-2 md:hidden">
              <span className="font-bold text-sm text-[#0F172A]">Rooms Menu</span>
              <button
                onClick={() => setMobileRoomsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Links */}
            <Link
              href="/rooms"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0F172A] hover:bg-slate-100/70 transition-colors"
            >
              <Home className="w-4 h-4 text-[#334155] stroke-[2]" />
              <span>All Chat Rooms</span>
            </Link>

            {/* Section: Your Chat Rooms */}
            <div className="mt-4 mb-2 px-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0F172A]">Live Rooms ({allRooms.length})</h3>
            </div>

            <div className="space-y-1">
              {allRooms.map((item) => {
                const isSelected = item.slug === currentSlug;
                return (
                  <Link
                    key={item.slug}
                    href={`/rooms/${item.slug}`}
                    onClick={() => setMobileRoomsOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
                      isSelected
                        ? "bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-bold shadow-2xs"
                        : "hover:bg-slate-100/60 text-[#334155]"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0 shadow-2xs border"
                      style={{
                        backgroundColor: item.accentBg || "#EFF6FF",
                        color: item.accentColor || "#2563EB",
                        borderColor: isSelected ? "#BFDBFE" : "#E2E8F0",
                      }}
                    >
                      {item.initials || item.name.slice(0, 2)}
                    </div>
                    <span className="text-xs truncate leading-tight">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom: User Identity Pill */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 transition-colors group">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#35485D] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {user?.avatar && user.avatar.startsWith("/") ? (
                    <Image src={user.avatar} alt={user.name} fill sizes="32px" className="object-cover" />
                  ) : (
                    <span>{user?.avatar || (user ? user.name[0] : "G")}</span>
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] truncate leading-tight">
                    {user?.name || "Guest User"}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] leading-tight">
                    {user?.isGuest ? "Guest Session" : user?.role || "Member"}
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (user && !user.isGuest) {
                    router.push("/profile?tab=edit");
                  } else {
                    openAuthModal("guest");
                  }
                }}
                className="p-1 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                title={user && !user.isGuest ? "Edit Profile" : "Edit Guest Nickname"}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* ================= COLUMN 2: CENTER CHAT PANEL ================= */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl border border-[#E2E8F0] flex flex-col overflow-hidden shadow-2xs">
          {/* Room Header */}
          <div className="px-5 py-3.5 border-b border-[#F1F4F8] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 shadow-2xs border"
                style={{
                  backgroundColor: currentRoom.accentBg || "#EFF6FF",
                  color: currentRoom.accentColor || "#2563EB",
                  borderColor: "#BFDBFE",
                }}
              >
                {currentRoom.initials || "💬"}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-[17px] font-bold text-[#0F172A] truncate">
                    {currentRoom.name}
                  </h1>
                </div>

                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    {currentRoom.category}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#64748B]" />
                    Live Room
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handleInvite}
                className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
                title="Share room link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleInvite}
                className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
                title="Copy room link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Chat Feed vs Active Members (Mobile) */}
          <div className="px-5 border-b border-[#F1F4F8] flex items-center gap-6 text-xs font-semibold flex-shrink-0 md:hidden">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "chat"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Chat Feed
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "members"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Members ({roomMembers.length})
            </button>
          </div>

          {/* Content Area: Chat Messages Feed or Members view */}
          {activeTab === "chat" ? (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 flex flex-col">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  if (msg.isOwn) {
                    return (
                      <div key={msg.id} className="flex flex-col items-end gap-1 ml-auto max-w-lg">
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[11px] font-bold text-[#0F172A]">
                            {msg.senderName}
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">
                            {msg.timestamp}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 justify-end">
                          <div className="px-4 py-2.5 rounded-2xl rounded-tr-xs bg-[#2563EB] text-white text-xs sm:text-[13px] leading-relaxed shadow-2xs break-words">
                            {msg.text}
                          </div>
                          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#35485D] text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {user?.avatar && user.avatar.startsWith("/") ? (
                              <Image src={user.avatar} alt={msg.senderName} fill sizes="28px" className="object-cover" />
                            ) : (
                              <span>{user?.avatar || (user ? user.name[0] : "G")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex items-start gap-2.5 max-w-lg">
                      <button
                        type="button"
                        onClick={() => handleOpenProfile(msg.senderName)}
                        className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 shadow-2xs mt-0.5 cursor-pointer hover:ring-2 hover:ring-[#2563EB] transition-all bg-[#35485D] text-white text-xs font-bold flex items-center justify-center"
                        title={`View ${msg.senderName}'s profile`}
                      >
                        {msg.avatarUrl && msg.avatarUrl.startsWith("/") ? (
                          <Image
                            src={msg.avatarUrl}
                            alt={msg.senderName}
                            fill
                            sizes="28px"
                            className="object-cover"
                          />
                        ) : (
                          <span>{msg.avatarUrl || msg.senderName[0]}</span>
                        )}
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                      </button>

                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 px-1">
                          <button
                            type="button"
                            onClick={() => handleOpenProfile(msg.senderName)}
                            className="text-[11px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors cursor-pointer text-left"
                          >
                            {msg.senderName}
                          </button>
                          <span className="text-[10px] text-[#94A3B8]">
                            {msg.timestamp}
                          </span>
                        </div>

                        <div className="px-4 py-2.5 rounded-2xl rounded-tl-xs bg-[#F1F5F9] text-[#0F172A] text-xs sm:text-[13px] leading-relaxed shadow-2xs break-words">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty Room State */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto animate-in fade-in">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold mb-3 shadow-2xs border"
                    style={{
                      backgroundColor: currentRoom.accentBg || "#EFF6FF",
                      color: currentRoom.accentColor || "#2563EB",
                      borderColor: "#BFDBFE",
                    }}
                  >
                    {currentRoom.initials || "💬"}
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1">
                    Welcome to #{currentRoom.name}!
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-sm mb-5 leading-relaxed">
                    {currentRoom.shortDescription || "No messages yet. Be the first to start the conversation!"}
                  </p>
                  <button
                    type="button"
                    onClick={handleSendGreeting}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Say Hello</span>
                    <span>👋</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Members Tab View (Mobile / Inline) */
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h3 className="text-xs font-bold text-[#0F172A] mb-2">
                Room Members ({roomMembers.length})
              </h3>
              {roomMembers.map((mem) => (
                <button
                  key={mem.id}
                  type="button"
                  onClick={() => handleOpenProfile(mem.name)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                    {mem.avatar && mem.avatar.startsWith("/") ? (
                      <Image
                        src={mem.avatar}
                        alt={mem.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <span>{mem.avatar || mem.name[0]}</span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0F172A] block">
                      {mem.name}
                    </span>
                    <span className="text-[10px] text-slate-400">@{mem.username}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Reaction Tray & Social Wave Bar */}
          <div className="px-4 py-1.5 border-t border-[#F1F4F8] bg-[#F8FAFC]/80 flex items-center justify-between gap-2 overflow-x-auto flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-[#64748B] mr-1 hidden sm:inline">React:</span>
              {["❤️", "🔥", "😂", "✨", "🍿", "☕", "🎮", "👏"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="w-7 h-7 rounded-lg hover:bg-white hover:shadow-2xs text-sm flex items-center justify-center transition-all cursor-pointer"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleWave}
              className="px-2.5 py-1 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] text-[11px] font-bold text-[#2563EB] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs flex-shrink-0"
              title="Wave to everyone in room"
            >
              <span>Wave</span>
              <span>👋</span>
            </button>
          </div>

          {/* Bottom Message Input Box */}
          <div className="p-3 sm:p-3.5 border-t border-[#F1F4F8] bg-white relative flex-shrink-0">
            {showEmojiMenu && (
              <div className="absolute bottom-full mb-2 left-4 bg-white border border-[#E2E8F0] rounded-2xl p-2.5 shadow-xl grid grid-cols-6 gap-1.5 z-40">
                {["❤️", "😂", "🔥", "👍", "👋", "🎉", "✨", "☕", "🍿", "👀", "🙌", "💯"].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => insertEmoji(em)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-base cursor-pointer transition-colors"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-[#F1F5F9] rounded-2xl px-3.5 py-2 border border-transparent focus-within:border-[#2563EB] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2563EB]/15 transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send a message in #${currentRoom.name}...`}
                  className="bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none flex-1 py-0.5"
                />

                <button
                  type="button"
                  onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                  className="p-1 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                  title="Insert emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:hover:bg-[#2563EB] text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-2xs"
                title="Send Message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </main>

        {/* ================= COLUMN 3: RIGHT SIDEBAR ================= */}
        <aside
          className={`fixed lg:static inset-y-0 right-0 z-50 lg:z-auto w-[270px] xl:w-[290px] flex-shrink-0 flex flex-col gap-3.5 overflow-hidden transition-transform duration-200 ${
            mobileInfoOpen ? "translate-x-0 p-4 bg-white shadow-xl" : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Card 1: About This Room */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#0F172A] stroke-[2.2]" />
                <h3 className="text-[13px] font-bold text-[#0F172A]">
                  About This Room
                </h3>
              </div>
              <button
                onClick={() => setMobileInfoOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] lg:hidden cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11.5px] text-[#475569] leading-relaxed">
              {currentRoom.longDescription || currentRoom.shortDescription}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#EDF3F8] text-[#0F172A] text-[10.5px] font-semibold">
                #{currentRoom.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#EDF3F8] text-[#0F172A] text-[10.5px] font-semibold">
                #{currentRoom.slug}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#EDF3F8] text-[#0F172A] text-[10.5px] font-semibold">
                #Community
              </span>
            </div>

            {/* Invite Button */}
            <button
              type="button"
              onClick={handleInvite}
              className="w-full py-2 px-3 rounded-xl border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Friends</span>
            </button>
          </div>

          {/* Card 2: Community Members */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <h3 className="text-[12.5px] font-bold text-[#0F172A]">
                  Community Members ({roomMembers.length + 1})
                </h3>
              </div>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 my-1.5 pr-0.5">
              {/* You */}
              <div className="w-full flex items-center justify-between py-1.5 px-2 rounded-xl bg-blue-50/50 border border-blue-100/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {user?.avatar && user.avatar.startsWith("/") ? (
                      <Image src={user.avatar} alt={user.name} fill sizes="28px" className="object-cover" />
                    ) : (
                      <span>{user?.avatar || (user ? user.name[0] : "Y")}</span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#0F172A] truncate block">
                      {user?.name || "You (Guest)"}
                    </span>
                    <span className="text-[10px] text-[#2563EB] font-semibold">Active Now</span>
                  </div>
                </div>
              </div>

              {/* Other Community Members */}
              {roomMembers.map((mem) => (
                <div
                  key={mem.id}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(mem.name)}
                    className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                  >
                    <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {mem.avatar && mem.avatar.startsWith("/") ? (
                        <Image
                          src={mem.avatar}
                          alt={mem.name}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      ) : (
                        <span>{mem.avatar || mem.name[0]}</span>
                      )}
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate block">
                        {mem.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block">@{mem.username}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom link: Explore all rooms */}
            <Link
              href="/rooms"
              className="w-full py-2 px-3 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-auto flex-shrink-0 cursor-pointer"
            >
              <span>Explore All Rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        user={selectedProfile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Copy link toast feedback */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-2">
          Invite link copied to clipboard!
        </div>
      )}
    </div>
  );
}