"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { useNotifications } from "@/context/NotificationContext";
import { MATCHING_TOPICS } from "@/data/mockStrangers";
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
  Bot,
  ExternalLink,
  Users,
} from "lucide-react";

interface RandomChatMessage {
  id: string;
  sender: "me" | "partner";
  text: string;
  timestamp: string;
}

interface LivePartner {
  id: string;
  name: string;
  avatar: string;
  location: string;
  interests?: string[];
  isAiCompanion?: boolean;
}

export default function RandomChatPage() {
  const { user, openAuthModal } = useAuth();
  const { sendFriendRequest } = useFriends();
  const { showToast } = useNotifications();

  // Unique tab ID for multi-tab peer discovery
  const tabId = useRef(
    typeof window !== "undefined"
      ? `tab-${Math.random().toString(36).substring(2, 9)}`
      : "tab-init"
  ).current;

  // State machine: 'idle' | 'searching' | 'connected' | 'ended'
  const [sessionState, setSessionState] = useState<"idle" | "searching" | "connected" | "ended">("idle");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [partner, setPartner] = useState<LivePartner | null>(null);
  const [messages, setMessages] = useState<RandomChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [friendRequested, setFriendRequested] = useState(false);
  const [chatDuration, setChatDuration] = useState(0);
  const [searchDuration, setSearchDuration] = useState(0);
  const [matchId, setMatchId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionChannelRef = useRef<BroadcastChannel | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerIsTyping]);

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

  // Search duration timer
  useEffect(() => {
    if (sessionState === "searching") {
      setSearchDuration(0);
      searchTimerRef.current = setInterval(() => {
        setSearchDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    }
    return () => {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    };
  }, [sessionState]);

  // Multi-tab Peer Discovery Queue using BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const queueChannel = new BroadcastChannel("chatverse_random_chat_queue");

    queueChannel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.senderTabId === tabId) return;

      // When another tab is searching and we are searching, match together!
      if (data.type === "SEARCH_PING" && sessionState === "searching") {
        const sharedMatchId = `match-${[tabId, data.senderTabId].sort().join("-")}`;
        queueChannel.postMessage({
          type: "MATCH_OFFER",
          targetTabId: data.senderTabId,
          senderTabId: tabId,
          matchId: sharedMatchId,
          user: {
            id: user?.id || tabId,
            name: user?.name || "Community Partner",
            avatar: user?.avatar || "🦊",
            location: user?.location || "Live Network",
          },
        });

        // Set partner and connect
        setPartner({
          id: data.user.id,
          name: data.user.name,
          avatar: data.user.avatar,
          location: data.user.location,
          isAiCompanion: false,
        });
        setMatchId(sharedMatchId);
        setSessionState("connected");
        showToast("Connected to a live community partner!", "success");
      } else if (data.type === "MATCH_OFFER" && data.targetTabId === tabId && sessionState === "searching") {
        setPartner({
          id: data.user.id,
          name: data.user.name,
          avatar: data.user.avatar,
          location: data.user.location,
          isAiCompanion: false,
        });
        setMatchId(data.matchId);
        setSessionState("connected");
        showToast("Connected to a live community partner!", "success");
      }
    };

    return () => {
      queueChannel.close();
    };
  }, [sessionState, tabId, user, showToast]);

  // Session channel communication (messages, reactions, disconnect)
  useEffect(() => {
    if (!matchId || typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const sessionChannel = new BroadcastChannel(`chatverse_session_${matchId}`);
    sessionChannelRef.current = sessionChannel;

    sessionChannel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.senderTabId === tabId) return;

      if (data.type === "CHAT_MSG") {
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            sender: "partner",
            text: data.message.text,
            timestamp: data.message.timestamp,
          },
        ]);
        setPartnerIsTyping(false);
      } else if (data.type === "TYPING") {
        setPartnerIsTyping(Boolean(data.isTyping));
      } else if (data.type === "PEER_DISCONNECT") {
        showToast("Partner disconnected or skipped to next match", "info");
        setSessionState("ended");
      }
    };

    return () => {
      sessionChannel.close();
      sessionChannelRef.current = null;
    };
  }, [matchId, tabId, showToast]);

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
    setMatchId(null);

    // Announce to queue channel
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const queueChannel = new BroadcastChannel("chatverse_random_chat_queue");
        queueChannel.postMessage({
          type: "SEARCH_PING",
          senderTabId: tabId,
          topic: selectedTopic,
          user: {
            id: user?.id || tabId,
            name: user?.name || "Community Partner",
            avatar: user?.avatar || "🦊",
            location: user?.location || "Live Network",
          },
        });
        queueChannel.close();
      }
    } catch {}
  };

  // Connect to Assistant Companion for instant test chat
  const handleConnectWithAssistant = () => {
    const companion: LivePartner = {
      id: "ai-assistant",
      name: "ChatVerse Assistant 🤖",
      avatar: "🤖",
      location: "ChatVerse Community Guide",
      interests: ["ChatVerse Tips", "Rooms Guide", "Social Features"],
      isAiCompanion: true,
    };
    setPartner(companion);
    setMatchId(`companion-${Date.now()}`);
    setSessionState("connected");

    const welcomeMsg: RandomChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "partner",
      text: "Hello! I'm the ChatVerse Assistant. Ask me anything about our public chat rooms, making friends, or try typing to test the live chat!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([welcomeMsg]);
  };

  const handleNextStranger = () => {
    // Notify peer of disconnect
    if (sessionChannelRef.current) {
      sessionChannelRef.current.postMessage({ type: "PEER_DISCONNECT", senderTabId: tabId });
    }
    startMatching();
  };

  const handleEndChat = () => {
    if (sessionChannelRef.current) {
      sessionChannelRef.current.postMessage({ type: "PEER_DISCONNECT", senderTabId: tabId });
    }
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

    // Send to live peer over session channel
    if (sessionChannelRef.current && !partner.isAiCompanion) {
      sessionChannelRef.current.postMessage({
        type: "CHAT_MSG",
        senderTabId: tabId,
        message: userMsg,
      });
      sessionChannelRef.current.postMessage({
        type: "TYPING",
        senderTabId: tabId,
        isTyping: false,
      });
    }

    // If chatting with Assistant, generate helpful response
    if (partner.isAiCompanion) {
      setPartnerIsTyping(true);
      setTimeout(() => {
        setPartnerIsTyping(false);
        const lower = clean.toLowerCase();
        let reply = "That's a great thought! ChatVerse offers public rooms, direct messaging, and speed audio/video calling. What feature would you like to explore?";
        if (lower.includes("room") || lower.includes("rooms")) {
          reply = "You can explore over 12 themed chat rooms like #general-chat, #love-chat, and #music-lovers from the 'Chat Rooms' tab in the top header!";
        } else if (lower.includes("friend") || lower.includes("people")) {
          reply = "To add friends, check out the 'People' tab! You can discover members, send friend requests, and start direct 1-to-1 chats.";
        } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
          reply = "Hey there! Glad to have you on ChatVerse. How are you liking the new Warm Social interface?";
        } else if (lower.includes("video") || lower.includes("voice")) {
          reply = "Our Video and Voice tabs feature real hardware microphone and camera access with live audio waveform monitoring!";
        }

        const botReply: RandomChatMessage = {
          id: `msg-reply-${Date.now()}`,
          sender: "partner",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botReply]);
      }, 1200);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (sessionChannelRef.current && !partner?.isAiCompanion) {
      sessionChannelRef.current.postMessage({
        type: "TYPING",
        senderTabId: tabId,
        isTyping: Boolean(e.target.value.trim()),
      });
    }
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
      interests: partner.interests || ["Chat", "Social"],
      role: "User",
      isOnline: true,
      friendsCount: 1,
    };

    sendFriendRequest(pseudoProfile);
    setFriendRequested(true);
    showToast(`Friend request sent to ${partner.name}!`, "success");
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
    if (sessionChannelRef.current && !partner.isAiCompanion) {
      sessionChannelRef.current.postMessage({
        type: "CHAT_MSG",
        senderTabId: tabId,
        message: userMsg,
      });
    }
  };

  const handleWave = () => {
    if (!partner || sessionState !== "connected") return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: RandomChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: "Wave 👋",
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (sessionChannelRef.current && !partner.isAiCompanion) {
      sessionChannelRef.current.postMessage({
        type: "CHAT_MSG",
        senderTabId: tabId,
        message: userMsg,
      });
    }
    showToast("You waved to your chat partner! 👋", "info");
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiMenu(false);
  };

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-4 sm:py-6 px-3 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl flex-1 flex flex-col">
        {/* =========================================================================
            STATE 1: LOBBY & TOPIC SELECTION
            ========================================================================= */}
        {sessionState === "idle" && (
          <div className="my-auto bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-10 shadow-xs animate-in fade-in">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-2xs">
                <Shuffle className="w-7 h-7 stroke-[2.2]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
                Random 1-on-1 Text Chat
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mb-8 leading-relaxed">
                Meet real community members instantly. Select an interest topic below or start an open conversation with anyone active right now.
              </p>

              {/* Topic Pills */}
              <div className="mb-8 text-left">
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3 text-center sm:text-left">
                  Filter by Matching Interest
                </label>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {MATCHING_TOPICS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTopic(t.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                        selectedTopic === t.id
                          ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
                          : "bg-white hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A]"
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  type="button"
                  onClick={startMatching}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <Shuffle className="w-4 h-4 stroke-[2.2]" />
                  <span>Start Matching</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleConnectWithAssistant}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-[#2563EB]" />
                  <span>Test with Assistant</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Live multi-tab peer discovery
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Real-time direct sync
                </span>
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500" />
                  Instant disconnect anytime
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: SEARCHING QUEUE
            ========================================================================= */}
        {sessionState === "searching" && (
          <div className="my-auto bg-white rounded-3xl border border-[#E2E8F0] p-8 sm:p-12 shadow-xs text-center max-w-md mx-auto w-full animate-in fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-20"></span>
              <div className="relative w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-blue-200 text-[#2563EB] flex items-center justify-center shadow-xs">
                <Shuffle className="w-7 h-7 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#0F172A] mb-1">
              Searching for Live Peer...
            </h3>
            <p className="text-xs text-[#64748B] mb-2">
              Waiting for an active member on{" "}
              <strong className="text-[#0F172A]">
                {MATCHING_TOPICS.find((t) => t.id === selectedTopic)?.label || "Any Topic"}
              </strong>
            </p>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Queue search time: {formatDuration(searchDuration)}
            </p>

            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-[11px] text-slate-600 mb-6 text-left space-y-2">
              <p className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                Multi-Tab Peer Pairing Active
              </p>
              <p>
                Open ChatVerse in a second window or tab to immediately connect and chat with yourself in real-time!
              </p>
              <button
                type="button"
                onClick={() => window.open(window.location.href, "_blank")}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-[11px] font-bold text-[#2563EB] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <span>Open 2nd Window to Test</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConnectWithAssistant}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>Test with ChatVerse Assistant 🤖</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionState("idle")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel Search
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: CONNECTED ACTIVE CONVERSATION
            ========================================================================= */}
        {sessionState === "connected" && partner && (
          <div className="flex-1 flex flex-col bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden animate-in fade-in">
            {/* Top Match Bar */}
            <div className="px-5 py-3.5 border-b border-[#F1F4F8] bg-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-2xl bg-slate-800 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <span>{partner.avatar}</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white animate-pulse"></span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0F172A] truncate">
                      {partner.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#64748B] mt-0.5">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{partner.location}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[#0F172A]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDuration(chatDuration)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Partner Actions */}
              <div className="flex items-center gap-2">
                {!partner.isAiCompanion && (
                  <button
                    type="button"
                    onClick={handleAddStrangerFriend}
                    disabled={friendRequested}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      friendRequested
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]"
                    }`}
                  >
                    {friendRequested ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Request Sent</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Add Friend</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextStranger}
                  className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Skip to next peer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Next</span>
                </button>

                <button
                  type="button"
                  onClick={handleEndChat}
                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  title="Disconnect chat"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC]/50">
              {messages.map((m) => {
                const isMe = m.sender === "me";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end ml-auto" : "items-start mr-auto"} max-w-[85%] sm:max-w-md animate-in fade-in duration-150`}
                  >
                    <div className="flex items-center gap-1.5 px-1 mb-1">
                      <span className="text-[10px] font-bold text-[#64748B]">
                        {isMe ? "You" : partner.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                    </div>

                    <div
                      className={`px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs break-words ${
                        isMe
                          ? "bg-[#2563EB] text-white rounded-2xl rounded-tr-xs"
                          : "bg-white text-[#0F172A] border border-[#E2E8F0] rounded-2xl rounded-tl-xs"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {/* Partner Typing Bubble */}
              {partnerIsTyping && (
                <div className="flex items-center gap-2 text-xs text-[#64748B] italic animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold">
                    {partner.avatar}
                  </div>
                  <span>{partner.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reactions & Wave Bar */}
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
                title="Wave to partner"
              >
                <span>Wave</span>
                <span>👋</span>
              </button>
            </div>

            {/* Message Composer */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#F1F4F8] relative">
              {showEmojiMenu && (
                <div className="absolute bottom-full mb-2 left-4 bg-white border border-[#E2E8F0] rounded-2xl p-2.5 shadow-xl grid grid-cols-6 gap-1.5 z-40">
                  {["❤️", "😂", "🔥", "👍", "👋", "🎉", "✨", "☕", "🍿", "👀", "🙌", "💯"].map((em) => (
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
                <div className="flex-1 flex items-center bg-[#F1F5F9] rounded-2xl px-3.5 py-2 border border-transparent focus-within:border-[#2563EB] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2563EB]/15 transition-all">
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                    className="bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none flex-1 py-0.5"
                  />

                  <button
                    type="button"
                    onClick={() => setShowEmojiMenu(!showEmojiMenu)}
                    className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:hover:bg-[#2563EB] text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-2xs"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 4: CHAT ENDED SUMMARY
            ========================================================================= */}
        {sessionState === "ended" && (
          <div className="my-auto bg-white rounded-3xl border border-[#E2E8F0] p-8 sm:p-10 shadow-xs text-center max-w-md mx-auto w-full animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-2xs">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-[#0F172A] mb-1">
              Chat Session Completed
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              You talked for <span className="font-bold text-[#0F172A]">{formatDuration(chatDuration)}</span> with {partner?.name || "Community Partner"}.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={startMatching}
                className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Match with Another Person</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionState("idle")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-all cursor-pointer"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}