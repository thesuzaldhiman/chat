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
  Shield,
  Shuffle,
  Video,
  Mic,
  Search,
  Bell,
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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isImageAvatar = (av?: string) => Boolean(av && av.startsWith("/"));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[58px]">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
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
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">
              ChatVerse
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            <Link
              href="/"
              className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive("/")
                  ? "text-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Home className="w-4 h-4 stroke-[2]" />
              <span>Home</span>
            </Link>

            <Link
              href="/rooms"
              className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${
                isActive("/rooms")
                  ? "bg-[#2563EB] text-white"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <MessageSquare className="w-4 h-4 stroke-[2]" />
              <span>Chat Rooms</span>
            </Link>

            <Link
              href="/random-chat"
              className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive("/random-chat")
                  ? "text-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Shuffle className="w-4 h-4 stroke-[2]" />
              <span>Random Chat</span>
            </Link>

            <Link
              href="/random-video"
              className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive("/random-video")
                  ? "text-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Video className="w-4 h-4 stroke-[2]" />
              <span>Video Call</span>
            </Link>

            <Link
              href="/random-voice"
              className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive("/random-voice")
                  ? "text-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Mic className="w-4 h-4 stroke-[2]" />
              <span>Voice Call</span>
            </Link>

            <Link
              href="/friends"
              className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive("/friends")
                  ? "text-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Users className="w-4 h-4 stroke-[2]" />
              <span>People</span>
            </Link>

            <Link
              href="/messages"
              className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 relative ${
                isActive("/messages")
                  ? "text-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <MessageCircle className="w-4 h-4 stroke-[2]" />
              <span>Messages</span>
              {totalUnreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Right Action: Search, Notifications & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Search */}
            <Link
              href="/rooms"
              className="p-1.5 rounded-full hover:bg-slate-100 text-[#334155] transition-colors cursor-pointer"
              title="Search Rooms"
            >
              <Search className="w-[18px] h-[18px] stroke-[1.9]" />
            </Link>

            {/* Notification Bell */}
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

            {/* User Dropdown / Auth CTA */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 text-xs font-semibold text-[#0F172A] transition-all cursor-pointer shadow-xs"
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden bg-[#35485D] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {isImageAvatar(user.avatar) ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    ) : (
                      <span>{user.avatar || (user.name ? user.name[0] : "U")}</span>
                    )}
                  </div>
                  <span className="max-w-[110px] truncate">{user.name}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      user.isGuest
                        ? "bg-slate-200 text-slate-700"
                        : "bg-[#EFF6FF] text-[#2563EB]"
                    }`}
                  >
                    {user.isGuest ? "Guest" : "Member"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* User Summary Header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#35485D] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {isImageAvatar(user.avatar) ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <span>{user.avatar || user.name[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#0F172A] truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-[#64748B] truncate">
                            {user.username ? `@${user.username}` : user.email || "Guest Session"}
                          </p>
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
                          <span>Edit Profile</span>
                        </Link>
                      </div>
                    ) : (
                      /* Guest Options */
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openAuthModal("register");
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors text-left cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Upgrade to Member Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openAuthModal("guest");
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#0F172A] hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-[#64748B]" />
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
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Quick Notif Button */}
          <div className="flex sm:hidden items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-1.5 rounded-full hover:bg-slate-100 text-[#334155] transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" />
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

            {user && (
              <Link
                href="/profile"
                className="w-7 h-7 rounded-full overflow-hidden bg-[#35485D] text-white text-xs font-bold flex items-center justify-center relative"
              >
                {isImageAvatar(user.avatar) ? (
                  <Image src={user.avatar} alt={user.name} fill sizes="28px" className="object-cover" />
                ) : (
                  <span>{user.avatar || user.name[0]}</span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-5 space-y-2 animate-in fade-in duration-100">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-lg ${
              isActive("/") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#0F172A]"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link
            href="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-lg ${
              isActive("/rooms") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#0F172A]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat Rooms</span>
          </Link>

          <Link
            href="/random-chat"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-lg ${
              isActive("/random-chat") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#0F172A]"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Random Chat</span>
          </Link>

          <Link
            href="/random-video"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-lg ${
              isActive("/random-video") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#0F172A]"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Call</span>
          </Link>

          <Link
            href="/random-voice"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-lg ${
              isActive("/random-voice") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#0F172A]"
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Call</span>
          </Link>

          <Link
            href="/friends"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-lg ${
              isActive("/friends") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#0F172A]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>People / Friends</span>
          </Link>

          <Link
            href="/messages"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-lg ${
              isActive("/messages") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#0F172A]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4" />
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
              className={`flex items-center gap-2.5 text-xs font-semibold py-2 px-3 rounded-lg ${
                isActive("/profile") ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#0F172A]"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  router.push("/");
                }}
                className="w-full py-2 text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
              >
                {user.isGuest ? "Exit Guest Mode" : "Log Out"}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold text-[#0F172A] bg-slate-100 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold text-white bg-[#2563EB] rounded-xl"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
