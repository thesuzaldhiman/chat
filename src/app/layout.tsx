import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { GuestProvider } from "@/context/GuestContext";
import { FriendProvider } from "@/context/FriendContext";
import { MessageProvider } from "@/context/MessageContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { CallProvider } from "@/context/CallContext";
import NavigationWrapper from "@/components/NavigationWrapper";
import AuthAccessModal from "@/components/AuthAccessModal";
import ComingSoonModal from "@/components/ComingSoonModal";
import ToastContainer from "@/components/ToastContainer";
import CallModal from "@/components/CallModal";

export const metadata: Metadata = {
  title: "ChatVerse — Modern Social Chat & Community Rooms",
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-[#F8FAFC] text-[#0F172A] antialiased">
        <GuestProvider>
          <FriendProvider>
            <MessageProvider>
              <NotificationProvider>
                <CallProvider>
                  <NavigationWrapper>{children}</NavigationWrapper>
                  <AuthAccessModal />
                  <ComingSoonModal />
                  <ToastContainer />
                  <CallModal />
                </CallProvider>
              </NotificationProvider>
            </MessageProvider>
          </FriendProvider>
        </GuestProvider>
      </body>
    </html>
  );
}
