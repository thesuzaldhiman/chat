"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import DeviceSettingsModal from "@/components/DeviceSettingsModal";
import { STRANGER_PARTNERS, MATCHING_TOPICS, StrangerPartner } from "@/data/mockStrangers";
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
} from "lucide-react";

export default function RandomVoicePage() {
  const { user, openAuthModal } = useAuth();
  const { sendFriendRequest } = useFriends();
  const media = useMediaDevices();

  const [sessionState, setSessionState] = useState<"idle" | "searching" | "connected" | "ended">("idle");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [partner, setPartner] = useState<StrangerPartner | null>(null);

  // In-call state
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [partnerSpeaking, setPartnerSpeaking] = useState(true);
  const [friendRequested, setFriendRequested] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Simulate speaking cadence for partner
  useEffect(() => {
    if (sessionState !== "connected") return;
    const interval = setInterval(() => {
      setPartnerSpeaking((prev) => !prev);
    }, 2200);
    return () => clearInterval(interval);
  }, [sessionState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startMatching = async () => {
    setSessionState("searching");
    setPartner(null);
    setFriendRequested(false);

    // Request real hardware microphone access
    try {
      await media.startMedia("audio");
    } catch {
      // fallback smoothly
    }

    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * STRANGER_PARTNERS.length);
      setPartner(STRANGER_PARTNERS[randomIdx]);
      setSessionState("connected");
    }, 1500);
  };

  const handleNextStranger = () => {
    startMatching();
  };

  const handleEndCall = () => {
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
      interests: partner.interests,
      role: "User",
      isOnline: true,
      friendsCount: 14,
    };

    sendFriendRequest(pseudoProfile);
    setFriendRequested(true);
  };

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto">
        {/* =========================================================================
            STATE 1: IDLE - TOPIC SELECTION & MIC READY
            ========================================================================= */}
        {sessionState === "idle" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <Headphones className="w-7 h-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight mb-2">
              Random Voice Call
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mb-6">
              Connect in a safe, peer-to-peer voice conversation with someone across the globe. No phone numbers exchanged.
            </p>

            {/* Hardware Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#1E293B] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>Microphone Ready &bull; WebRTC Audio Engine</span>
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="ml-2 text-[#2563EB] hover:underline cursor-pointer"
              >
                Settings
              </button>
            </div>

            {/* Topic Selector */}
            <div className="text-left mb-8">
              <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-3">
                Select Voice Conversation Topic:
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

            {/* CTA */}
            <button
              type="button"
              onClick={startMatching}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto"
            >
              <Mic className="w-4 h-4" />
              <span>Start Voice Matching</span>
            </button>

            {/* Privacy Badges */}
            <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex items-center justify-center gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Zero Audio Recording</span>
              </span>
              <span>•</span>
              <span>Live Mic Meter</span>
              <span>•</span>
              <span>Skip Anytime</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: SEARCHING - VOICE RADAR
            ========================================================================= */}
        {sessionState === "searching" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 shadow-xs text-center animate-in fade-in max-w-md mx-auto">
            <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#2563EB]/10 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-[#2563EB]/20 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg">
                <Headphones className="w-7 h-7 animate-pulse" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#1E293B] mb-1">
              Matching Voice Partner...
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Checking available callers on &ldquo;{MATCHING_TOPICS.find((t) => t.id === selectedTopic)?.label}&rdquo;
            </p>

            <button
              type="button"
              onClick={() => {
                media.stopMedia();
                setSessionState("idle");
              }}
              className="px-5 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* =========================================================================
            STATE 3: CONNECTED - LIVE VOICE CALL INTERFACE
            ========================================================================= */}
        {sessionState === "connected" && partner && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden p-6 sm:p-8 text-center animate-in fade-in">
            {/* Top Status */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">Voice Connected &bull; WebRTC</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Audio Hardware Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <div className="text-xs font-bold text-[#1E293B] bg-slate-100 px-3 py-1 rounded-full">
                  {formatDuration(callDuration)}
                </div>
              </div>
            </div>

            {/* Avatars & Visualizer */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative mb-4">
                <div
                  className={`w-28 h-28 rounded-3xl bg-slate-800 text-white font-bold text-4xl flex items-center justify-center shadow-lg transition-all ${
                    partnerSpeaking ? "ring-4 ring-[#2563EB] ring-offset-4 scale-105" : "border-4 border-white"
                  }`}
                >
                  {partner.avatar}
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#22C55E] border-2 border-white" />
              </div>

              <h2 className="text-lg font-bold text-[#1E293B]">
                {partner.name}
              </h2>
              <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{partner.location}</span>
              </p>

              {/* Dynamic WebRTC Waveform Visualizer */}
              <div className="flex items-center gap-1.5 h-12 my-6">
                {[6, 14, 26, 40, 20, 32, 16, 30, 10, 22, 36, 12].map((baseH, i) => {
                  // If partner is speaking, use animated height; also respond to user's live audio level
                  const liveBoost = Math.round((media.audioLevel / 100) * 15);
                  const effectiveHeight =
                    partnerSpeaking && !isSpeakerMuted
                      ? `${Math.min(48, baseH + liveBoost)}px`
                      : media.audioLevel > 5
                      ? `${Math.min(48, 8 + liveBoost)}px`
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
              {media.audioLevel > 8 && !media.isAudioMuted && (
                <span className="text-[11px] text-[#2563EB] font-semibold flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span>Your microphone is transmitting ({media.audioLevel}%)</span>
                </span>
              )}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-100">
              {/* Mic Mute */}
              <button
                type="button"
                onClick={() => media.toggleAudio()}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                  media.isAudioMuted ? "bg-rose-100 text-rose-700" : "bg-slate-100 hover:bg-slate-200 text-[#1E293B]"
                }`}
                title={media.isAudioMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {media.isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Speaker Mute */}
              <button
                type="button"
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                  isSpeakerMuted ? "bg-rose-100 text-rose-700" : "bg-slate-100 hover:bg-slate-200 text-[#1E293B]"
                }`}
                title={isSpeakerMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Add Friend */}
              <button
                type="button"
                onClick={handleAddFriend}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                  friendRequested
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#EFF6FF] hover:bg-[#d8ece8] text-[#2563EB]"
                }`}
                title="Add as Friend"
              >
                {friendRequested ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </button>

              {/* Next Stranger */}
              <button
                type="button"
                onClick={handleNextStranger}
                className="w-12 h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                title="Next Voice Stranger"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* End Call */}
              <button
                type="button"
                onClick={handleEndCall}
                className="w-12 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                title="End Voice Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 4: ENDED - SUMMARY
            ========================================================================= */}
        {sessionState === "ended" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs text-center animate-in fade-in max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-[#2563EB]" />
            </div>

            <h3 className="text-lg font-bold text-[#1E293B] mb-1">
              Voice Call Ended
            </h3>
            <p className="text-xs text-[#64748B] mb-6">
              Duration: <span className="font-bold text-[#1E293B]">{formatDuration(callDuration)}</span> with {partner?.name || "Partner"}.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={startMatching}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Headphones className="w-4 h-4" />
                <span>Call Another Stranger</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionState("idle")}
                className="w-full py-2 px-4 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Change Topic
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
