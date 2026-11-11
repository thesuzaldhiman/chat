"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { MOCK_ROOMS } from "@/data/mockData";
import { ChatRoom } from "@/types";
import { useAuth } from "@/context/AuthContext";
import FeatureCard from "@/components/FeatureCard";
import RoomCard from "@/components/RoomCard";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Globe,
  MessageSquare,
  Video,
  Mic,
  Users,
  Lock,
  Heart,
  Smile,
  CheckCircle2,
  PhoneCall,
  Shuffle,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const { user, openAuthModal } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"rooms" | "matching">("rooms");
  const [customRooms, setCustomRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("chatverse_custom_rooms");
      if (stored) {
        setCustomRooms(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const categories = [
    "All",
    "Love & Relationships",
    "Friendship",
    "General",
    "Music",
    "Late Night",
  ];

  const allAvailableRooms = useMemo(() => {
    return [...customRooms, ...MOCK_ROOMS];
  }, [customRooms]);

  const filteredRooms = useMemo(() => {
    if (selectedCategory === "All") {
      return allAvailableRooms.slice(0, 6);
    }
    return allAvailableRooms
      .filter((r) => r.category.toLowerCase().includes(selectedCategory.toLowerCase()))
      .slice(0, 6);
  }, [allAvailableRooms, selectedCategory]);

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-8 sm:py-14 overflow-hidden">
      {/* =========================================================================
          HERO SECTION (High visual impact, clear value proposition, interactive hub)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Live Online Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-xs font-semibold text-[#2563EB] mb-6 shadow-xs animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span>Over 3,850+ active members chatting right now</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12] mb-6">
            Meet People. Connect. <br className="hidden sm:inline" />
            <span className="text-[#2563EB] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent">
              Start Real Conversations.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed mb-9 max-w-2xl font-normal">
            Discover welcoming communities, make lifelong friends, and connect with people worldwide through real-time text, crystal-clear voice, and HD video.
          </p>

          {/* Main Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-8">
            <Link
              href="/rooms"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4 stroke-[2]" />
              <span>Explore Chat Rooms</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/random-chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-[#0F172A] bg-white hover:bg-slate-50 border border-[#E2E8F0] hover:border-slate-300 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>Random Text Match</span>
            </Link>

            <Link
              href="/random-video"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#2563EB]/20 rounded-xl shadow-2xs transition-all active:scale-95"
            >
              <Video className="w-4 h-4 stroke-[2]" />
              <span>Instant Video Call</span>
            </Link>
          </div>

          {/* Value Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#64748B] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              No signup required for guests
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              100% Free &amp; Moderated
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Instant &lt; 2s matching
            </span>
          </div>

          {/* =========================================================================
              INTERACTIVE HERO HUB CARD (Live preview before scrolling)
              ========================================================================= */}
          <div className="mt-12 w-full max-w-3xl bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden text-left">
            {/* Hub Header & Tabs */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">
                    Live Community Hub
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Instant entry to trending public spaces &amp; random pairing
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2E8F0] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("rooms")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === "rooms"
                      ? "bg-[#2563EB] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  🔥 Trending Rooms
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("matching")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === "matching"
                      ? "bg-[#2563EB] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  ⚡ Instant Matching
                </button>
              </div>
            </div>

            {/* Hub Content */}
            <div className="p-4 sm:p-5">
              {activeTab === "rooms" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MOCK_ROOMS.slice(0, 3).map((r) => (
                    <Link
                      key={r.slug}
                      href={`/rooms/${r.slug}`}
                      className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#EFF6FF]/30 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">
                            {r.name}
                          </span>
                          <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-medium shrink-0">
                            {r.category.split(" ")[0]}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#64748B] line-clamp-1 mb-3">
                          {r.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                          {r.onlineCount} online
                        </span>
                        <span className="font-semibold text-[#2563EB] flex items-center gap-0.5">
                          Join <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    href="/random-chat"
                    className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#EFF6FF]/40 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        Random Text
                      </h4>
                      <p className="text-[11px] text-[#64748B]">1-on-1 text pairing</p>
                    </div>
                  </Link>

                  <Link
                    href="/random-voice"
                    className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#EFF6FF]/40 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Mic className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        Random Voice
                      </h4>
                      <p className="text-[11px] text-[#64748B]">Audio conversations</p>
                    </div>
                  </Link>

                  <Link
                    href="/random-video"
                    className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-[#EFF6FF]/40 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Video className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        Random Video
                      </h4>
                      <p className="text-[11px] text-[#64748B]">Face-to-face WebRTC</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN 4 FEATURE CARDS (Ways to Connect)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2 block">
            Flexible Connections
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
            Ways to Connect on ChatVerse
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            From active themed community rooms to one-on-one serendipitous conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard
            title="Chat Rooms"
            description="Join public and private themed communities and chat with hundreds of online members."
            iconName="MessagesSquare"
            ctaText="Explore Rooms"
            badge="14 Active Rooms"
            href="/rooms"
            isPrimary={true}
          />

          <FeatureCard
            title="Random Text Chat"
            description="Meet new people through instant random text conversations. Skip anytime with no pressure."
            iconName="MessageCircle"
            ctaText="Start Texting"
            badge="Instant &lt; 2s"
            href="/random-chat"
          />

          <FeatureCard
            title="Random Voice Call"
            description="Connect with a randomly matched person through crystal-clear voice audio."
            iconName="Headphones"
            ctaText="Start Audio"
            badge="HD Audio"
            href="/random-voice"
          />

          <FeatureCard
            title="Random Video Call"
            description="Meet someone face-to-face with high-definition WebRTC video calling and reaction tools."
            iconName="Video"
            ctaText="Start Video"
            badge="1080p WebRTC"
            href="/random-video"
          />
        </div>
      </section>

      {/* =========================================================================
          POPULAR CHAT ROOMS (Filterable discovery grid)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-1.5 block">
              Active Communities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              Popular Chat Rooms
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Jump into the most active rooms and connect with online members immediately.
            </p>
          </div>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors self-start sm:self-auto"
          >
            <span>View All Rooms ({MOCK_ROOMS.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#2563EB] text-white shadow-2xs"
                  : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => (
            <RoomCard key={room.slug} room={room} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (3-Step Frictionless Experience)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2 block">
              Effortless &amp; Instant
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              How ChatVerse Works
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Jump into any conversation in under 10 seconds. No complicated setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/70 border border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-lg mb-4 shadow-2xs">
                1
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">
                Choose Your Vibe
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed font-normal">
                Pick a community chat room that interests you, or hit Start Random to meet an intriguing stranger instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/70 border border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-lg mb-4 shadow-2xs">
                2
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">
                Join Freely or Register
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed font-normal">
                Enter immediately as a Guest with a nickname, or create an account to unlock permanent profiles and friendships.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/70 border border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-lg mb-4 shadow-2xs">
                3
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">
                Connect &amp; Make Friends
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed font-normal">
                Exchange messages, jump on voice or video, send friend requests, and continue private conversations anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SAFETY & PRIVACY PILLARS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1.5">
              Guest Friendly
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed font-normal">
              No mandatory credit cards or endless forms. Start chatting immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1.5">
              Safe &amp; Moderated
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed font-normal">
              Automated anti-spam, 1-click user blocking, and dedicated room moderators.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
              <Globe className="w-5 h-5 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1.5">
              Worldwide Reach
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed font-normal">
              Meet people from across the globe sharing your unique hobbies and passions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
              <Video className="w-5 h-5 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-1.5">
              Crystal Clear WebRTC
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed font-normal">
              Hardware-accelerated video &amp; noise-cancelling audio for buttery smooth calls.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA BANNER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-md">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Ready to meet someone new today?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-8 font-normal">
              Join thousands of friendly people in active public rooms, or start a spontaneous random chat in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/rooms"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-[#2563EB] bg-white hover:bg-blue-50 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <span>Browse All Rooms</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {!user && (
                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-blue-700/60 hover:bg-blue-700/80 border border-white/20 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <span>Create Free Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
