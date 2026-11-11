"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import DeviceSettingsModal from "@/components/DeviceSettingsModal";
import { STRANGER_PARTNERS, MATCHING_TOPICS, StrangerPartner } from "@/data/mockStrangers";
import { UserProfile } from "@/types";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  RotateCw,
  UserPlus,
  Check,
  Shield,
  Sparkles,
  MapPin,
  Clock,
  Camera,
  Maximize2,
  Minimize2,
  Settings,
  MessageSquare,
  Users,
  Monitor,
  Hand,
  Smile,
  Send,
  X,
  Grid,
  Volume2,
  VolumeX,
  Share2,
  Flame,
  Heart,
  ThumbsUp,
  PartyPopper,
  Laugh,
} from "lucide-react";

interface InCallMessage {
  id: string;
  sender: string;
  avatar?: string;
  text: string;
  time: string;
  isOwn?: boolean;
}

interface ParticipantTile {
  id: string;
  name: string;
  avatar: string;
  location: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isHandRaised?: boolean;
}

const DEFAULT_PARTICIPANTS: ParticipantTile[] = [
  {
    id: "part-1",
    name: "Riya Sharma",
    avatar: "/images/avatar-riya.png",
    location: "Mumbai, India",
    isMuted: false,
    isVideoOff: false,
    isSpeaking: true,
  },
  {
    id: "part-2",
    name: "Aman Verma",
    avatar: "/images/avatar-aman.png",
    location: "Delhi, India",
    isMuted: false,
    isVideoOff: false,
    isSpeaking: false,
  },
  {
    id: "part-3",
    name: "Pooja Patel",
    avatar: "/images/avatar-pooja.png",
    location: "Ahmedabad, India",
    isMuted: true,
    isVideoOff: false,
    isSpeaking: false,
  },
];

