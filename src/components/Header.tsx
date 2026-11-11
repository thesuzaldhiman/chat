"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessageContext";
import { useNotifications } from "@/context/NotificationContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import {
  Home,
  MessageSquare,
  MessageCircle,
  Users,
  Menu,
  X,
  User as UserIcon,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
  Shuffle,
  Video,
  Mic,
  Search,
  Bell,
  ArrowRight,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isGuest, logout, openAuthModal } = useAuth();
  const { totalUnreadCount } = useMessages();
  const { unreadCount } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isImageAvatar = (av?: string) => Boolean(av && av.startsWith("/"));

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerSearchQuery.trim()) {
      router.push("/rooms");
      return;
    }
    router.push(`/rooms?q=${encodeURIComponent(headerSearchQuery.trim())}`);
    setHeaderSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-4">
          
          {/* =====================================================================
              1. BRAND LOGO & LIVE STATUS
              ===================================================================== */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] p-0.5 shadow-xs transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden relative">
                  <Image
                    src="/images/chatverse-logo.png"
                    alt="ChatVerse Logo"
                    fill
                    sizes="32px"
                    className="object-contain p-0.5"
                    priority
                  />
                </div>
              </div>
              <span className="text-[18px] sm:text-[19px] font-black tracking-tight text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                ChatVerse
              </span>
            </Link>

            {/* Live Online Indicator Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[10.5px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span>Live</span>
            </div>
          </div>

          {/* =====================================================================
              2. DESKTOP NAVIGATION PILLS (UNIFIED & COHESIVE)
              ===================================================================== */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {/* Home */}
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 border ${
                isActive("/")
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/70 border-transparent"
              }`}
            >
              <Home className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Home</span>
            </Link>

            {/* Chat Rooms */}
            <Link
              href="/rooms"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 border ${
                isActive("/rooms")
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/70 border-transparent"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Chat Rooms</span>
            </Link>

            {/* Random Chat */}
            <Link
              href="/random-chat"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 border ${
                isActive("/random-chat")
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/70 border-transparent"
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Random</span>
            </Link>

            {/* Video Call */}
            <Link
              href="/random-video"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 border ${
                isActive("/random-video")
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/70 border-transparent"
              }`}
            >
              <Video className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Video</span>
            </Link>

            {/* Voice Call */}
            <Link
              href="/random-voice"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 border ${
                isActive("/random-voice")
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/70 border-transparent"
              }`}
            >
              <Mic className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Voice</span>
            </Link>

            {/* People / Community */}
            <Link
              href="/friends"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 border ${
                isActive("/friends")
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/70 border-transparent"
              }`}
            >
              <Users className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>People</span>
            </Link>

            {/* Messages (with unread badge) */}
            <Link
              href="/messages"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 border relative ${
                isActive("/messages")
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/70 border-transparent"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Messages</span>
              {totalUnreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {totalUnreadCount}
                </span>
              )}
            </Link>
          </nav>

          {/* =====================================================================
              3. RIGHT ACTIONS: SEARCH CAPSULE, NOTIFICATIONS & USER PROFILE
              ===================================================================== */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Interactive Search Bar (Desktop) */}
            <form onSubmit={handleHeaderSearch} className="hidden md:flex items-center relative">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  placeholder="Search rooms..."
                  className="w-36 lg:w-44 xl:w-52 pl-8 pr-11 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-[#0F172A] placeholder:text-slate-400 border border-slate-200/70 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 outline-none transition-all"
                />
                <kbd className="hidden lg:inline-flex items-center absolute right-2 text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs pointer-events-none">
                  ⌘K
                </kbd>
              </div>
            </form>

            {/* Quick Search Icon (Mobile / Tablet) */}
            <Link
              href="/rooms"
              className="p-2 rounded-xl text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 transition-colors md:hidden cursor-pointer"
              title="Search Rooms"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </Link>

            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  notifDropdownOpen
                    ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]"
                    : "border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 text-slate-600 hover:text-[#0F172A]"
                }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 stroke-[2]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#10B981] text-white text-[9px] font-bold items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={notifDropdownOpen}
                onClose={() => setNotifDropdownOpen(false)}
              />
            </div>

            {/* User Capsule / Logged In State */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    userDropdownOpen
                      ? "border-[#BFDBFE] bg-[#EFF6FF]"
                      : "border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A]"
                  }`}
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {isImageAvatar(user.avatar) ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    ) : (
                      <span>{user.avatar || (user.name ? user.name[0] : "U")}</span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                  </div>

                  <span className="hidden sm:inline-block max-w-[110px] truncate text-xs font-bold text-[#0F172A]">
                    {user.name}
                  </span>

                  <span
                    className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                      user.isGuest
                        ? "bg-amber-50 text-amber-700 border-amber-200/70"
                        : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]/70"
                    }`}
                  >
                    {user.isGuest ? "Guest" : "Member"}
                  </span>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 ml-0.5 transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180 text-[#2563EB]" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Header Info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {isImageAvatar(user.avatar) ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span>{user.avatar || user.name[0]}</span>
                          )}
                          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white"></span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#0F172A] truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-[#64748B] truncate">
                            {user.username ? `@${user.username}` : user.email || "Guest Session"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Active now</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Member Options */}
                    {!user.isGuest ? (
                      <div className="py-1">
                        <Link
                          href="/messages"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <MessageCircle className="w-4 h-4 text-[#64748B]" />
                            <span>Messages</span>
                          </div>
                          {totalUnreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                              {totalUnreadCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/friends"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                        >
                          <Users className="w-4 h-4 text-[#64748B]" />
                          <span>Friends & People</span>
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-[#64748B]" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/profile?tab=edit"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-[#64748B]" />
                          <span>Edit Profile & Settings</span>
                        </Link>
                      </div>
                    ) : (
                      /* Guest Options */
                      <div className="p-2 space-y-1">
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-1">
                          <p className="text-[11px] font-bold text-[#0F172A] flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>Guest Session</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mb-2">
                            Create a free account to keep your friends, messages & username forever.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              openAuthModal("register");
                            }}
                            className="w-full py-1.5 px-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Upgrade to Member</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openAuthModal("guest");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-slate-50 transition-colors text-left rounded-lg cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Change Nickname / Avatar</span>
                        </button>
                      </div>
                    )}

                    {/* Sign Out / Exit Guest */}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          router.push("/");
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{user.isGuest ? "Exit Guest Mode" : "Log Out"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Visitor CTAs: Log In & Sign Up */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal("guest")}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-colors cursor-pointer"
                  title="Try without registration"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Try as Guest</span>
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition-colors lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.2]" /> : <Menu className="w-5 h-5 stroke-[2.2]" />}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. MOBILE NAVIGATION DRAWER
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {/* Mobile Search */}
          <form onSubmit={handleHeaderSearch} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              placeholder="Search chat rooms, people..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 text-xs text-[#0F172A] placeholder:text-slate-400 border border-slate-200 outline-none focus:bg-white focus:border-[#2563EB]"
            />
          </form>

          {/* Navigation Links Grid */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Explore & Social
            </p>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                isActive("/") ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-[#0F172A] hover:bg-slate-100"
              }`}
            >
              <Home className="w-4 h-4 text-[#2563EB]" />
              <span>Home</span>
            </Link>

            <Link
              href="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                isActive("/rooms") ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-[#0F172A] hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#2563EB]" />
              <span>Chat Rooms</span>
            </Link>

            <Link
              href="/random-chat"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                isActive("/random-chat") ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-[#0F172A] hover:bg-slate-100"
              }`}
            >
              <Shuffle className="w-4 h-4 text-[#2563EB]" />
              <span>Random Chat</span>
            </Link>

            <Link
              href="/random-video"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                isActive("/random-video") ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-[#0F172A] hover:bg-slate-100"
              }`}
            >
              <Video className="w-4 h-4 text-[#2563EB]" />
              <span>Video Call</span>
            </Link>

            <Link
              href="/random-voice"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                isActive("/random-voice") ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-[#0F172A] hover:bg-slate-100"
              }`}
            >
              <Mic className="w-4 h-4 text-[#2563EB]" />
              <span>Voice Call</span>
            </Link>

            <Link
              href="/friends"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                isActive("/friends") ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-[#0F172A] hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>People & Friends</span>
            </Link>

            <Link
              href="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                isActive("/messages") ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-[#0F172A] hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#2563EB]" />
                <span>Messages</span>
              </div>
              {totalUnreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </Link>

            {user && !user.isGuest && (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                  isActive("/profile") ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-[#0F172A] hover:bg-slate-100"
                }`}
              >
                <UserIcon className="w-4 h-4 text-[#2563EB]" />
                <span>My Profile</span>
              </Link>
            )}
          </div>

          {/* Mobile Footer CTAs */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  router.push("/");
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                {user.isGuest ? "Exit Guest Mode" : "Log Out"}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("guest");
                  }}
                  className="flex-1 py-2 text-center text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                >
                  Try Guest
                </button>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}