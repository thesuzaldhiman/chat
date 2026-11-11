"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { useCall } from "@/context/CallContext";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Shield,
} from "lucide-react";

export default function CallModal() {
  const {
    callState,
    callType,
    currentPeer,
    callDuration,
    isMicMuted,
    isVideoOff,
    isSpeakerMuted,
    localStream,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleVideo,
    toggleSpeaker,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, callState]);

  if (callState === "idle" || !currentPeer) return null;

  const isImageAvatar = (av?: string) => av && av.startsWith("/");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // =========================================================================
  // 1. INCOMING CALL BANNER / POPUP (Top of screen floating card)
  // =========================================================================
  if (callState === "incoming") {
    return (
      <div className="fixed top-5 right-5 z-[9999] animate-bounce-subtle max-w-sm w-full bg-white rounded-3xl p-5 border-2 border-[#2563EB]/30 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 shadow-md">
            {isImageAvatar(currentPeer.avatar) ? (
              <Image
                src={currentPeer.avatar}
                alt={currentPeer.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <span className="text-xl">{currentPeer.avatar || currentPeer.name[0]}</span>
            )}
            <span className="absolute inset-0 rounded-2xl border-2 border-[#2563EB] animate-ping opacity-40 pointer-events-none" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] uppercase tracking-wider mb-0.5">
              {callType === "video" ? (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>Incoming Video Call</span>
                </>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5" />
                  <span>Incoming Voice Call</span>
                </>
              )}
            </div>
            <h4 className="text-base font-bold text-[#0F172A] truncate">
              {currentPeer.name}
            </h4>
            <p className="text-xs text-[#64748B]">@{currentPeer.username}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={rejectCall}
            className="flex-1 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-rose-200"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Decline</span>
          </button>

          <button
            type="button"
            onClick={acceptCall}
            className="flex-1 py-3 px-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#10B981]/25 active:scale-95"
          >
            {callType === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            <span>Accept</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. OUTGOING / CALLING SCREEN
  // =========================================================================
  if (callState === "outgoing") {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-[#E2E8F0] shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#2563EB]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Caller Avatar with Animated Rings */}
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-slate-900 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6 shadow-xl">
            {isImageAvatar(currentPeer.avatar) ? (
              <Image
                src={currentPeer.avatar}
                alt={currentPeer.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <span>{currentPeer.avatar || currentPeer.name[0]}</span>
            )}
            <div className="absolute inset-0 rounded-3xl border-4 border-[#2563EB] animate-ping opacity-30" />
          </div>

          <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            Calling ({callType === "video" ? "Video" : "Voice"})...
          </p>
          <h3 className="text-xl font-extrabold text-[#0F172A] mb-1">
            {currentPeer.name}
          </h3>
          <p className="text-xs text-[#64748B] mb-8">@{currentPeer.username}</p>

          <p className="text-[11px] text-slate-400 mb-6 animate-pulse">
            Ringing... Waiting for answer
          </p>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
            title="Cancel Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. CONNECTED / ACTIVE IN-CALL MODAL
  // =========================================================================
  if (callState === "connected") {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col text-white">
        {/* Call Top Header */}
        <div className="h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-800 text-white font-bold flex items-center justify-center">
              {isImageAvatar(currentPeer.avatar) ? (
                <Image
                  src={currentPeer.avatar}
                  alt={currentPeer.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <span>{currentPeer.avatar || currentPeer.name[0]}</span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                {currentPeer.name}
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-[10px] font-semibold border border-[#10B981]/30">
                  Encrypted
                </span>
              </h4>
              <p className="text-xs text-slate-400">@{currentPeer.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-mono font-semibold tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>{formatDuration(callDuration)}</span>
            </div>
          </div>
        </div>

        {/* Video Canvas / Peer Main Tile */}
        <div className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden">
          {callType === "video" ? (
            /* Simulated Remote Video Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full max-w-4xl max-h-[80vh] rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center">
                {isImageAvatar(currentPeer.avatar) ? (
                  <Image
                    src={currentPeer.avatar}
                    alt={currentPeer.name}
                    fill
                    sizes="100vw"
                    className="object-cover filter brightness-90"
                    priority
                  />
                ) : (
                  <div className="text-6xl font-bold text-slate-400">
                    {currentPeer.avatar || currentPeer.name[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Peer Badge */}
                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>{currentPeer.name}</span>
                </div>
              </div>

              {/* Floating Self Camera (Picture-in-Picture) */}
              <div className="absolute bottom-6 right-6 w-48 sm:w-60 aspect-video rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-2xl z-30">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${
                    isVideoOff ? "hidden" : "block"
                  }`}
                />
                {isVideoOff && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-1">
                    <VideoOff className="w-6 h-6" />
                    <span className="text-[11px] font-semibold">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-semibold text-white">
                  You
                </div>
              </div>
            </div>
          ) : (
            /* Voice Call Screen */
            <div className="text-center max-w-md p-8">
              <div className="relative w-36 h-36 rounded-3xl overflow-hidden bg-slate-800 text-white text-5xl font-bold flex items-center justify-center mx-auto mb-6 shadow-2xl border-2 border-white/10">
                {isImageAvatar(currentPeer.avatar) ? (
                  <Image
                    src={currentPeer.avatar}
                    alt={currentPeer.name}
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                ) : (
                  <span>{currentPeer.avatar || currentPeer.name[0]}</span>
                )}
                {/* Audio pulse wave */}
                <div className="absolute inset-0 rounded-3xl border-4 border-[#2563EB] animate-ping opacity-25" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">
                {currentPeer.name}
              </h2>
              <p className="text-sm text-slate-400 mb-6">Voice Call in Progress</p>

              {/* Audio frequency wave simulation */}
              <div className="flex items-center justify-center gap-1.5 h-10">
                {[40, 75, 50, 95, 60, 85, 45, 90, 70, 30].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 bg-[#2563EB] rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call Controls Dock */}
        <div className="h-24 px-6 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-4 z-20">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isMicMuted
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video (if video call) */}
          {callType === "video" && (
            <button
              type="button"
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isVideoOff
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={isVideoOff ? "Turn On Video" : "Turn Off Video"}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Toggle Speaker */}
          <button
            type="button"
            onClick={toggleSpeaker}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isSpeakerMuted
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* End Call (Red) */}
          <button
            type="button"
            onClick={endCall}
            className="w-14 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition-all cursor-pointer active:scale-95 px-6 ml-2"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. CALL ENDED OVERLAY
  // =========================================================================
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#0F172A] flex items-center justify-center mx-auto mb-3">
          <PhoneOff className="w-6 h-6 text-slate-600" />
        </div>
        <h3 className="text-base font-bold text-[#0F172A] mb-1">Call Ended</h3>
        <p className="text-xs text-[#64748B]">Duration: {formatDuration(callDuration)}</p>
      </div>
    </div>
  );
}
