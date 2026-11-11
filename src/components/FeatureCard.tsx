"use client";

import React from "react";
import Link from "next/link";
import { MessagesSquare, Video, Headphones, MessageCircle, ArrowRight } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  iconName: "MessagesSquare" | "Video" | "Headphones" | "MessageCircle";
  ctaText: string;
  href?: string;
  badge?: string;
  isPrimary?: boolean;
  onComingSoonClick?: () => void;
}

export default function FeatureCard({
  title,
  description,
  iconName,
  ctaText,
  href,
  badge,
  isPrimary = false,
  onComingSoonClick,
}: FeatureCardProps) {
  const getIcon = () => {
    switch (iconName) {
      case "MessagesSquare":
        return <MessagesSquare className="w-5 h-5 stroke-[2]" />;
      case "Video":
        return <Video className="w-5 h-5 stroke-[2]" />;
      case "Headphones":
        return <Headphones className="w-5 h-5 stroke-[2]" />;
      case "MessageCircle":
        return <MessageCircle className="w-5 h-5 stroke-[2]" />;
    }
  };

  const CardContent = (
    <div
      className={`h-full flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
        isPrimary
          ? "bg-white border-[#2563EB]/40 shadow-sm hover:border-[#2563EB] hover:shadow-md"
          : "bg-white border-[#E2E8F0] hover:border-[#2563EB]/40 hover:shadow-md"
      }`}
    >
      {/* Top subtle highlight line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-2xs ${
              isPrimary
                ? "bg-[#2563EB] text-white shadow-[#2563EB]/25"
                : "bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white"
            }`}
          >
            {getIcon()}
          </div>
          {badge ? (
            <span className="px-2.5 py-0.5 text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] rounded-full border border-[#2563EB]/15">
              {badge}
            </span>
          ) : isPrimary ? (
            <span className="px-2.5 py-0.5 text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] rounded-full uppercase tracking-wider">
              Featured
            </span>
          ) : null}
        </div>

        <h3 className="text-base font-bold text-[#0F172A] mb-1.5 group-hover:text-[#2563EB] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#64748B] leading-relaxed font-normal">{description}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] group-hover:text-[#1D4ED8] transition-colors">
          <span>{ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full group focus:outline-none">
        {CardContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onComingSoonClick}
      className="block w-full h-full text-left cursor-pointer group focus:outline-none"
    >
      {CardContent}
    </button>
  );
}
