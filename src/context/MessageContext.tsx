"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { PrivateMessage, Conversation, UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendContext";
import { INITIAL_COMMUNITY_USERS } from "@/data/mockUsers";

interface MessageContextType {
  conversations: Conversation[];
  totalUnreadCount: number;
  getConversationMessages: (conversationId: string) => PrivateMessage[];
  sendMessage: (receiverUser: UserProfile, text: string) => PrivateMessage | null;
  markConversationAsRead: (conversationId: string) => void;
  getOrCreateConversation: (otherUser: UserProfile) => Conversation;
  deleteConversation: (conversationId: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { friends } = useFriends();

  const currentUserId = user?.id || "usr-demo-1";
  const storageKeyPrefix = `chatverse_msgs_${currentUserId}`;

  const [conversationsMap, setConversationsMap] = useState<Record<string, Conversation>>({});
  const [messagesMap, setMessagesMap] = useState<Record<string, PrivateMessage[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize conversations from localStorage
  useEffect(() => {
    try {
      const storedConvs = localStorage.getItem(`${storageKeyPrefix}_convs`);
      const storedMsgs = localStorage.getItem(`${storageKeyPrefix}_msgs`);

      if (storedConvs && storedMsgs) {
        setConversationsMap(JSON.parse(storedConvs));
        setMessagesMap(JSON.parse(storedMsgs));
      } else {
        setConversationsMap({});
        setMessagesMap({});
      }
    } catch (e) {
      console.warn("Message storage initialization error:", e);
      setConversationsMap({});
      setMessagesMap({});
    } finally {
      setIsLoaded(true);
    }
  }, [currentUserId, storageKeyPrefix]);

  // Real-time multi-tab DM sync with BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("chatverse_dms");

    channel.onmessage = (event) => {
      const data = event.data;
      if (data?.type === "NEW_DM" && data.message) {
        const msg = data.message as PrivateMessage;
        if (msg.receiverId === currentUserId || msg.senderId === currentUserId) {
          const convId = msg.conversationId;
          setMessagesMap((prev) => {
            const list = prev[convId] || [];
            if (list.some((m) => m.id === msg.id)) return prev;
            const updated = { ...prev, [convId]: [...list, msg] };
            try {
              localStorage.setItem(`${storageKeyPrefix}_msgs`, JSON.stringify(updated));
            } catch {}
            return updated;
          });

          setConversationsMap((prev) => {
            const existing = prev[convId];
            if (!existing) return prev;
            const updated = {
              ...prev,
              [convId]: {
                ...existing,
                lastMessage: msg,
                unreadCount: msg.senderId !== currentUserId ? existing.unreadCount + 1 : existing.unreadCount,
                updatedAt: Date.now(),
              },
            };
            try {
              localStorage.setItem(`${storageKeyPrefix}_convs`, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [currentUserId, storageKeyPrefix]);

  // Persist helpers
  const saveState = (
    newConvs: Record<string, Conversation>,
    newMsgs: Record<string, PrivateMessage[]>
  ) => {
    setConversationsMap(newConvs);
    setMessagesMap(newMsgs);
    try {
      localStorage.setItem(`${storageKeyPrefix}_convs`, JSON.stringify(newConvs));
      localStorage.setItem(`${storageKeyPrefix}_msgs`, JSON.stringify(newMsgs));
    } catch {}
  };

  // Sorted conversations list
  const conversations: Conversation[] = useMemo(() => {
    return Object.values(conversationsMap).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversationsMap]);

  // Total unread count
  const totalUnreadCount = useMemo(() => {
    return Object.values(conversationsMap).reduce((acc, c) => acc + c.unreadCount, 0);
  }, [conversationsMap]);

  const getConversationMessages = (conversationId: string): PrivateMessage[] => {
    return messagesMap[conversationId] || [];
  };

  const getOrCreateConversation = (otherUser: UserProfile): Conversation => {
    const convId = `conv-${otherUser.id}`;
    if (conversationsMap[convId]) {
      return conversationsMap[convId];
    }

    const newConv: Conversation = {
      id: convId,
      participantIds: [currentUserId, otherUser.id],
      otherUser,
      unreadCount: 0,
      updatedAt: Date.now(),
    };

    const updatedConvs = { ...conversationsMap, [convId]: newConv };
    const updatedMsgs = { ...messagesMap, [convId]: messagesMap[convId] || [] };
    saveState(updatedConvs, updatedMsgs);
    return newConv;
  };

  const sendMessage = (receiverUser: UserProfile, text: string): PrivateMessage | null => {
    const clean = text.trim();
    if (!clean) return null;

    const conv = getOrCreateConversation(receiverUser);
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: PrivateMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId: conv.id,
      senderId: currentUserId,
      receiverId: receiverUser.id,
      text: clean,
      timestamp: timeString,
      createdAt: Date.now(),
      status: "sent",
    };

    const currentMsgs = messagesMap[conv.id] || [];
    const updatedMsgs = {
      ...messagesMap,
      [conv.id]: [...currentMsgs, newMsg],
    };

    const updatedConvs = {
      ...conversationsMap,
      [conv.id]: {
        ...conv,
        lastMessage: newMsg,
        updatedAt: Date.now(),
      },
    };

    saveState(updatedConvs, updatedMsgs);

    // Also persist for recipient's storage so recipient session can view conversation
    try {
      const recipientPrefix = `chatverse_msgs_${receiverUser.id}`;
      const recConvsRaw = localStorage.getItem(`${recipientPrefix}_convs`);
      const recMsgsRaw = localStorage.getItem(`${recipientPrefix}_msgs`);
      const recConvs: Record<string, Conversation> = recConvsRaw ? JSON.parse(recConvsRaw) : {};
      const recMsgs: Record<string, PrivateMessage[]> = recMsgsRaw ? JSON.parse(recMsgsRaw) : {};

      const senderProfile: UserProfile = {
        id: currentUserId,
        name: user?.name || "Member",
        username: user?.username || "member",
        avatar: user?.avatar || "👤",
        isGuest: user?.isGuest ?? true,
        joinedAt: "Active",
        bio: user?.bio || "",
        interests: user?.interests || [],
        role: user?.role || "User",
        isOnline: true,
        friendsCount: 0,
      };

      const recConvId = `conv-${currentUserId}`;
      const existingRecConv = recConvs[recConvId];
      recConvs[recConvId] = {
        id: recConvId,
        participantIds: [receiverUser.id, currentUserId],
        otherUser: senderProfile,
        lastMessage: newMsg,
        unreadCount: (existingRecConv?.unreadCount || 0) + 1,
        updatedAt: Date.now(),
      };
      recMsgs[recConvId] = [...(recMsgs[recConvId] || []), newMsg];

      localStorage.setItem(`${recipientPrefix}_convs`, JSON.stringify(recConvs));
      localStorage.setItem(`${recipientPrefix}_msgs`, JSON.stringify(recMsgs));
    } catch {}

    // Broadcast in real-time to other tabs
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("chatverse_dms");
        channel.postMessage({ type: "NEW_DM", message: newMsg });
        channel.close();
      }
    } catch {}

    return newMsg;
  };

  const markConversationAsRead = (conversationId: string) => {
    const conv = conversationsMap[conversationId];
    if (!conv || conv.unreadCount === 0) return;

    const updatedConvs = {
      ...conversationsMap,
      [conversationId]: {
        ...conv,
        unreadCount: 0,
      },
    };

    // Mark messages as read
    const currentMsgs = messagesMap[conversationId] || [];
    const updatedThread = currentMsgs.map((m) =>
      m.receiverId === currentUserId ? { ...m, status: "read" as const } : m
    );

    const updatedMsgs = {
      ...messagesMap,
      [conversationId]: updatedThread,
    };

    saveState(updatedConvs, updatedMsgs);
  };

  const deleteConversation = (conversationId: string) => {
    const nextConvs = { ...conversationsMap };
    delete nextConvs[conversationId];

    const nextMsgs = { ...messagesMap };
    delete nextMsgs[conversationId];

    saveState(nextConvs, nextMsgs);
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        totalUnreadCount,
        getConversationMessages,
        sendMessage,
        markConversationAsRead,
        getOrCreateConversation,
        deleteConversation,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
}
