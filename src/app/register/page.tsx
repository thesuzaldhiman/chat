"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, Eye, EyeOff, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, continueAsGuest } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service to create an account.");
      return;
    }

    setLoading(true);

    try {
      const res = await register({ name, username, email, password });
      if (res.success) {
        router.push("/rooms");
      } else {
        setError(res.error || "Registration failed. Try again.");
      }
    } catch {
      setError("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    continueAsGuest("Guest_" + Math.floor(1000 + Math.random() * 9000), "🦊");
    router.push("/rooms");
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs">
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/images/chatverse-logo.png"
                alt="ChatVerse"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1E293B]">
              ChatVerse
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Join ChatVerse to unlock friendships, private messages &amp; communities
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex_99"
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#1E293B]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E293B] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={6}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-[#64748B] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded accent-[#2563EB] mt-0.5"
              />
              <span>
                I agree to the Community Guidelines and Terms of Service.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Creating account..." : "Sign Up"}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]"></div>
          </div>
          <span className="relative px-3 bg-white text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider">
            Or
          </span>
        </div>

        {/* Guest Access Option */}
        <button
          type="button"
          onClick={handleGuestEntry}
          className="w-full py-2.5 px-4 text-xs font-semibold text-[#1E293B] bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-[#2563EB]" />
          <span>Continue as Guest</span>
        </button>

        {/* Login Link */}
        <p className="text-center text-xs text-[#64748B] mt-5">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
