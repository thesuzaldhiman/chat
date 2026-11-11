"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import UserProfileModal from "@/components/UserProfileModal";
import NotificationDropdown from "@/components/NotificationDropdown";
import { UserProfile } from "@/types";
import {
  Home,
  MessageSquare,
  Shuffle,
  Video,
  Mic,
  Search,
  Bell,
  ChevronDown,
  Info,
  Share2,
  MoreVertical,
  Plus,
  Smile,
  ImageIcon,
  Send,
  Heart,
  UserPlus,
  ArrowRight,
  Pencil,
  Users,
  X,
  Menu,
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

const INITIAL_LOVE_CHAT_MESSAGES: MessageItem[] = [
  {
    id: "msg-1",
    senderName: "Riya ♡",
    avatarUrl: "/images/avatar-riya.png",
    timestamp: "10:24 PM",
    text: "Hey everyone! 👋 Kaise ho sab?",
    isOwn: false,
  },
  {
    id: "msg-2",
    senderName: "Aman_786",
    avatarUrl: "/images/avatar-aman.png",
    timestamp: "10:25 PM",
    text: "Sab mast! Aap sunao Riya? 😊",
    isOwn: false,
  },
  {
    id: "msg-3",
    senderName: "Pooja 🌸",
    avatarUrl: "/images/avatar-pooja.png",
    timestamp: "10:26 PM",
    text: "Koi new movie recommend karo na? 🍿",
    isOwn: false,
  },
  {
    id: "msg-4",
    senderName: "Guest_9842",
    isGuest: true,
    timestamp: "10:27 PM",
    text: "Hi all! Main new hu yaha, nice to meet you! 👋",
    isOwn: true,
  },
  {
    id: "msg-5",
    senderName: "Neha_21",
    avatarUrl: "/images/avatar-neha.png",
    timestamp: "10:28 PM",
    text: "Welcome! 😊",
    isOwn: false,
  },
  {
    id: "msg-6",
    senderName: "Rocky",
    avatarUrl: "/images/avatar-rocky.png",
    timestamp: "10:29 PM",
    text: "Aaj kal koi good web series dekhi hai kisi ne? 🎬",
    isOwn: false,
  },
];

const ONLINE_MEMBERS = [
  { id: "mem-1", name: "Riya ♡", avatarUrl: "/images/avatar-riya.png" },
  { id: "mem-2", name: "Aman_786", avatarUrl: "/images/avatar-aman.png" },
  { id: "mem-3", name: "Pooja 🌸", avatarUrl: "/images/avatar-pooja.png" },
  { id: "mem-4", name: "Neha_21", avatarUrl: "/images/avatar-neha.png" },
  { id: "mem-5", name: "Rocky", avatarUrl: "/images/avatar-rocky.png" },
];

const ROOM_SIDEBAR_ITEMS = [
  {
    slug: "love-chat",
    name: "Love Chat ❤️",
    thumbnail: "/images/thumb-love-sm.png",
  },
  {
    slug: "friendship-zone",
    name: "Friendship Zone",
    thumbnail: "/images/thumb-friendship.png",
  },
  {
    slug: "general-chat",
    name: "General Chat",
    thumbnail: "/images/thumb-general.png",
  },
  {
    slug: "music-lovers",
    name: "Music Lovers",
    thumbnail: "/images/thumb-music.png",
  },
];

export default function PixelPerfectChatRoom() {
  const params = useParams();
  const router = useRouter();
  const currentSlug = String(params.roomSlug || "love-chat");

  const { user, openAuthModal, getUserProfile } = useAuth();
  const { unreadCount, showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState<"chat" | "members">("chat");
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_LOVE_CHAT_MESSAGES);
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
    const memberMap: Record<string, string> = {
      "Riya ♡": "riya",
      "Riya": "riya",
      "Aman_786": "aman_786",
      "Pooja 🌸": "pooja",
      "Pooja": "pooja",
      "Neha_21": "neha_21",
      "Rocky": "rocky",
    };
    const username = memberMap[name] || name.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const profile = getUserProfile(username);
    if (profile) {
      setSelectedProfile(profile);
      setIsProfileModalOpen(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    const currentName = user ? user.name : "Guest_9842";
    const currentAvatar = user ? user.avatar : undefined;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      senderName: currentName,
      avatarUrl: currentAvatar && currentAvatar.startsWith("/") ? currentAvatar : undefined,
      isGuest: user ? user.isGuest : true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: clean,
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setShowEmojiMenu(false);
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
    const currentName = user ? user.name : "Guest_9842";
    const currentAvatar = user ? user.avatar : undefined;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      senderName: currentName,
      avatarUrl: currentAvatar && currentAvatar.startsWith("/") ? currentAvatar : undefined,
      isGuest: user ? user.isGuest : true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `${emoji} reacted with ${emoji}`,
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    showToast(`Sent ${emoji} to the room!`, "success");
  };

  const handleWave = () => {
    const currentName = user ? user.name : "Guest_9842";
    const currentAvatar = user ? user.avatar : undefined;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      senderName: currentName,
      avatarUrl: currentAvatar && currentAvatar.startsWith("/") ? currentAvatar : undefined,
      isGuest: user ? user.isGuest : true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `👋 Waved to everyone in Love Chat!`,
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    showToast("You waved to the room! 👋", "info");
  };

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden flex flex-col bg-[#F8FAFC] select-none text-[#0F172A]">
      {/* =========================================================================
          TOP NAVIGATION BAR (Exact replica of ChatVerse header)
          ========================================================================= */}
      <header className="h-[54px] bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileRoomsOpen(!mobileRoomsOpen)}
            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] md:hidden"
            aria-label="Toggle rooms drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/images/chatverse-logo.png"
                alt="ChatVerse Logo"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[19px] font-bold tracking-tight text-[#0F172A]">
              ChatVerse
            </span>
          </Link>
        </div>

        {/* Center: Navigation Options */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <Home className="w-4 h-4 stroke-[1.8]" />
            <span>Home</span>
          </Link>

          {/* Active Teal Pill: Chat Rooms */}
          <Link
            href="/rooms"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 stroke-[2]" />
            <span>Chat Rooms</span>
          </Link>

          <Link
            href="/random-chat"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <Shuffle className="w-4 h-4 stroke-[1.8]" />
            <span>Random Chat</span>
          </Link>

          <Link
            href="/random-video"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <Video className="w-4 h-4 stroke-[1.8]" />
            <span>Video Call</span>
          </Link>

          <Link
            href="/random-voice"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <Mic className="w-4 h-4 stroke-[1.8]" />
            <span>Voice Call</span>
          </Link>
        </nav>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/rooms"
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#334155] transition-colors"
            title="Search Rooms"
          >
            <Search className="w-[18px] h-[18px] stroke-[1.9]" />
          </Link>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-1.5 rounded-full hover:bg-slate-100 text-[#334155] transition-colors cursor-pointer"
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

          {/* User Avatar Circle */}
          <Link
            href={user && !user.isGuest ? "/profile" : "/login"}
            className="flex items-center gap-1 cursor-pointer pl-1 group"
            title={user ? `Signed in as ${user.name}` : "Log In"}
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#35485D] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {user?.avatar && user.avatar.startsWith("/") ? (
                <Image src={user.avatar} alt={user.name} fill sizes="32px" className="object-cover" />
              ) : (
                <span>{user?.avatar || (user ? user.name[0] : "G")}</span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#0F172A]" />
          </Link>
        </div>
      </header>

      {/* =========================================================================
          MAIN 3-COLUMN WORKSPACE (Occupies 100% available viewport, NO SCROLL on body)
          ========================================================================= */}
      <div className="flex-1 min-h-0 p-3 sm:p-4 gap-3 sm:gap-4 flex overflow-hidden">
        {/* Mobile Backdrop for Drawers */}
        {(mobileRoomsOpen || mobileInfoOpen) && (
          <div
            onClick={() => {
              setMobileRoomsOpen(false);
              setMobileInfoOpen(false);
            }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs md:hidden"
          />
        )}

        {/* ================= COLUMN 1: LEFT SIDEBAR ================= */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-[210px] xl:w-[230px] flex-shrink-0 flex flex-col justify-between py-1 bg-[#F8FAFC] md:bg-transparent transition-transform duration-200 ${
            mobileRoomsOpen ? "translate-x-0 px-4 bg-white shadow-xl" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Top Nav Links & Rooms */}
          <div className="flex flex-col gap-1 min-h-0 overflow-y-auto">
            <div className="md:hidden flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
              <span className="font-bold text-sm text-[#0F172A]">Menu</span>
              <button onClick={() => setMobileRoomsOpen(false)} className="p-1 text-[#64748B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#0F172A] hover:bg-slate-100/70 transition-colors"
            >
              <Home className="w-4 h-4 text-[#334155] stroke-[2]" />
              <span>Home</span>
            </Link>

            <Link
              href="/rooms"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#0F172A] hover:bg-slate-100/70 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#334155] stroke-[2]" />
              <span>Explore Rooms</span>
            </Link>

            <Link
              href="/rooms"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#0F172A] hover:bg-slate-100/70 transition-colors"
            >
              <Home className="w-4 h-4 text-[#334155] stroke-[2]" />
              <span>My Rooms</span>
            </Link>

            {/* Section: Your Chat Rooms */}
            <div className="mt-5 mb-2 px-3">
              <h3 className="text-xs font-bold text-[#0F172A]">Your Chat Rooms</h3>
            </div>

            <div className="space-y-1">
              {ROOM_SIDEBAR_ITEMS.map((item) => {
                const isSelected = item.slug === currentSlug;
                return (
                  <Link
                    key={item.slug}
                    href={`/rooms/${item.slug}`}
                    onClick={() => setMobileRoomsOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
                      isSelected
                        ? "bg-[#EFF6FF] border border-[#BFDBFE] text-[#0F172A]"
                        : "hover:bg-slate-100/60 text-[#334155]"
                    }`}
                  >
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 shadow-2xs">
                      <Image
                        src={item.thumbnail}
                        alt={item.name}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-semibold truncate leading-tight">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom: User Identity Pill */}
          <div className="pt-2">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 transition-colors group">
              <Link
                href={user && !user.isGuest ? "/profile" : "/profile"}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#35485D] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {user?.avatar && user.avatar.startsWith("/") ? (
                    <Image src={user.avatar} alt={user.name} fill sizes="32px" className="object-cover" />
                  ) : (
                    <span>{user?.avatar || (user ? user.name[0] : "G")}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] truncate leading-tight">
                    {user?.name || "Guest_9842"}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] leading-tight">
                    {user?.isGuest ? "Guest User" : user?.role || (user ? "Member" : "Guest User")}
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
                <Pencil className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </aside>

        {/* ================= COLUMN 2: CENTER CHAT PANEL ================= */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl border border-[#E2E8F0] flex flex-col overflow-hidden shadow-2xs">
          {/* Room Header */}
          <div className="px-5 py-3.5 border-b border-[#F1F4F8] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-2xs">
                <Image
                  src="/images/thumb-love.png"
                  alt="Love Chat"
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-[17px] font-bold text-[#0F172A] truncate">
                    Love Chat ❤️
                  </h1>
                </div>

                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    Public Room
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#64748B]" />
                    1,248 Online
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium hidden sm:flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#64748B]" />
                    28,460 Members
                  </span>
                </div>
              </div>
            </div>

            {/* Room Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileInfoOpen(true)}
                className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
                title="Room Info"
              >
                <Info className="w-4 h-4 stroke-[1.9]" />
              </button>

              <button
                type="button"
                onClick={handleInvite}
                className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
                title="Share Room"
              >
                <Share2 className="w-4 h-4 stroke-[1.9]" />
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4 stroke-[1.9]" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Chat | Members (1.2K) */}
          <div className="px-6 border-b border-[#F1F4F8] flex items-center gap-8 text-xs font-semibold flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`pt-2.5 pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "chat"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
              <span>Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`pt-2.5 pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "members"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Users className="w-3.5 h-3.5 stroke-[2]" />
              <span>Members (1.2K)</span>
            </button>
          </div>

          {/* Content Area: Chat Messages Feed or Members view */}
          {activeTab === "chat" ? (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
              {messages.map((msg) => {
                if (msg.isOwn) {
                  return (
                    /* Current User Message (Aligned Right with Teal Bubble) */
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

                /* Other Users Messages (Aligned Left with Gray Bubble) */
                return (
                  <div key={msg.id} className="flex items-start gap-2.5 max-w-lg">
                    <button
                      type="button"
                      onClick={() => handleOpenProfile(msg.senderName)}
                      className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 shadow-2xs mt-0.5 cursor-pointer hover:ring-2 hover:ring-[#2563EB] transition-all"
                      title={`View ${msg.senderName}'s profile`}
                    >
                      <Image
                        src={msg.avatarUrl || "/images/avatar-riya.png"}
                        alt={msg.senderName}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
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
              })}

              {/* Typing indicator */}
              <div className="flex items-center gap-2 pt-1 pl-1">
                <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/avatar-riya.png"
                    alt="Riya"
                    fill
                    sizes="16px"
                    className="object-cover"
                  />
                </div>
                <span className="text-[11px] text-[#64748B] italic">
                  Riya♡ is typing...
                </span>
              </div>

              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Members Tab View (Mobile / Inline) */
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h3 className="text-xs font-bold text-[#0F172A] mb-2">
                Online Members ({ONLINE_MEMBERS.length})
              </h3>
              {ONLINE_MEMBERS.map((mem) => (
                <button
                  key={mem.id}
                  type="button"
                  onClick={() => handleOpenProfile(mem.name)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={mem.avatarUrl}
                      alt={mem.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A]">
                    {mem.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ================= FIXED BOTTOM MESSAGE COMPOSER ================= */}
          <div className="border-t border-[#F1F4F8] bg-white flex-shrink-0 relative">
            {/* Quick Floating Reactions Tray (Locked Design System Signature) */}
            <div className="px-4 py-1.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-[#64748B] mr-1 hidden sm:inline">Quick react:</span>
                {["❤️", "🔥", "👏", "😂", "🎉", "✨"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSendReaction(emoji)}
                    className="p-1 px-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-xs sm:text-sm transition-transform hover:scale-125 cursor-pointer"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleWave}
                className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95 shrink-0"
                title="Send wave to everyone in room"
              >
                <span>Wave 👋</span>
              </button>
            </div>

            <div className="p-3 sm:p-3.5">
            {/* Quick Emoji Popover */}
            {showEmojiMenu && (
              <div className="absolute bottom-16 left-6 p-2 bg-white border border-[#E2E8F0] rounded-xl shadow-lg flex gap-1 z-20">
                {["👋", "❤️", "😊", "🍿", "🎬", "✨", "🔥", "☕"].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => insertEmoji(em)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-base cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              {/* Plus Button */}
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-slate-50 transition-colors flex-shrink-0"
                title="Add attachment"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>

              {/* Input Pill Container */}
              <div className="flex-1 flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-3.5 py-1.5 gap-2 transition-all focus-within:border-[#2563EB] focus-within:bg-white">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none flex-1 py-0.5"
                />

                <button
                  type="button"
                  onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                  className="p-1 text-[#64748B] hover:text-[#0F172A] transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  className="p-1 text-[#64748B] hover:text-[#0F172A] transition-colors"
                  title="Send Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Circular Teal Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white flex items-center justify-center shadow-2xs flex-shrink-0 transition-colors cursor-pointer"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.2] translate-x-[-0.5px]" />
              </button>
            </form>
            </div>
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
                className="p-1 text-[#64748B] hover:text-[#0F172A] lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11.5px] text-[#475569] leading-relaxed">
              A friendly space to talk about love, relationships, feelings and more. Be respectful and keep it positive! 💬
            </p>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#EDF3F8] text-[#0F172A] text-[10.5px] font-semibold">
                #Love
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#EDF3F8] text-[#0F172A] text-[10.5px] font-semibold">
                #Relationship
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#EDF3F8] text-[#0F172A] text-[10.5px] font-semibold">
                #Chat
              </span>
            </div>

            {/* Stats */}
            <div className="pt-2 space-y-1.5 border-t border-[#F1F4F8]">
              <div className="flex items-center gap-2 text-[11px] text-[#334155] font-medium">
                <Users className="w-3.5 h-3.5 text-[#64748B]" />
                <span>28,460 Members</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#334155] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span>1,248 Online</span>
              </div>
            </div>

            {/* Invite Button */}
            <button
              type="button"
              onClick={handleInvite}
              className="w-full py-2 px-3 rounded-xl border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Friends</span>
            </button>
          </div>

          {/* Card 2: Online Members (1,248) */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <h3 className="text-[12.5px] font-bold text-[#0F172A]">
                  Online Members (1,248)
                </h3>
              </div>
              <button
                type="button"
                className="p-1 text-[#64748B] hover:text-[#0F172A] transition-colors"
                title="Search member"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 my-1.5 pr-0.5">
              {ONLINE_MEMBERS.map((mem, idx) => (
                <div
                  key={mem.id}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(mem.name)}
                    className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                  >
                    <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 shadow-2xs">
                      <Image
                        src={mem.avatarUrl}
                        alt={mem.name}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate block">
                        {mem.name}
                      </span>
                      {idx === 0 && (
                        <div className="flex items-center gap-0.5 h-1.5 mt-0.5" title="Speaking">
                          <span className="w-0.5 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                          <span className="w-0.5 h-2.5 bg-[#10B981] rounded-full animate-pulse [animation-delay:0.15s]"></span>
                          <span className="w-0.5 h-1.5 bg-[#10B981] rounded-full animate-pulse [animation-delay:0.3s]"></span>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenProfile(mem.name)}
                    className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2 py-0.5 rounded-md transition-all cursor-pointer"
                  >
                    + Friend
                  </button>
                </div>
              ))}
            </div>

            {/* View All Members Button */}
            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-auto flex-shrink-0 cursor-pointer"
            >
              <span>View All Members</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </div>

      {/* Copy Link Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-2">
          Room link copied to clipboard!
        </div>
      )}
      {/* User Profile Modal Popup */}
      <UserProfileModal
        user={selectedProfile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
