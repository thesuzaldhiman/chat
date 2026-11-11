"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Any individual chat room (/rooms/[roomSlug]) occupies full 100vh with NO footer and NO vertical scrolling!
  const isChatRoom = pathname.startsWith("/rooms/") && pathname !== "/rooms";

  if (isChatRoom) {
    return <div className="h-screen h-[100dvh] w-full overflow-hidden flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
