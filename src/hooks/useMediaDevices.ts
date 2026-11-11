"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface MediaDeviceHook {
  stream: MediaStream | null;
  permissionState: "prompt" | "granted" | "denied" | "unavailable";
  isAudioMuted: boolean;
  isVideoOff: boolean;
  audioLevel: number; // 0 to 100
  availableCameras: MediaDeviceInfo[];
  availableMics: MediaDeviceInfo[];
  selectedCameraId: string;
  selectedMicId: string;
  startMedia: (mode: "audio" | "video") => Promise<MediaStream | null>;
  stopMedia: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
  switchMic: (deviceId: string) => Promise<void>;
}

export function useMediaDevices(): MediaDeviceHook {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unavailable">("prompt");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);

  // Enumerate devices
  const enumerateDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === "videoinput");
      const mics = devices.filter((d) => d.kind === "audioinput");
      setAvailableCameras(cameras);
      setAvailableMics(mics);
      if (cameras.length > 0 && !selectedCameraId) setSelectedCameraId(cameras[0].deviceId);
      if (mics.length > 0 && !selectedMicId) setSelectedMicId(mics[0].deviceId);
    } catch (e) {
      console.warn("Device enumeration error:", e);
    }
  }, [selectedCameraId, selectedMicId]);

  useEffect(() => {
    enumerateDevices();
  }, [enumerateDevices]);

  // Audio level analyzer loop
  const setupAudioAnalyzer = (mediaStream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      const audioTrack = mediaStream.getAudioTracks()[0];
      if (!audioTrack) return;

      const source = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]));
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Map average (0 - 255) to 0 - 100 with sensitivity
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn("AudioContext setup error:", e);
    }
  };

  const startMedia = async (mode: "audio" | "video"): Promise<MediaStream | null> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState("unavailable");
      return null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
        video:
          mode === "video"
            ? selectedCameraId
              ? { deviceId: { exact: selectedCameraId }, width: { ideal: 1280 }, height: { ideal: 720 } }
              : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
            : false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStreamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionState("granted");
      setIsAudioMuted(false);
      setIsVideoOff(false);

      setupAudioAnalyzer(mediaStream);
      enumerateDevices();
      return mediaStream;
    } catch (err) {
      console.warn("getUserMedia error:", err);
      setPermissionState("denied");
      return null;
    }
  };

  const stopMedia = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach((track) => track.stop());
      currentStreamRef.current = null;
    }
    setStream(null);
    setAudioLevel(0);
  }, []);

  const toggleAudio = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const switchCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (stream && stream.getVideoTracks().length > 0) {
      stopMedia();
      await startMedia("video");
    }
  };

  const switchMic = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    if (stream) {
      const mode = stream.getVideoTracks().length > 0 ? "video" : "audio";
      stopMedia();
      await startMedia(mode);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, [stopMedia]);

  return {
    stream,
    permissionState,
    isAudioMuted,
    isVideoOff,
    audioLevel,
    availableCameras,
    availableMics,
    selectedCameraId,
    selectedMicId,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo,
    switchCamera,
    switchMic,
  };
}
