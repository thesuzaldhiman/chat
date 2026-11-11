"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";
import { useFriends } from "@/context/FriendContext";
import { useCall } from "@/context/CallContext";
import { NotificationItem } from "@/types";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  UserPlus,
  MessageCircle,
  Sparkles,
  Users,
  X,
  ExternalLink,
  PhoneCall,
} from "lucide-react";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showToast,
  } = useNotifications();

  const { receivedRequests, acceptFriendRequest, declineFriendRequest } = useFriends();
  const { simulateIncomingCall } = useCall();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  if (!isOpen) return null;

  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleAcceptRequest = (notification: NotificationItem) => {
    markAsRead(notification.id);
    const req = receivedRequests.find(
      (r) => r.fromUser.username === notification.data?.username || r.fromUser.name.includes("Riya")
    );
    if (req) {
      acceptFriendRequest(req.id);
    }
    showToast("Friend request accepted! You can now send private messages.", "success");
    deleteNotification(notification.id);
  };

  const handleDeclineRequest = (notification: NotificationItem) => {
    markAsRead(notification.id);
    const req = receivedRequests.find(
      (r) => r.fromUser.username === notification.data?.username
    );
    if (req) {
      declineFriendRequest(req.id);
    }
    deleteNotification(notification.id);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-xs font-bold text-[#0F172A]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#E2E8F0] px-3 bg-white text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`py-2 px-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "all"
              ? "border-[#2563EB] text-[#2563EB] font-bold"
              : "border-transparent text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`py-2 px-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === "unread"
              ? "border-[#2563EB] text-[#2563EB] font-bold"
              : "border-transparent text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F4F8]">
        {displayedNotifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-[#0F172A]">All caught up!</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">No notifications right now.</p>
          </div>
        ) : (
          displayedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 transition-colors relative group hover:bg-[#F8FAFC] ${
                !notif.read ? "bg-[#EFF6FF]/40" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon or Avatar */}
                <div className="relative flex-shrink-0">
                  {notif.avatar ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                      <Image
                        src={notif.avatar}
                        alt="Avatar"
                        width={36}
                        height={36}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  {!notif.read && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-[#0F172A] truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-[#94A3B8] flex-shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.description}
                  </p>

                  {/* Actions depending on type */}
                  {notif.type === "friend_request" && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(notif)}
                        className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeclineRequest(notif)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#475569] text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>

                      {notif.data?.username && (
                        <Link
                          href={`/profile/${notif.data.username}`}
                          onClick={() => {
                            markAsRead(notif.id);
                            onClose();
                          }}
                          className="text-[11px] text-[#2563EB] hover:underline ml-auto"
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  )}

                  {notif.type === "room_invite" && notif.actionUrl && (
                    <div className="mt-2">
                      <Link
                        href={notif.actionUrl}
                        onClick={() => {
                          markAsRead(notif.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFF6FF] hover:bg-[#d8ece7] text-[#2563EB] text-[11px] font-bold transition-colors"
                      >
                        <span>Join Room</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => deleteNotification(notif.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer flex-shrink-0"
                  title="Remove notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer link to Friends requests & Test Incoming Call */}
      <div className="p-2.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-2 px-4">
        <Link
          href="/friends?tab=requests"
          onClick={onClose}
          className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
        >
          <span>Friend Requests</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        <button
          type="button"
          onClick={() => {
            onClose();
            simulateIncomingCall();
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-lg transition-colors cursor-pointer"
          title="Test receiving an incoming video call"
        >
          <PhoneCall className="w-3 h-3" />
          <span>Test Incoming Call</span>
        </button>
      </div>
    </div>
  );
}
