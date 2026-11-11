"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { UserProfile } from "@/types";
import { useNotifications } from "./NotificationContext";

export type CallState = "idle" | "outgoing" | "incoming" | "connected" | "ended";
export type CallType = "voice" | "video";

export interface CallRecord {
  id: string;
  peer: UserProfile;
  type: CallType;
  direction: "incoming" | "outgoing";
  duration: number;
  status: "completed" | "missed" | "declined";
  timestamp: string;
}

interface CallContextType {
  callState: CallState;
  callType: CallType;
  currentPeer: UserProfile | null;
  callDuration: number;
  isMicMuted: boolean;
  isVideoOff: boolean;
  isSpeakerMuted: boolean;
  localStream: MediaStream | null;
  callHistory: CallRecord[];
  startCall: (peer: UserProfile, type: CallType) => Promise<void>;
  simulateIncomingCall: (caller?: UserProfile, type?: CallType) => void;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMic: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const DEFAULT_CALLER: UserProfile = {
  id: "user-riya",
  name: "Riya ♡",
  username: "riya",
  avatar: "/images/avatar-riya.png",
  isGuest: false,
  joinedAt: "Jan 2026",
  bio: "Loves coffee, late night music, and thoughtful chats.",
  location: "Mumbai, India",
  interests: ["Music", "Reading", "Travel"],
  role: "User",
  isOnline: true,
  friendsCount: 24,
};

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { showToast, addNotification } = useNotifications();

  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<CallType>("video");
  const [currentPeer, setCurrentPeer] = useState<UserProfile | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play ringing sound using Web Audio API synthesis
  const stopRingtoneRef = useRef<(() => void) | null>(null);

  const playRingtone = useCallback((isIncoming: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      let interval: NodeJS.Timeout | null = null;

      const beep = () => {
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 440Hz / 480Hz dual tone
        osc.type = "sine";
        osc.frequency.setValueAtTime(isIncoming ? 440 : 425, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isIncoming ? 1.2 : 0.8));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + (isIncoming ? 1.2 : 0.8));
      };

      beep();
      interval = setInterval(beep, isIncoming ? 3000 : 2500);

      stopRingtoneRef.current = () => {
        if (interval) clearInterval(interval);
        try {
          ctx.close();
        } catch {}
      };
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (stopRingtoneRef.current) {
      stopRingtoneRef.current();
      stopRingtoneRef.current = null;
    }
  }, []);

  // Duration timer when connected
  useEffect(() => {
    if (callState === "connected") {
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
  }, [callState]);

  // Cleanup media stream
  const cleanupStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  // Start outgoing call
  const startCall = async (peer: UserProfile, type: CallType) => {
    setCurrentPeer(peer);
    setCallType(type);
    setCallState("outgoing");
    setIsMicMuted(false);
    setIsVideoOff(type === "voice");

    playRingtone(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      setLocalStream(stream);
    } catch {
      // Hardware permission fallback
    }

    // Simulate peer answering after 3.5s
    setTimeout(() => {
      stopRingtone();
      setCallState("connected");
      showToast(`Connected with ${peer.name}`, "success", "Call Connected");
    }, 3500);
  };

  // Simulate an incoming call for testing
  const simulateIncomingCall = (caller: UserProfile = DEFAULT_CALLER, type: CallType = "video") => {
    if (callState !== "idle") return;

    setCurrentPeer(caller);
    setCallType(type);
    setCallState("incoming");
    playRingtone(true);

    addNotification({
      type: "message",
      title: `Incoming ${type === "video" ? "Video" : "Voice"} Call`,
      description: `${caller.name} is calling you on ChatVerse.`,
      timestamp: "Just now",
      avatar: caller.avatar,
    });
  };

  // Accept incoming call
  const acceptCall = async () => {
    stopRingtone();
    setCallState("connected");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      setLocalStream(stream);
    } catch {
      // Hardware permission fallback
    }

    if (currentPeer) {
      showToast(`Call connected with ${currentPeer.name}`, "success", "Connected");
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    stopRingtone();
    cleanupStream();

    if (currentPeer) {
      const rec: CallRecord = {
        id: `call-${Date.now()}`,
        peer: currentPeer,
        type: callType,
        direction: "incoming",
        duration: 0,
        status: "declined",
        timestamp: "Just now",
      };
      setCallHistory((prev) => [rec, ...prev]);
    }

    setCallState("idle");
    setCurrentPeer(null);
  };

  // End active call
  const endCall = () => {
    stopRingtone();
    cleanupStream();

    if (currentPeer && callState === "connected") {
      const rec: CallRecord = {
        id: `call-${Date.now()}`,
        peer: currentPeer,
        type: callType,
        direction: "outgoing",
        duration: callDuration,
        status: "completed",
        timestamp: "Just now",
      };
      setCallHistory((prev) => [rec, ...prev]);
      showToast(`Call ended (${Math.floor(callDuration / 60)}m ${callDuration % 60}s)`, "info", "Call Ended");
    }

    setCallState("ended");

    setTimeout(() => {
      setCallState("idle");
      setCurrentPeer(null);
      setCallDuration(0);
    }, 1200);
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    } else {
      setIsMicMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    } else {
      setIsVideoOff((prev) => !prev);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted((prev) => !prev);
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        currentPeer,
        callDuration,
        isMicMuted,
        isVideoOff,
        isSpeakerMuted,
        localStream,
        callHistory,
        startCall,
        simulateIncomingCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMic,
        toggleVideo,
        toggleSpeaker,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}
