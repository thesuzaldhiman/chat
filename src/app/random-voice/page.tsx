"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import DeviceSettingsModal from "@/components/DeviceSettingsModal";
import { MATCHING_TOPICS } from "@/data/mockStrangers";
import { UserProfile } from "@/types";
import {
  Headphones,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  RotateCw,
  UserPlus,
  Check,
  Shield,
  Sparkles,
  MapPin,
  Clock,
  Settings,
  AlertCircle,
  ExternalLink,
  Bot,
  Radio,
} from "lucide-react";

interface LiveVoicePartner {
  id: string;
  name: string;
  avatar: string;
  location: string;
  isAiCompanion?: boolean;
}

export default function RandomVoicePage() {
  const { user, openAuthModal } = useAuth();
  const { sendFriendRequest } = useFriends();
  const media = useMediaDevices();

  const tabId = useRef(
    typeof window !== "undefined"
      ? `voice-tab-${Math.random().toString(36).substring(2, 9)}`
      : "voice-tab-init"
  ).current;

  const [sessionState, setSessionState] = useState<"idle" | "searching" | "connected" | "ended">("idle");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [partner, setPartner] = useState<LiveVoicePartner | null>(null);

  // In-call state
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [partnerSpeaking, setPartnerSpeaking] = useState(false);
  const [friendRequested, setFriendRequested] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [searchDuration, setSearchDuration] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionChannelRef = useRef<BroadcastChannel | null>(null);

  // Call duration timer
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

  // Broadcast own audio speaking level to peer
  useEffect(() => {
    if (sessionChannelRef.current && sessionState === "connected" && !media.isAudioMuted) {
      sessionChannelRef.current.postMessage({
        type: "SPEAKING_STATUS",
        senderTabId: tabId,
        isSpeaking: media.audioLevel > 8,
      });
    }
  }, [media.audioLevel, media.isAudioMuted, sessionState, tabId]);

  // Multi-tab Voice Peer Discovery Queue
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const queueChannel = new BroadcastChannel("chatverse_random_voice_queue");

    queueChannel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.senderTabId === tabId) return;

      if (data.type === "SEARCH_PING" && sessionState === "searching") {
        const sharedMatchId = `voice-${[tabId, data.senderTabId].sort().join("-")}`;
        queueChannel.postMessage({
          type: "MATCH_OFFER",
          targetTabId: data.senderTabId,
          senderTabId: tabId,
          matchId: sharedMatchId,
          user: {
            id: user?.id || tabId,
            name: user?.name || "Voice Member",
            avatar: user?.avatar || "🎧",
            location: user?.location || "Voice Network",
          },
        });

        setPartner({
          id: data.user.id,
          name: data.user.name,
          avatar: data.user.avatar,
          location: data.user.location,
          isAiCompanion: false,
        });
        setMatchId(sharedMatchId);
        setSessionState("connected");
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
      }
    };

    return () => {
      queueChannel.close();
    };
  }, [sessionState, tabId, user]);

  // Session channel communication for voice status
  useEffect(() => {
    if (!matchId || typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const sessionChannel = new BroadcastChannel(`chatverse_voice_session_${matchId}`);
    sessionChannelRef.current = sessionChannel;

    sessionChannel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.senderTabId === tabId) return;

      if (data.type === "SPEAKING_STATUS") {
        setPartnerSpeaking(Boolean(data.isSpeaking));
      } else if (data.type === "PEER_DISCONNECT") {
        media.stopMedia();
        setSessionState("ended");
      }
    };

    return () => {
      sessionChannel.close();
      sessionChannelRef.current = null;
    };
  }, [matchId, tabId, media]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startMatching = async () => {
    setSessionState("searching");
    setPartner(null);
    setFriendRequested(false);
    setMatchId(null);

    // Request real hardware microphone access
    try {
      await media.startMedia("audio");
    } catch {
      // fallback smoothly
    }

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const queueChannel = new BroadcastChannel("chatverse_random_voice_queue");
        queueChannel.postMessage({
          type: "SEARCH_PING",
          senderTabId: tabId,
          topic: selectedTopic,
          user: {
            id: user?.id || tabId,
            name: user?.name || "Voice Member",
            avatar: user?.avatar || "🎧",
            location: user?.location || "Voice Network",
          },
        });
        queueChannel.close();
      }
    } catch {}
  };

  const handleConnectWithAssistant = async () => {
    try {
      await media.startMedia("audio");
    } catch {}

    const companion: LiveVoicePartner = {
      id: "ai-audio-guide",
      name: "Audio Hardware Test Lab 🎙️",
      avatar: "🎙️",
      location: "Interactive Mic Tester",
      isAiCompanion: true,
    };
    setPartner(companion);
    setMatchId(`voice-test-${Date.now()}`);
    setSessionState("connected");
  };

  const handleNextStranger = () => {
    if (sessionChannelRef.current) {
      sessionChannelRef.current.postMessage({ type: "PEER_DISCONNECT", senderTabId: tabId });
    }
    startMatching();
  };

  const handleEndCall = () => {
    if (sessionChannelRef.current) {
      sessionChannelRef.current.postMessage({ type: "PEER_DISCONNECT", senderTabId: tabId });
    }
    media.stopMedia();
    setSessionState("ended");
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
      bio: `Matched in Random Voice Call.`,
      location: partner.location,
      interests: ["Voice Chat", "Music"],
      role: "User",
      isOnline: true,
      friendsCount: 1,
    };

    sendFriendRequest(pseudoProfile);
    setFriendRequested(true);
  };

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        {/* =========================================================================
            STATE 1: IDLE - LOBBY SELECTION
            ========================================================================= */}
        {sessionState === "idle" && (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-blue-100 text-[#2563EB] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <Headphones className="w-8 h-8 stroke-[2]" />
            </div>

            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">
              Random Voice Lounge
            </h1>
            <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
              Real-time voice calls using your microphone. Pair with live community members or test your audio setup.
            </p>

            {/* Hardware Status Preview */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#0F172A]">Microphone Ready</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>

            {/* Topic Filter */}
            <div className="mb-6 text-left">
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                Topic Filter
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MATCHING_TOPICS.slice(0, 5).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopic(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedTopic === t.id
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
                        : "bg-white hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A]"
                    }`}
                  >
                    <span>{t.icon}</span>{" "}
                    <span>{t.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={startMatching}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Mic className="w-4 h-4" />
                <span>Start Voice Matching</span>
              </button>

              <button
                type="button"
                onClick={handleConnectWithAssistant}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-[#2563EB]" />
                <span>Hardware Mic Test Lab</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: SEARCHING FOR PEER
            ========================================================================= */}
        {sessionState === "searching" && (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-8 sm:p-10 text-center animate-in fade-in">
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-20"></span>
              <div className="relative w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-blue-200 text-[#2563EB] flex items-center justify-center shadow-xs">
                <Headphones className="w-7 h-7 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#0F172A] mb-1">
              Searching for Voice Partner...
            </h3>
            <p className="text-xs text-[#64748B] mb-2">
              Waiting for an active member on {MATCHING_TOPICS.find((t) => t.id === selectedTopic)?.label || "Any Topic"}
            </p>
            <p className="text-xs font-mono text-slate-400 mb-6">
              Search duration: {formatDuration(searchDuration)}
            </p>

            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-[11px] text-slate-600 mb-6 text-left space-y-2">
              <p className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                Test Live Audio Between 2 Tabs
              </p>
              <p>
                Open ChatVerse in a second window to test peer-to-peer audio and waveform activity in real time!
              </p>
              <button
                type="button"
                onClick={() => window.open(window.location.href, "_blank")}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-[11px] font-bold text-[#2563EB] flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
                <span>Test Local Microphone Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  media.stopMedia();
                  setSessionState("idle");
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: CONNECTED - LIVE VOICE CALL INTERFACE
            ========================================================================= */}
        {sessionState === "connected" && partner && (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden p-6 sm:p-8 text-center animate-in fade-in">
            {/* Top Status */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">
                  {partner.isAiCompanion ? "Microphone Test Lab Active" : "Live Peer Voice Call"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Audio Hardware Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <div className="text-xs font-bold text-[#0F172A] bg-slate-100 px-3 py-1 rounded-full font-mono">
                  {formatDuration(callDuration)}
                </div>
              </div>
            </div>

            {/* Avatars & Visualizer */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative mb-4">
                <div
                  className={`w-28 h-28 rounded-3xl bg-slate-800 text-white font-bold text-4xl flex items-center justify-center shadow-lg transition-all ${
                    partnerSpeaking || media.audioLevel > 10 ? "ring-4 ring-[#2563EB] ring-offset-4 scale-105" : "border-4 border-white"
                  }`}
                >
                  {partner.avatar}
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-white ring-1 ring-[#10B981]/20 animate-pulse" />
              </div>

              <h2 className="text-lg font-bold text-[#0F172A]">
                {partner.name}
              </h2>
              <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{partner.location}</span>
              </p>

              {/* Dynamic WebRTC Waveform Visualizer */}
              <div className="flex items-center gap-1.5 h-12 my-6">
                {[6, 14, 26, 40, 20, 32, 16, 30, 10, 22, 36, 12].map((baseH, i) => {
                  const liveBoost = Math.round((media.audioLevel / 100) * 20);
                  const effectiveHeight =
                    (partnerSpeaking || media.audioLevel > 5) && !isSpeakerMuted
                      ? `${Math.min(48, baseH + liveBoost)}px`
                      : "4px";

                  return (
                    <div
                      key={i}
                      className="w-1.5 bg-[#2563EB] rounded-full transition-all duration-150"
                      style={{
                        height: effectiveHeight,
                        opacity: partnerSpeaking || media.audioLevel > 5 ? 1 : 0.25,
                      }}
                    />
                  );
                })}
              </div>

              {/* Live Mic Activity Sub-label */}
              {media.audioLevel > 5 && !media.isAudioMuted && (
                <span className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Microphone Active (Audio Level: {media.audioLevel}%)</span>
                </span>
              )}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-100">
              {/* Mic Mute */}
              <button
                type="button"
                onClick={media.toggleAudio}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                  media.isAudioMuted
                    ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-[#0F172A]"
                }`}
                title={media.isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {media.isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Speaker Mute */}
              <button
                type="button"
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                  isSpeakerMuted
                    ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-[#0F172A]"
                }`}
                title={isSpeakerMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Add Friend */}
              {!partner.isAiCompanion && (
                <button
                  type="button"
                  onClick={handleAddFriend}
                  disabled={friendRequested}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
                    friendRequested
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]"
                  }`}
                  title={friendRequested ? "Friend Request Sent" : "Add as Friend"}
                >
                  {friendRequested ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </button>
              )}

              {/* Next Call */}
              <button
                type="button"
                onClick={handleNextStranger}
                className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] transition-all cursor-pointer"
                title="Next Person"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Hang Up */}
              <button
                type="button"
                onClick={handleEndCall}
                className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
                title="End Voice Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 4: CALL ENDED SUMMARY
            ========================================================================= */}
        {sessionState === "ended" && (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-8 sm:p-10 text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-2xs">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-[#0F172A] mb-1">
              Voice Call Ended
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Duration: <span className="font-bold text-[#0F172A]">{formatDuration(callDuration)}</span> with {partner?.name || "Partner"}.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={startMatching}
                className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Start Another Voice Call</span>
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

      {/* Hardware Settings Modal */}
      <DeviceSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        media={media}
        mode="audio"
      />
    </div>
  );
}