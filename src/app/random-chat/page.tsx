"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { STRANGER_PARTNERS, MATCHING_TOPICS, StrangerPartner } from "@/data/mockStrangers";
import { UserProfile } from "@/types";
import {
  MessageSquare,
  Shuffle,
  Send,
  Smile,
  UserPlus,
  Check,
  X,
  ArrowRight,
  Shield,
  Sparkles,
  MapPin,
  Clock,
  RotateCw,
  LogOut,
  Radio,
} from "lucide-react";

interface RandomChatMessage {
  id: string;
  sender: "me" | "stranger";
  text: string;
  timestamp: string;
}

export default function RandomChatPage() {
  const { user, openAuthModal } = useAuth();
  const { sendFriendRequest, friends } = useFriends();

  // State machine: 'idle' | 'searching' | 'connected' | 'ended'
  const [sessionState, setSessionState] = useState<"idle" | "searching" | "connected" | "ended">("idle");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [partner, setPartner] = useState<StrangerPartner | null>(null);
  const [messages, setMessages] = useState<RandomChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [friendRequested, setFriendRequested] = useState(false);
  const [chatDuration, setChatDuration] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Duration timer when connected
  useEffect(() => {
    if (sessionState === "connected") {
      setChatDuration(0);
      timerRef.current = setInterval(() => {
        setChatDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start Searching
  const startMatching = () => {
    setSessionState("searching");
    setPartner(null);
    setMessages([]);
    setFriendRequested(false);

    // Simulate search duration
    const searchDelay = 1200 + Math.random() * 800;
    setTimeout(() => {
      // Pick random partner
      const randomIdx = Math.floor(Math.random() * STRANGER_PARTNERS.length);
      const chosen = STRANGER_PARTNERS[randomIdx];
      setPartner(chosen);
      setSessionState("connected");

      // Initial stranger greeting after 800ms
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const initialMsg: RandomChatMessage = {
            id: `msg-${Date.now()}`,
            sender: "stranger",
            text: chosen.initialGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages([initialMsg]);
        }, 1200);
      }, 600);
    }, searchDelay);
  };

  const handleNextStranger = () => {
    startMatching();
  };

  const handleEndChat = () => {
    setSessionState("ended");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || !partner) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: RandomChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: clean,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setShowEmojiMenu(false);

    // Simulate stranger response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);

        // Find keyword reply or random default
        const lower = clean.toLowerCase();
        let replyText = "";
        for (const [key, val] of Object.entries(partner.conversationReplies)) {
          if (lower.includes(key)) {
            replyText = val;
            break;
          }
        }
        if (!replyText) {
          const randIdx = Math.floor(Math.random() * partner.defaultReplies.length);
          replyText = partner.defaultReplies[randIdx];
        }

        const replyMsg: RandomChatMessage = {
          id: `msg-reply-${Date.now()}`,
          sender: "stranger",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1500);
    }, 800);
  };

  const handleAddStrangerFriend = () => {
    if (!user || user.isGuest) {
      openAuthModal("register");
      return;
    }
    if (!partner) return;

    const pseudoProfile: UserProfile = {
      id: partner.id,
      name: partner.name,
      username: partner.name.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      avatar: partner.avatar,
      isGuest: false,
      joinedAt: "Recent",
      bio: `Matched in Random Text Chat on ${selectedTopic}.`,
      location: partner.location,
      interests: partner.interests,
      role: "User",
      isOnline: true,
      friendsCount: 12,
    };

    sendFriendRequest(pseudoProfile);
    setFriendRequested(true);
  };

  const handleSendReaction = (emoji: string) => {
    if (!partner || sessionState !== "connected") return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: RandomChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: emoji,
      timestamp: time,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Stranger replies with cute reaction back
    setTimeout(() => {
      const responseEmojis = ["😊", "🙌", "✨", "🔥", "❤️", "👋"];
      const replyEmoji = responseEmojis[Math.floor(Math.random() * responseEmojis.length)];
      const replyMsg: RandomChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: "stranger",
        text: replyEmoji,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1000);
  };

  const handleWave = () => {
    if (!partner || sessionState !== "connected") return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: RandomChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: "👋 Hey there! Nice to meet you!",
      timestamp: time,
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMsg: RandomChatMessage = {
          id: `msg-reply-${Date.now()}`,
          sender: "stranger",
          text: `👋 Hey! Nice to meet you too! How are you doing today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1200);
    }, 600);
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiMenu(false);
  };

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl w-full mx-auto">
        {/* =========================================================================
            STATE 1: IDLE - TOPIC SELECTION & START
            ========================================================================= */}
        {sessionState === "idle" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs max-w-2xl mx-auto text-center animate-in fade-in">
            {/* Header */}
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <Shuffle className="w-7 h-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              Random Text Chat
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mb-8">
              Connect with a random stranger who shares your interests. Completely anonymous, private, and instant.
            </p>

            {/* Topic Selector */}
            <div className="text-left mb-8">
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
                Choose a Topic of Interest:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {MATCHING_TOPICS.map((topic) => {
                  const isSelected = selectedTopic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-2xs"
                          : "border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-base">{topic.icon}</span>
                      <span className="truncate">{topic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              onClick={startMatching}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Random Chat</span>
            </button>

            {/* Safety Guidelines */}
            <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex items-center justify-center gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Zero Spam</span>
              </span>
              <span>•</span>
              <span>Anonymous Pairing</span>
              <span>•</span>
              <span>Skip Anytime</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: SEARCHING - RADAR PULSE
            ========================================================================= */}
        {sessionState === "searching" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 shadow-xs max-w-md mx-auto text-center animate-in fade-in">
            {/* Animated Concentric Radar Rings */}
            <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#2563EB]/10 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-[#2563EB]/20 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg">
                <Shuffle className="w-7 h-7 animate-spin duration-1000" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#0F172A] mb-1">
              Finding Someone For You...
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Matching based on topic:{" "}
              <span className="font-semibold text-[#2563EB]">
                {MATCHING_TOPICS.find((t) => t.id === selectedTopic)?.label}
              </span>
            </p>

            <button
              type="button"
              onClick={() => setSessionState("idle")}
              className="px-5 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE 3: CONNECTED - CHAT CONVERSATION
            ========================================================================= */}
        {sessionState === "connected" && partner && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-[78vh] min-h-[540px] animate-in fade-in">
            {/* Partner Header */}
            <div className="p-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-xl bg-slate-800 text-white font-bold text-xl flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {partner.avatar}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white ring-1 ring-[#10B981]/20 animate-pulse" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                      {partner.name}
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B] flex items-center gap-1.5 mt-0.5 truncate font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{partner.location}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDuration(chatDuration)}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleAddStrangerFriend}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    friendRequested
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]"
                  }`}
                  title="Add as Friend"
                >
                  {friendRequested ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Request Sent</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Friend</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNextStranger}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Next Stranger"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Next</span>
                </button>

                <button
                  type="button"
                  onClick={handleEndChat}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="End Chat"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#F8FAFC]">
              {/* Connection Banner */}
              <div className="text-center my-2">
                <span className="px-3 py-1 rounded-full bg-slate-200/70 text-[#64748B] text-[11px] font-medium">
                  🔒 Anonymous 1-on-1 chat. Say hello with a quick reaction or wave below!
                </span>
              </div>

              {messages.map((m) => {
                const isMe = m.sender === "me";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in duration-200`}
                  >
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words ${
                        isMe
                          ? "bg-[#2563EB] text-white rounded-tr-xs shadow-sm shadow-[#2563EB]/15"
                          : "bg-white text-[#0F172A] border border-[#E2E8F0] rounded-tl-xs"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 pt-1 pl-1">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
                    {partner.avatar}
                  </div>
                  <div className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-[#64748B] font-medium ml-1">
                      {partner.name} is typing...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reactions & Wave Tray */}
            <div className="px-3.5 py-1.5 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] flex items-center justify-between gap-2 z-10 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-[#64748B] mr-1 hidden sm:inline">React:</span>
                {["❤️", "🔥", "😂", "✨", "🍿", "☕", "🎮", "👏"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSendReaction(emoji)}
                    className="w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:bg-[#EFF6FF] hover:scale-125 transition-all cursor-pointer active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleWave}
                className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95 shrink-0"
                title="Send wave"
              >
                <span>Wave 👋</span>
              </button>
            </div>

            {/* Bottom Composer */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#E2E8F0] relative flex-shrink-0">
              {showEmojiMenu && (
                <div className="absolute bottom-16 left-4 p-2 bg-white border border-[#E2E8F0] rounded-xl shadow-lg flex gap-1 z-20">
                  {["👋", "❤️", "😊", "🍿", "🎬", "✨", "🔥", "☕", "🎮"].map((em) => (
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

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to stranger..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
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
          </div>
        )}

        {/* =========================================================================
            STATE 4: ENDED - SUMMARY & RECONNECT
            ========================================================================= */}
        {sessionState === "ended" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs max-w-md mx-auto text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-[#2563EB]" />
            </div>

            <h3 className="text-lg font-bold text-[#0F172A] mb-1">
              Chat Ended
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              You talked for <span className="font-bold text-[#0F172A]">{formatDuration(chatDuration)}</span> with {partner?.name || "Stranger"}.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={startMatching}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Find Another Stranger</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionState("idle")}
                className="w-full py-2 px-4 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Change Topic
              </button>

              <Link
                href="/rooms"
                className="w-full py-2 px-4 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Explore Community Rooms →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
