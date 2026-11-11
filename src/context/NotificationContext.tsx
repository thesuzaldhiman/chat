"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { NotificationItem, ToastMessage } from "@/types";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: ToastMessage[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (item: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  showToast: (message: string, type?: "success" | "info" | "warning" | "error", title?: string) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "friend_request",
    title: "Friend Request",
    description: "Riya ♡ sent you a friend request",
    timestamp: "5m ago",
    createdAt: Date.now() - 5 * 60 * 1000,
    read: false,
    avatar: "/images/avatar-riya.png",
    actionUrl: "/friends?tab=requests",
    data: { username: "riya" },
  },
  {
    id: "notif-2",
    type: "room_invite",
    title: "Trending Room",
    description: "Love Chat ❤️ is buzzing with over 1,200 online members right now!",
    timestamp: "25m ago",
    createdAt: Date.now() - 25 * 60 * 1000,
    read: true,
    avatar: "/images/thumb-love-sm.png",
    actionUrl: "/rooms/love-chat",
    data: { roomSlug: "love-chat" },
  },
  {
    id: "notif-3",
    type: "system",
    title: "Welcome to ChatVerse!",
    description: "Your session is live. Explore public rooms or start an instant random voice chat.",
    timestamp: "1h ago",
    createdAt: Date.now() - 60 * 60 * 1000,
    read: true,
    actionUrl: "/rooms",
  },
];

const STORAGE_KEY = "chatverse_notifications";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(SEED_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      }
    } catch {
      setNotifications(SEED_NOTIFICATIONS);
    }
    setIsLoaded(true);
  }, []);

  // Save changes to localStorage
  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // LocalStorage quota fallback
    }
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const addNotification = useCallback((item: Omit<NotificationItem, "id" | "createdAt" | "read">) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Toast dispatch
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "info" | "warning" | "error" = "info", title?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, message, type, title, duration: 4000 };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        dismissToast(id);
      }, 4000);
    },
    [dismissToast]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
