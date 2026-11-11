"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { useMessages } from "@/context/MessageContext";
import { useCall } from "@/context/CallContext";
import { UserProfile, PrivateMessage } from "@/types";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Smile,
  Check,
  CheckCheck,
  ArrowLeft,
  MoreVertical,
  Trash2,
  ExternalLink,
  Shield,
  Sparkles,
  Users,
  X,
  Phone,
  Video,
} from "lucide-react";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUsername = searchParams.get("user");

  const { user, openAuthModal, getUserProfile } = useAuth();
  const { friends, getFriendshipStatus } = useFriends();
  const { startCall } = useCall();
  const {
    conversations,
    totalUnreadCount,
    getConversationMessages,
    sendMessage,
    markConversationAsRead,
    getOrCreateConversation,
    deleteConversation,
  } = useMessages();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeMenuOpen, setActiveMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If query param ?user=... is present, find or create conversation
  useEffect(() => {
    if (targetUsername) {
      const target = getUserProfile(targetUsername);
      if (target) {
        const conv = getOrCreateConversation(target);
        setActiveConvId(conv.id);
      }
    } else if (conversations.length > 0 && !activeConvId && typeof window !== "undefined" && window.innerWidth >= 768) {
      // Default to first conversation on desktop
      setActiveConvId(conversations[0].id);
    }
  }, [targetUsername, conversations, activeConvId, getUserProfile, getOrCreateConversation]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (activeConvId) {
      markConversationAsRead(activeConvId);
    }
  }, [activeConvId, markConversationAsRead]);

  // Scroll to bottom on message change
  const activeMessages = activeConvId ? getConversationMessages(activeConvId) : [];
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, activeConvId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const isImageAvatar = (av?: string) => av && av.startsWith("/");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    sendMessage(activeConversation.otherUser, inputText);
    setInputText("");
    setShowEmojiMenu(false);
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiMenu(false);
  };

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.otherUser.name.toLowerCase().includes(q) ||
      c.otherUser.username.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.text.toLowerCase().includes(q))
    );
  });

  if (!user || user.isGuest) {
    return (
      <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1E293B] mb-2">
            Sign In for Private Messaging
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Private 1-to-1 chats are reserved for registered members to protect user privacy and safety.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => openAuthModal("login")}
              className="px-5 py-2 text-xs font-semibold text-[#1E293B] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
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

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden h-[78vh] min-h-[550px]">
        <div className="flex-1 flex overflow-hidden">
          {/* =========================================================================
              LEFT COLUMN: CONVERSATION LIST (Hidden on mobile if chat is open)
              ========================================================================= */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-[#E2E8F0] flex flex-col bg-white flex-shrink-0 ${
              activeConvId ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header: Title + New Chat */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1E293B]">Messages</h2>
                {totalUnreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">
                    {totalUnreadCount} new
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#d8ece8] rounded-xl transition-colors cursor-pointer"
                title="Start New Chat"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            {/* Conversation Threads */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((c) => {
                  const isSelected = c.id === activeConvId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveConvId(c.id);
                        markConversationAsRead(c.id);
                      }}
                      className={`w-full p-3.5 flex items-start gap-3 transition-colors text-left cursor-pointer ${
                        isSelected
                          ? "bg-[#EFF6FF]/70 border-l-4 border-l-[#2563EB]"
                          : "hover:bg-slate-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                          {isImageAvatar(c.otherUser.avatar) ? (
                            <Image
                              src={c.otherUser.avatar}
                              alt={c.otherUser.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span>{c.otherUser.avatar || c.otherUser.name[0]}</span>
                          )}
                        </div>
                        {c.otherUser.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white" />
                        )}
                      </div>

                      {/* Info & Snippet */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-bold text-[#1E293B] truncate">
                            {c.otherUser.name}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {c.lastMessage ? c.lastMessage.timestamp : ""}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate ${
                            c.unreadCount > 0
                              ? "font-bold text-[#1E293B]"
                              : "text-[#64748B]"
                          }`}
                        >
                          {c.lastMessage ? c.lastMessage.text : "No messages yet."}
                        </p>
                      </div>

                      {/* Unread count badge */}
                      {c.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[#64748B]">
                  No conversations found.
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: ACTIVE CHAT CONVERSATION
              ========================================================================= */}
          <div
            className={`flex-1 flex flex-col bg-[#F8FAFC] ${
              !activeConvId ? "hidden md:flex" : "flex"
            }`}
          >
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="h-14 px-4 sm:px-6 bg-white border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveConvId(null)}
                      className="p-1 rounded-lg text-slate-500 hover:text-[#1E293B] md:hidden"
                      aria-label="Back to conversations list"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <Link
                      href={`/profile/${activeConversation.otherUser.username}`}
                      className="relative flex-shrink-0"
                    >
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-800 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {isImageAvatar(activeConversation.otherUser.avatar) ? (
                          <Image
                            src={activeConversation.otherUser.avatar}
                            alt={activeConversation.otherUser.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <span>
                            {activeConversation.otherUser.avatar ||
                              activeConversation.otherUser.name[0]}
                          </span>
                        )}
                      </div>
                      {activeConversation.otherUser.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white" />
                      )}
                    </Link>

                    <div className="min-w-0">
                      <Link
                        href={`/profile/${activeConversation.otherUser.username}`}
                        className="text-xs sm:text-sm font-bold text-[#1E293B] hover:text-[#2563EB] transition-colors truncate block"
                      >
                        {activeConversation.otherUser.name}
                      </Link>
                      <p className="text-[10px] text-[#64748B] flex items-center gap-1.5 truncate">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            activeConversation.otherUser.isOnline
                              ? "bg-[#22C55E]"
                              : "bg-slate-300"
                          }`}
                        />
                        <span>
                          {activeConversation.otherUser.isOnline ? "Online" : "Offline"}
                        </span>
                        <span>•</span>
                        <span>@{activeConversation.otherUser.username}</span>
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Voice Call Button */}
                    <button
                      type="button"
                      onClick={() => startCall(activeConversation.otherUser, "voice")}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                      title="Start Voice Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Voice</span>
                    </button>

                    {/* Video Call Button */}
                    <button
                      type="button"
                      onClick={() => startCall(activeConversation.otherUser, "video")}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                      title="Start Video Call"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Video</span>
                    </button>

                    <Link
                      href={`/profile/${activeConversation.otherUser.username}`}
                      className="p-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                      title="View Profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteConversation(activeConversation.id)}
                      className="p-1.5 rounded-xl border border-[#E2E8F0] hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                  {/* Date Badge */}
                  <div className="flex justify-center my-2">
                    <span className="px-3 py-0.5 rounded-full bg-slate-200/60 text-[#64748B] text-[10px] font-semibold">
                      End-to-End Encrypted Conversation
                    </span>
                  </div>

                  {activeMessages.map((m) => {
                    const isOwn = m.senderId === user.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isOwn ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words ${
                            isOwn
                              ? "bg-[#2563EB] text-white rounded-tr-xs"
                              : "bg-white text-[#1E293B] border border-[#E2E8F0] rounded-tl-xs"
                          }`}
                        >
                          {m.text}
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                          <span>{m.timestamp}</span>
                          {isOwn && (
                            <span className="text-teal-600 ml-0.5">
                              {m.status === "read" ? (
                                <CheckCheck className="w-3.5 h-3.5 text-teal-600 stroke-[2.2]" />
                              ) : (
                                <Check className="w-3.5 h-3.5 stroke-[2]" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer */}
                <div className="p-3 sm:p-4 bg-white border-t border-[#E2E8F0] flex-shrink-0 relative">
                  {/* Quick Emoji Popover */}
                  {showEmojiMenu && (
                    <div className="absolute bottom-16 left-4 p-2 bg-white border border-[#E2E8F0] rounded-xl shadow-lg flex gap-1 z-20">
                      {["👋", "❤️", "😊", "🍿", "🎬", "✨", "🔥", "☕", "🎉"].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => insertEmoji(em)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-lg flex items-center justify-center cursor-pointer transition-colors"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                      className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Add Emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Message ${activeConversation.otherUser.name}...`}
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="w-9 h-9 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer flex-shrink-0"
                      title="Send"
                    >
                      <Send className="w-4 h-4 translate-x-[-0.5px]" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Active Chat Selected */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#1E293B] mb-1">
                  Select a Conversation
                </h3>
                <p className="text-xs text-[#64748B] max-w-sm mb-6">
                  Choose an existing chat thread from the left or start a new conversation with one of your friends.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Conversation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          NEW CHAT MODAL: PICK A FRIEND
          ========================================================================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#1E293B]">
                Start a New Conversation
              </h3>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-slate-400 hover:text-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] mt-2 mb-4">
              Select one of your friends to start chatting with:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {friends.length > 0 ? (
                friends.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      const conv = getOrCreateConversation(f);
                      setActiveConvId(conv.id);
                      setShowNewChatModal(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-[#EFF6FF] border border-[#E2E8F0] flex items-center justify-between transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                        {isImageAvatar(f.avatar) ? (
                          <Image src={f.avatar} alt={f.name} fill sizes="36px" className="object-cover" />
                        ) : (
                          <span>{f.avatar || f.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E293B]">{f.name}</p>
                        <p className="text-[10px] text-[#64748B]">@{f.username}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#2563EB] font-semibold">
                      Chat →
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#64748B]">
                  <p>You don&apos;t have any friends yet.</p>
                  <Link
                    href="/friends"
                    onClick={() => setShowNewChatModal(false)}
                    className="text-[#2563EB] font-semibold underline mt-2 block"
                  >
                    Discover People to Add Friends
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
