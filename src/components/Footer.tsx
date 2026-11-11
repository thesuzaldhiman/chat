import React from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#E2E8F0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/images/chatverse-logo.png"
                alt="ChatVerse"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="text-base font-bold text-[#0F172A]">
              ChatVerse
            </span>
            <span className="text-xs text-[#64748B] pl-2 border-l border-[#E2E8F0]">
              Modern Social Chat Platform
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#64748B]">
            <Link href="/" className="hover:text-[#2563EB] transition-colors">
              Home
            </Link>
            <Link href="/rooms" className="hover:text-[#2563EB] transition-colors">
              Explore Rooms
            </Link>
            <Link href="/friends" className="hover:text-[#2563EB] transition-colors">
              People &amp; Friends
            </Link>
            <Link href="/random-chat" className="hover:text-[#2563EB] transition-colors">
              Random Chat
            </Link>
            <span className="cursor-pointer hover:text-[#2563EB] transition-colors">
              Privacy Policy
            </span>
            <span className="cursor-pointer hover:text-[#2563EB] transition-colors">
              Terms of Service
            </span>
            <span className="cursor-pointer hover:text-[#2563EB] transition-colors">
              Contact
            </span>
          </div>

          {/* Copyright */}
          <div className="text-xs text-[#94A3B8] font-medium">
            © {new Date().getFullYear()} ChatVerse. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
