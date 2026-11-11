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

  // Initialize and seed conversations
  useEffect(() => {
    try {
      const storedConvs = localStorage.getItem(`${storageKeyPrefix}_convs`);
      const storedMsgs = localStorage.getItem(`${storageKeyPrefix}_msgs`);

      if (storedConvs && storedMsgs) {
        setConversationsMap(JSON.parse(storedConvs));
        setMessagesMap(JSON.parse(storedMsgs));
      } else {
        // Seed initial conversations with Riya and Sophia
        const riya = INITIAL_COMMUNITY_USERS.find((u) => u.username === "riya");
        const sophia = INITIAL_COMMUNITY_USERS.find((u) => u.username === "sophia_c");

        const initialConvs: Record<string, Conversation> = {};
        const initialMsgs: Record<string, PrivateMessage[]> = {};

        if (riya) {
          const convRiyaId = `conv-${riya.id}`;
          const riyaMessages: PrivateMessage[] = [
            {
              id: "msg-init-1",
              conversationId: convRiyaId,
              senderId: riya.id,
              receiverId: currentUserId,
              text: "Hey! Loved your thoughts in Love Chat earlier today 👋",
              timestamp: "10:32 AM",
              createdAt: Date.now() - 3600000,
              status: "read",
            },
            {
              id: "msg-init-2",
              conversationId: convRiyaId,
              senderId: currentUserId,
              receiverId: riya.id,
              text: "Thanks Riya! The community vibes are genuinely awesome here.",
              timestamp: "10:35 AM",
              createdAt: Date.now() - 3000000,
              status: "read",
            },
            {
              id: "msg-init-3",
              conversationId: convRiyaId,
              senderId: riya.id,
              receiverId: currentUserId,
              text: "Are you planning to join the Late Night Talks room tonight? We are discussing favorite books and lo-fi tracks! ☕",
              timestamp: "10:45 AM",
              createdAt: Date.now() - 1800000,
              status: "delivered",
            },
          ];

          initialConvs[convRiyaId] = {
            id: convRiyaId,
            participantIds: [currentUserId, riya.id],
            otherUser: riya,
            lastMessage: riyaMessages[riyaMessages.length - 1],
            unreadCount: 1,
            updatedAt: Date.now() - 1800000,
          };
          initialMsgs[convRiyaId] = riyaMessages;
        }

        if (sophia) {
          const convSophiaId = `conv-${sophia.id}`;
          const sophiaMessages: PrivateMessage[] = [
            {
              id: "msg-init-4",
              conversationId: convSophiaId,
              senderId: sophia.id,
              receiverId: currentUserId,
              text: "Hey, check out the new design palette for the chat rooms! Thoughts? 🎨",
              timestamp: "Yesterday",
              createdAt: Date.now() - 86400000,
              status: "read",
            },
            {
              id: "msg-init-5",
              conversationId: convSophiaId,
              senderId: currentUserId,
              receiverId: sophia.id,
              text: "The royal azure theme looks very premium and modern.",
              timestamp: "Yesterday",
              createdAt: Date.now() - 80000000,
              status: "read",
            },
          ];

          initialConvs[convSophiaId] = {
            id: convSophiaId,
            participantIds: [currentUserId, sophia.id],
            otherUser: sophia,
            lastMessage: sophiaMessages[sophiaMessages.length - 1],
            unreadCount: 0,
            updatedAt: Date.now() - 80000000,
          };
          initialMsgs[convSophiaId] = sophiaMessages;
        }

        setConversationsMap(initialConvs);
        setMessagesMap(initialMsgs);
        localStorage.setItem(`${storageKeyPrefix}_convs`, JSON.stringify(initialConvs));
        localStorage.setItem(`${storageKeyPrefix}_msgs`, JSON.stringify(initialMsgs));
      }
    } catch (e) {
      console.warn("Message storage initialization error:", e);
    } finally {
      setIsLoaded(true);
    }
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

    // Simulate smart interactive auto-reply after 2.5 seconds if sending to Riya
    if (receiverUser.username === "riya") {
      setTimeout(() => {
        const replyText =
          clean.toLowerCase().includes("movie") || clean.toLowerCase().includes("show")
            ? "Have you watched 'Zindagi Na Milegi Dobara'? My absolute all-time favorite! 🍿"
            : clean.toLowerCase().includes("hi") || clean.toLowerCase().includes("hey")
            ? "Hey again! Hope your evening is going wonderfully! 😊"
            : "That's so true! Looking forward to chatting more in the rooms soon.";

        const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const replyMsg: PrivateMessage = {
          id: `msg-reply-${Date.now()}`,
          conversationId: conv.id,
          senderId: receiverUser.id,
          receiverId: currentUserId,
          text: replyText,
          timestamp: replyTime,
          createdAt: Date.now(),
          status: "delivered",
        };

        setMessagesMap((prevMsgs) => {
          const list = prevMsgs[conv.id] || [];
          const next = { ...prevMsgs, [conv.id]: [...list, replyMsg] };
          try {
            localStorage.setItem(`${storageKeyPrefix}_msgs`, JSON.stringify(next));
          } catch {}
          return next;
        });

        setConversationsMap((prevConvs) => {
          const c = prevConvs[conv.id] || conv;
          const next = {
            ...prevConvs,
            [conv.id]: {
              ...c,
              lastMessage: replyMsg,
              unreadCount: c.unreadCount + 1,
              updatedAt: Date.now(),
            },
          };
          try {
            localStorage.setItem(`${storageKeyPrefix}_convs`, JSON.stringify(next));
          } catch {}
          return next;
        });
      }, 2500);
    }

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
