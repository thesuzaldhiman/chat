"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AVATAR_PRESETS, INTEREST_TAG_OPTIONS } from "@/data/mockUsers";
import { MOCK_ROOMS } from "@/data/mockData";
import {
  User as UserIcon,
  Settings,
  Shield,
  MapPin,
  Calendar,
  Globe,
  Tag,
  Check,
  AlertCircle,
  Camera,
  MessageSquare,
  Users,
  LogOut,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";

function MyProfileContent() {
  const searchParams = useSearchParams();
  const { user, updateProfile, resetPassword, logout, openAuthModal } = useAuth();

  const initialTab = searchParams.get("tab") === "edit" ? "edit" : "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "rooms" | "security">(initialTab);

  // Edit form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatar, setAvatar] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Password reset state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with current user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setWebsite(user.website || "");
      setAvatar(user.avatar || "👨‍💻");
      setSelectedInterests(user.interests || ["Tech", "Coffee"]);
    }
  }, [user]);

  const isImageAvatar = (av?: string) => av && av.startsWith("/");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);
    setIsSaving(true);

    try {
      const res = await updateProfile({
        name,
        username,
        bio,
        location,
        website,
        avatar,
        interests: selectedInterests,
      });

      if (res.success) {
        setSaveSuccess("Profile updated successfully!");
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        setSaveError(res.error || "Failed to update profile.");
      }
    } catch {
      setSaveError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (newPassword.length < 6) {
      setSaveError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSaveError("Passwords do not match.");
      return;
    }

    try {
      // simulate password update
      setSaveSuccess("Password updated securely!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      setSaveError("Failed to update password.");
    }
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      if (selectedInterests.length >= 6) {
        setSaveError("You can choose up to 6 interests.");
        return;
      }
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1E293B] mb-2">
            Sign In to View Your Profile
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Create an account or sign in to customize your identity, view friendships, and access private features.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="px-5 py-2 text-xs font-semibold text-[#1E293B] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-xs"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Guest Banner if guest */}
        {user.isGuest && (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1E293B]">
                  You are currently using a Temporary Guest Profile ({user.name})
                </p>
                <p className="text-xs text-[#64748B]">
                  Upgrade to a full account to keep your unique @handle, save friendships, and send private messages!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="h-36 sm:h-44 bg-gradient-to-r from-teal-600 via-[#2563EB] to-emerald-700 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Profile Header Details */}
          <div className="px-6 sm:px-8 pb-6 relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
              {/* Avatar + Basic identity */}
              <div className="flex items-end gap-4">
                <div className="relative">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white bg-slate-800 text-white shadow-lg flex items-center justify-center text-4xl font-bold">
                    {isImageAvatar(user.avatar) ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <span>{user.avatar || user.name[0]}</span>
                    )}
                  </div>
                  <span
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#22C55E] border-2 border-white"
                    title="Online"
                  />
                </div>

                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight">
                      {user.name}
                    </h1>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                        user.isGuest
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-[#EFF6FF] text-[#2563EB] border border-[#d0ece8]"
                      }`}
                    >
                      {user.role === "Moderator" && <Shield className="w-3 h-3" />}
                      {user.isGuest ? "Guest User" : user.role || "Member"}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {user.username ? `@${user.username}` : user.email || "Temporary Guest"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {activeTab !== "edit" ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E293B] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>View Overview</span>
                  </button>
                )}
                {user.username && !user.isGuest && (
                  <Link
                    href={`/profile/${user.username}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#d9ece8] rounded-xl transition-colors"
                  >
                    <span>Public View</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-px overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === "overview"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === "edit"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rooms")}
                className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === "rooms"
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                My Chat Rooms
              </button>
              {!user.isGuest && (
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                    activeTab === "security"
                      ? "border-[#2563EB] text-[#2563EB]"
                      : "border-transparent text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  Account &amp; Security
                </button>
              )}
            </div>

            {/* Alerts */}
            {saveSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* TAB CONTENT */}

            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="mt-6 space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                    <p className="text-lg font-bold text-[#1E293B]">{user.friendsCount || 0}</p>
                    <p className="text-[11px] text-[#64748B]">Friends</p>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                    <p className="text-lg font-bold text-[#1E293B]">4</p>
                    <p className="text-[11px] text-[#64748B]">Active Rooms</p>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                    <p className="text-lg font-bold text-[#2563EB]">Online</p>
                    <p className="text-[11px] text-[#64748B]">Community Status</p>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                    <p className="text-lg font-bold text-[#1E293B]">100%</p>
                    <p className="text-[11px] text-[#64748B]">Reputation Score</p>
                  </div>
                </div>

                {/* About & Bio */}
                <div>
                  <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
                    About Me
                  </h3>
                  <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#334155] leading-relaxed">
                    {user.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself to the community!"}
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#2563EB]" />
                    <div>
                      <p className="text-[10px] text-[#64748B]">Location</p>
                      <p className="text-xs font-semibold text-[#1E293B]">
                        {user.location || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#2563EB]" />
                    <div>
                      <p className="text-[10px] text-[#64748B]">Member Since</p>
                      <p className="text-xs font-semibold text-[#1E293B]">
                        {user.joinedAt || "Recent"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-[#2563EB]" />
                    <div>
                      <p className="text-[10px] text-[#64748B]">Website / Link</p>
                      <p className="text-xs font-semibold text-[#1E293B] truncate max-w-[140px]">
                        {user.website || "None"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                {user.interests && user.interests.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
                      Interests &amp; Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] border border-[#d2ece7] rounded-xl text-xs font-semibold"
                        >
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. EDIT PROFILE TAB */}
            {activeTab === "edit" && (
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                {/* Avatar Preset Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
                    Choose Profile Avatar
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                    {AVATAR_PRESETS.map((p) => {
                      const isSelected = avatar === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setAvatar(p.value)}
                          className={`relative h-14 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-[#EFF6FF]"
                              : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100"
                          }`}
                        >
                          {p.value.startsWith("/") ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                              <Image src={p.value} alt={p.label} fill sizes="32px" className="object-cover" />
                            </div>
                          ) : (
                            <span className="text-2xl">{p.value}</span>
                          )}
                          <span className="text-[9px] text-[#64748B] mt-0.5 truncate max-w-[60px]">
                            {p.label.split(":")[1]?.trim() || p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Basic inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>

                  {!user.isGuest && (
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                        Username (Unique Handle)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs text-[#64748B]">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          placeholder="alex_99"
                          className="w-full pl-8 pr-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    Bio &amp; Status Message
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other community members what you love talking about..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  />
                </div>

                {/* Location & Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. New York, USA or Mumbai, India"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                      Website or Social Link
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                {/* Interests Tag Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                      Interests &amp; Topics ({selectedInterests.length}/6)
                    </label>
                    <span className="text-[11px] text-[#64748B]">Click tags to toggle</span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    {INTEREST_TAG_OPTIONS.map((tag) => {
                      const isSelected = selectedInterests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInterest(tag)}
                          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#2563EB] text-white shadow-xs"
                              : "bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#1E293B]"
                          }`}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isSaving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            )}

            {/* 3. ROOMS TAB */}
            {activeTab === "rooms" && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                    My Active Communities
                  </h3>
                  <Link
                    href="/rooms"
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    Explore More Rooms →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MOCK_ROOMS.slice(0, 4).map((room) => (
                    <div
                      key={room.slug}
                      className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3 hover:border-[#2563EB]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                          style={{ backgroundColor: room.accentBg, color: room.accentColor }}
                        >
                          {room.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1E293B] truncate">
                            {room.name}
                          </p>
                          <p className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                            <span>{room.onlineCount.toLocaleString()} online</span>
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/rooms/${room.slug}`}
                        className="px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#d5eee9] rounded-lg transition-colors flex-shrink-0"
                      >
                        Enter
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SECURITY TAB */}
            {activeTab === "security" && !user.isGuest && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-2">
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="max-w-md space-y-3.5 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </button>
                  </form>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0]">
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
                    Session &amp; Logout
                  </h3>
                  <p className="text-xs text-[#64748B] mb-3">
                    Sign out of this browser session. You can sign back in anytime using your email/username and password.
                  </p>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out of ChatVerse</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MyProfileContent />
    </Suspense>
  );
}