export default function VideoCallPage() {
  const { user, openAuthModal } = useAuth();
  const { sendFriendRequest } = useFriends();
  const media = useMediaDevices();

  // Call session states
  const [sessionState, setSessionState] = useState<"idle" | "searching" | "connected" | "ended">("idle");
  const [callMode, setCallMode] = useState<"one-on-one" | "group">("one-on-one");
  const [layoutMode, setLayoutMode] = useState<"spotlight" | "grid">("spotlight");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [partner, setPartner] = useState<StrangerPartner | null>(null);

  // In-call toggles & states
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [friendRequested, setFriendRequested] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Side drawers (Chat & Participants)
  const [activeSideDrawer, setActiveSideDrawer] = useState<"none" | "chat" | "participants">("none");
  const [inCallMessages, setInCallMessages] = useState<InCallMessage[]>([
    {
      id: "incall-1",
      sender: "Riya Sharma",
      avatar: "/images/avatar-riya.png",
      text: "Hey! Can you hear me clearly? 😊",
      time: "10:24 PM",
    },
    {
      id: "incall-2",
      sender: "Aman Verma",
      avatar: "/images/avatar-aman.png",
      text: "Yes, video quality is crystal clear! 🚀",
      time: "10:25 PM",
    },
  ]);
  const [chatInputText, setChatInputText] = useState("");
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Floating Emoji reactions
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);

  // Local user video reference
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Attach local video stream
  useEffect(() => {
    if (localVideoRef.current && media.stream) {
      localVideoRef.current.srcObject = media.stream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [media.stream, sessionState, media.isVideoOff]);

  // Call duration counter
  useEffect(() => {
    if (sessionState === "connected") {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  // Scroll in-call chat
  useEffect(() => {
    if (activeSideDrawer === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [inCallMessages, activeSideDrawer]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startMatching = async (mode: "one-on-one" | "group" = "one-on-one") => {
    setCallMode(mode);
    setSessionState("searching");
    setPartner(null);
    setFriendRequested(false);

    try {
      await media.startMedia("video");
    } catch {
      // Fallback seamlessly
    }

    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * STRANGER_PARTNERS.length);
      setPartner(STRANGER_PARTNERS[randomIdx]);
      setSessionState("connected");
    }, 1500);
  };

  const handleNextStranger = () => {
    startMatching(callMode);
  };

  const handleEndCall = () => {
    media.stopMedia();
    setIsScreenSharing(false);
    setIsHandRaised(false);
    setActiveSideDrawer("none");
    setSessionState("ended");
  };

  const handleSendInCallChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const newMsg: InCallMessage = {
      id: `incall-${Date.now()}`,
      sender: user?.name || "You",
      text: chatInputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };

    setInCallMessages((prev) => [...prev, newMsg]);
    setChatInputText("");

    // Simulate partner response after a brief pause
    setTimeout(() => {
      if (sessionState === "connected") {
        const partnerName = partner?.name || "Riya Sharma";
        const replies = [
          "That sounds awesome! 🌟",
          "Totally agree with you on that!",
          "Haha yes, exactly! 🙌",
          "Could you share your screen again?",
          "Nice to meet you here on ChatVerse!",
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg: InCallMessage = {
          id: `incall-${Date.now()}`,
          sender: partnerName,
          avatar: partner?.avatar ? undefined : "/images/avatar-riya.png",
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setInCallMessages((prev) => [...prev, replyMsg]);
        if (activeSideDrawer !== "chat") {
          setUnreadChatCount((prev) => prev + 1);
        }
      }
    }, 2500);
  };

  const triggerReaction = (emoji: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  const handleAddFriend = () => {
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
      bio: `Matched in Random Video Call.`,
      location: partner.location,
      interests: partner.interests,
      role: "User",
      isOnline: true,
      friendsCount: 16,
    };

    sendFriendRequest(pseudoProfile);
    setFriendRequested(true);
  };

  return (
    <div className="h-[calc(100vh-58px)] w-full bg-slate-950 text-white flex flex-col relative overflow-hidden select-none">
      {/* Floating Reaction Bubbles Animation */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-24 text-3xl sm:text-4xl animate-in slide-in-from-bottom duration-1000 ease-out transition-all"
            style={{
              left: `${r.x}%`,
              animation: "floatUp 2s forwards ease-in-out",
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateY(-120px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-260px) scale(1.5);
          }
        }
      `}</style>

      {/* =========================================================================
          STATE 1: IDLE LOBBY (Lobby Screen with Camera Preview & Controls)
          ========================================================================= */}
      {sessionState === "idle" && (
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] text-[#1E293B]">
          <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Camera Preview Box */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm">
              <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center mb-4">
                {media.stream && !media.isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-semibold">Camera is currently turned off</p>
                  </div>
                )}

                {/* Overlay Controls */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={media.toggleAudio}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      media.isAudioMuted
                        ? "bg-rose-600 text-white"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                    title={media.isAudioMuted ? "Unmute Mic" : "Mute Mic"}
                  >
                    {media.isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={media.toggleVideo}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      media.isVideoOff
                        ? "bg-rose-600 text-white"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                    title={media.isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                  >
                    {media.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
                    title="Audio & Video Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hardware Status */}
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      media.permissionState === "granted" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>
                    {media.permissionState === "granted"
                      ? "Hardware Ready • WebRTC HD 1080p Engine"
                      : "Permission required to access video stream"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="text-[#2563EB] font-semibold hover:underline"
                >
                  Configure Devices
                </button>
              </div>
            </div>

            {/* Right: Meeting Join Configuration */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next-Gen Video Experience</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight mb-2">
                  Start Video Call
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Join a real-time, peer-to-peer encrypted video session. Select a matching topic or jump into a group room.
                </p>
              </div>

              {/* Topic Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2.5">
                  Select Matching Topic:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MATCHING_TOPICS.slice(0, 4).map((topic) => {
                    const isSelected = selectedTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] ring-1 ring-[#2563EB]"
                            : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm">{topic.icon}</span>
                        <span className="truncate">{topic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => startMatching("one-on-one")}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Start 1-on-1 Video Match</span>
                </button>

                <button
                  type="button"
                  onClick={() => startMatching("group")}
                  className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E293B] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#2563EB]" />
                  <span>Join Community Group Call</span>
                </button>
              </div>

              {/* Security notes */}
              <div className="flex items-center gap-3 text-xs text-[#64748B]">
                <Shield className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                <span>End-to-end WebRTC encryption. Zero recording logs.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 2: SEARCHING / CONNECTING RADAR
          ========================================================================= */}
      {sessionState === "searching" && (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
          <div className="text-center max-w-sm w-full animate-in fade-in">
            <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#2563EB]/15 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-[#2563EB]/25 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-2xl">
                <Video className="w-9 h-9 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Connecting Video Stream...
            </h3>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed">
              Finding the best peer-to-peer WebRTC connection across the global network
            </p>

            <button
              type="button"
              onClick={() => {
                media.stopMedia();
                setSessionState("idle");
              }}
              className="px-6 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              Cancel Match
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 3: LIVE CONNECTED VIDEO ROOM (Google Meet / Zoom Grade Workspace)
          ========================================================================= */}
      {sessionState === "connected" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          {/* Top Video Header Bar */}
          <div className="h-14 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {callMode === "group" ? "Community Video Room" : partner?.name || "Video Partner"}
                </h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                1080p HD &bull; 42ms
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Call Timer */}
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDuration(callDuration)}</span>
              </span>

              {/* Layout Switcher (Spotlight / Grid) */}
              <button
                type="button"
                onClick={() => setLayoutMode(layoutMode === "spotlight" ? "grid" : "spotlight")}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title={`Switch to ${layoutMode === "spotlight" ? "Grid" : "Spotlight"} Layout`}
              >
                <Grid className="w-4 h-4" />
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Device Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Video Viewport & Side Drawers */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* Center Video Stage */}
            <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center items-center relative overflow-hidden bg-slate-950">
              {/* Screen Share Banner */}
              {isScreenSharing && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                  <span>You are sharing your screen</span>
                </div>
              )}

              {/* Hand Raised Banner */}
              {isHandRaised && (
                <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <Hand className="w-3.5 h-3.5 text-amber-400" />
                  <span>Your hand is raised</span>
                </div>
              )}

              {/* Video Layout: Spotlight Mode */}
              {layoutMode === "spotlight" && (
                <div className="relative w-full h-full max-w-5xl rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 flex items-center justify-center shadow-2xl">
                  {/* Remote Primary Stream Avatar & Visualization */}
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <div className="relative mb-4">
                      <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-3xl bg-slate-800/90 border-2 border-teal-500/40 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl backdrop-blur-md ring-4 ring-teal-500/10">
                        {partner?.avatar || "👩‍🦰"}
                      </div>
                      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#22C55E] border-2 border-slate-900" />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {partner?.name || "Riya Sharma"}
                    </h3>
                    <p className="text-xs text-teal-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-teal-500" />
                      <span>{partner?.location || "Mumbai, India"}</span>
                      <span>&bull;</span>
                      <span>Speaking</span>
                    </p>
                  </div>

                  {/* Local User Picture-In-Picture Camera (Bottom Right) */}
                  <div className="absolute bottom-4 right-4 z-20 w-36 sm:w-48 h-26 sm:h-34 rounded-2xl bg-slate-900 border-2 border-white/20 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
                    {!media.isVideoOff ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[9px] font-bold text-white flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              media.isAudioMuted
                                ? "bg-rose-500"
                                : media.audioLevel > 10
                                ? "bg-emerald-400 animate-pulse"
                                : "bg-slate-400"
                            }`}
                          />
                          <span>You</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                        <VideoOff className="w-6 h-6 mb-1 text-rose-400" />
                        <span className="text-[10px] font-semibold text-slate-300">Camera Off</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Video Layout: Multi-participant Grid Mode */}
              {layoutMode === "grid" && (
                <div className="w-full h-full max-w-5xl grid grid-cols-2 gap-3 sm:gap-4 p-2">
                  {/* Remote Tile 1 */}
                  <div className="relative rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-lg">
                    <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-slate-800 border border-teal-500/30 flex items-center justify-center text-4xl sm:text-5xl mb-2">
                      {partner?.avatar || "👩‍🦰"}
                    </div>
                    <span className="text-xs font-bold text-white">{partner?.name || "Riya"}</span>
                    <span className="absolute bottom-2 left-3 text-[10px] text-teal-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Active
                    </span>
                  </div>

                  {/* Remote Tile 2 */}
                  <div className="relative rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-lg">
                    <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-slate-800 border border-white/20 flex items-center justify-center text-4xl sm:text-5xl mb-2">
                      👨‍💻
                    </div>
                    <span className="text-xs font-bold text-white">Aman Verma</span>
                    <span className="absolute bottom-2 left-3 text-[10px] text-slate-400">Online</span>
                  </div>

                  {/* Remote Tile 3 */}
                  <div className="relative rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-lg">
                    <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-slate-800 border border-white/20 flex items-center justify-center text-4xl sm:text-5xl mb-2">
                      🌸
                    </div>
                    <span className="text-xs font-bold text-white">Pooja Patel</span>
                    <span className="absolute bottom-2 left-3 text-[10px] text-slate-400">Muted</span>
                  </div>

                  {/* Local User Tile */}
                  <div className="relative rounded-2xl bg-slate-900 border-2 border-[#2563EB] overflow-hidden flex items-center justify-center shadow-lg">
                    {!media.isVideoOff ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <VideoOff className="w-8 h-8 mb-1 text-rose-400" />
                        <span className="text-xs">Camera Off</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-3 text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded">
                      You
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================
                SLIDE-OUT SIDE DRAWER: IN-CALL CHAT
                ========================================================= */}
            {activeSideDrawer === "chat" && (
              <div className="w-80 sm:w-96 border-l border-slate-800 bg-slate-900 flex flex-col h-full flex-shrink-0 animate-in slide-in-from-right duration-200 z-30">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-sm font-bold text-white">In-Call Messages</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSideDrawer("none")}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                  {inCallMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                        <span>{msg.sender}</span>
                        <span>&bull;</span>
                        <span>{msg.time}</span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
                          msg.isOwn
                            ? "bg-[#2563EB] text-white rounded-tr-xs"
                            : "bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendInCallChat}
                  className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950"
                >
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Send a message to everyone..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* =========================================================
                SLIDE-OUT SIDE DRAWER: PARTICIPANTS
                ========================================================= */}
            {activeSideDrawer === "participants" && (
              <div className="w-80 sm:w-96 border-l border-slate-800 bg-slate-900 flex flex-col h-full flex-shrink-0 animate-in slide-in-from-right duration-200 z-30">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-sm font-bold text-white">Participants (4)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSideDrawer("none")}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* You */}
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center">
                        {user?.name ? user.name[0] : "Y"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{user?.name || "You (Host)"}</p>
                        <p className="text-[10px] text-slate-400">Local Stream</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      {media.isAudioMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                      {media.isVideoOff ? <VideoOff className="w-4 h-4 text-rose-400" /> : <Video className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </div>

                  {/* Partner / Others */}
                  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center">
                        {partner?.avatar || "👩‍🦰"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{partner?.name || "Riya Sharma"}</p>
                        <p className="text-[10px] text-slate-400">{partner?.location || "Mumbai, India"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mic className="w-4 h-4 text-emerald-400" />
                      <Video className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center">
                        👨‍💻
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Aman Verma</p>
                        <p className="text-[10px] text-slate-400">Delhi, India</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mic className="w-4 h-4 text-emerald-400" />
                      <Video className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center">
                        🌸
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Pooja Patel</p>
                        <p className="text-[10px] text-slate-400">Ahmedabad, India</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MicOff className="w-4 h-4 text-rose-400" />
                      <Video className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Invite CTA */}
                <div className="p-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Video meeting link copied to clipboard!");
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Copy Meeting Link</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              FLOATING BOTTOM CONTROL DOCK (Next-Gen UI Bar)
              ========================================================================= */}
          <div className="p-4 z-40 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            {/* Left Quick Status */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Encrypted P2P HD Stream</span>
            </div>

            {/* Center Controls Dock */}
            <div className="flex items-center gap-2.5 sm:gap-3 mx-auto">
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={media.toggleAudio}
                className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  media.isAudioMuted
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                }`}
                title={media.isAudioMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {media.isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Camera Toggle */}
              <button
                type="button"
                onClick={media.toggleVideo}
                className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  media.isVideoOff
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                }`}
                title={media.isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {media.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              {/* Screen Share Toggle */}
              <button
                type="button"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isScreenSharing
                    ? "bg-[#2563EB] text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
                title={isScreenSharing ? "Stop Screen Share" : "Share Your Screen"}
              >
                <Monitor className="w-5 h-5" />
              </button>

              {/* Raise Hand Toggle */}
              <button
                type="button"
                onClick={() => setIsHandRaised(!isHandRaised)}
                className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isHandRaised
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
                title={isHandRaised ? "Lower Hand" : "Raise Hand"}
              >
                <Hand className="w-5 h-5" />
              </button>

              {/* Emoji Reactions Picker */}
              <div className="relative group">
                <button
                  type="button"
                  className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title="Send Reaction"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Popover reactions */}
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl flex items-center gap-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                  {["❤️", "🔥", "👍", "🎉", "😂", "👏"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => triggerReaction(emoji)}
                      className="p-1.5 hover:scale-125 transition-transform cursor-pointer text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Call Chat Drawer Toggle */}
              <button
                type="button"
                onClick={() => {
                  setActiveSideDrawer(activeSideDrawer === "chat" ? "none" : "chat");
                  setUnreadChatCount(0);
                }}
                className={`relative w-11 sm:w-12 h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  activeSideDrawer === "chat"
                    ? "bg-[#2563EB] text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
                title="In-Call Chat"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              {/* Participants Drawer Toggle */}
              <button
                type="button"
                onClick={() =>
                  setActiveSideDrawer(activeSideDrawer === "participants" ? "none" : "participants")
                }
                className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  activeSideDrawer === "participants"
                    ? "bg-[#2563EB] text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
                title="Participants List"
              >
                <Users className="w-5 h-5" />
              </button>

              {/* Add Friend (If matched) */}
              <button
                type="button"
                onClick={handleAddFriend}
                className={`w-11 sm:w-12 h-11 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  friendRequested
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
                title="Add as Friend"
              >
                {friendRequested ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </button>

              {/* Next Stranger Button */}
              <button
                type="button"
                onClick={handleNextStranger}
                className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-md"
                title="Next Video Stranger"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Red Leave / End Video Call */}
              <button
                type="button"
                onClick={handleEndCall}
                className="w-12 sm:w-14 h-11 sm:h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer ml-1"
                title="Leave Video Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Mute Speaker & Settings */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
              >
                {isSpeakerMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 4: CALL ENDED SUMMARY
          ========================================================================= */}
      {sessionState === "ended" && (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC] text-[#1E293B]">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 sm:p-10 shadow-sm text-center max-w-md w-full animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-2xs">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-[#1E293B] mb-1">
              Video Call Ended
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Total duration: <span className="font-bold text-[#1E293B]">{formatDuration(callDuration)}</span> with {partner?.name || "Community Partner"}.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => startMatching(callMode)}
                className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Start Another Video Call</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionState("idle")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-semibold transition-all cursor-pointer"
              >
                Return to Video Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Settings Modal */}
      <DeviceSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        media={media}
        mode="video"
      />
    </div>
  );
}
