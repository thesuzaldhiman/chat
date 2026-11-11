"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GUEST_AVATARS } from "@/data/mockData";
import { X, UserCheck, Sparkles, LogIn, UserPlus, Shield, AlertCircle } from "lucide-react";

export default function AuthAccessModal() {
  const {
    isModalOpen,
    modalMode,
    closeAuthModal,
    continueAsGuest,
    login,
    register,
    targetRoomSlug,
    user,
  } = useAuth();
  const router = useRouter();

  // Tab state: 'guest' | 'login' | 'register'
  const [tab, setTab] = useState<"guest" | "login" | "register">(modalMode || "guest");

  // Keep tab synced with modalMode when modal opens
  React.useEffect(() => {
    if (modalMode) setTab(modalMode);
  }, [modalMode]);

  // Guest inputs
  const [name, setName] = useState(user?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || GUEST_AVATARS[0]);

  // Auth inputs
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    continueAsGuest(finalName, selectedAvatar);
    closeAuthModal();

    if (targetRoomSlug) {
      router.push(`/rooms/${targetRoomSlug}`);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(emailOrUser, password);
      if (res.success) {
        closeAuthModal();
        if (targetRoomSlug) {
          router.push(`/rooms/${targetRoomSlug}`);
        }
      } else {
        setError(res.error || "Login failed.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await register({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
      });
      if (res.success) {
        closeAuthModal();
        if (targetRoomSlug) {
          router.push(`/rooms/${targetRoomSlug}`);
        }
      } else {
        setError(res.error || "Registration failed.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRandomName = () => {
    const adjectives = ["Curious", "Sunny", "Swift", "Calm", "Brisk", "Gentle", "Bright"];
    const nouns = ["Voyager", "Echo", "Sparrow", "Comet", "Reader", "Thinker", "Nomad"];
    const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randNoun = nouns[Math.floor(Math.random() * nouns.length)];
    setName(`${randAdj}${randNoun}`);
  };

  const fillDemo = () => {
    setEmailOrUser("alex@example.com");
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#1E293B]">
              Welcome to ChatVerse
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Choose how you want to join the conversation
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: 3 Options as required in Section 4 */}
        <div className="px-6 pt-1 pb-3">
          <div className="grid grid-cols-3 gap-1 bg-[#F8FAFC] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTab("guest");
                setError(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === "guest"
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-[#64748B] hover:text-[#1E293B]"
              }`}
            >
              Guest Access
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-[#64748B] hover:text-[#1E293B]"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === "register"
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-[#64748B] hover:text-[#1E293B]"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: GUEST ACCESS */}
        {tab === "guest" && (
          <form onSubmit={handleGuestSubmit} className="px-6 pb-6 space-y-4">
            <div className="p-3 bg-[#EFF6FF] rounded-xl text-xs text-[#2563EB] flex items-start gap-2 leading-relaxed">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Guests can explore and chat in public rooms. To add friends or send private DMs, create a full account!
              </span>
            </div>

            {/* Display Name Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1E293B]">
                  Temporary Nickname
                </label>
                <button
                  type="button"
                  onClick={handleRandomName}
                  className="inline-flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Randomize
                </button>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Guest_9842 or Alex"
                maxLength={24}
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-2">
                Choose an Avatar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {GUEST_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`h-10 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? "border-[#2563EB] bg-[#EFF6FF] scale-105"
                        : "border-[#E2E8F0] hover:bg-slate-50"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeAuthModal}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                Continue as Guest
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: LOG IN */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit} className="px-6 pb-6 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                placeholder="e.g. alex@example.com"
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1E293B]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-[11px] text-[#2563EB] hover:underline cursor-pointer"
                >
                  Fill Demo
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTab("guest")}
                className="text-xs text-[#2563EB] font-semibold hover:underline cursor-pointer"
              >
                Or join as guest →
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? "Signing in..." : "Sign In"}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: REGISTER */}
        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="px-6 pb-6 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="alex_99"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTab("login")}
                className="text-xs text-[#2563EB] font-semibold hover:underline cursor-pointer"
              >
                Already registered?
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? "Creating..." : "Sign Up"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
