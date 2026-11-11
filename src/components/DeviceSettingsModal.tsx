"use client";

import React, { useRef, useEffect } from "react";
import { MediaDeviceHook } from "@/hooks/useMediaDevices";
import {
  X,
  Camera,
  Mic,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Volume2,
} from "lucide-react";

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaDeviceHook;
  mode: "audio" | "video";
}

export default function DeviceSettingsModal({
  isOpen,
  onClose,
  media,
  mode,
}: DeviceSettingsModalProps) {
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && mode === "video" && videoPreviewRef.current && media.stream) {
      videoPreviewRef.current.srcObject = media.stream;
    }
  }, [isOpen, mode, media.stream]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#1E293B]">
              Audio &amp; Video Hardware Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-[#1E293B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission status alert */}
        <div className="mb-4">
          {media.permissionState === "granted" ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Hardware permissions granted. Camera &amp; Mic active.</span>
            </div>
          ) : media.permissionState === "denied" ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Permission denied in browser. Please enable access in site settings.</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Browser permission required to access live hardware feeds.</span>
            </div>
          )}
        </div>

        {/* Video Preview if video mode */}
        {mode === "video" && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
              Camera Preview
            </label>
            <div className="relative w-full h-40 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
              {media.stream && media.stream.getVideoTracks().length > 0 ? (
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <Camera className="w-6 h-6 mx-auto mb-1 text-slate-500" />
                  <span>No live video stream active</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Microphone selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
            Microphone Device
          </label>
          <select
            value={media.selectedMicId}
            onChange={(e) => media.switchMic(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            {media.availableMics.length > 0 ? (
              media.availableMics.map((mic, idx) => (
                <option key={mic.deviceId || idx} value={mic.deviceId}>
                  {mic.label || `Microphone ${idx + 1}`}
                </option>
              ))
            ) : (
              <option value="">Default System Microphone</option>
            )}
          </select>
        </div>

        {/* Live Audio Input Meter */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Live Mic Input Level</span>
            </span>
            <span className="font-semibold">{media.audioLevel}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] rounded-full transition-all duration-75"
              style={{ width: `${media.audioLevel}%` }}
            />
          </div>
        </div>

        {/* Camera selector if in video mode */}
        {mode === "video" && (
          <div className="mb-5">
            <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-1.5">
              Camera Device
            </label>
            <select
              value={media.selectedCameraId}
              onChange={(e) => media.switchCamera(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              {media.availableCameras.length > 0 ? (
                media.availableCameras.map((cam, idx) => (
                  <option key={cam.deviceId || idx} value={cam.deviceId}>
                    {cam.label || `Camera ${idx + 1}`}
                  </option>
                ))
              ) : (
                <option value="">Default Front Camera</option>
              )}
            </select>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
