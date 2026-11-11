"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { UserProfile, FriendshipStatus, FriendRequestItem } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { INITIAL_COMMUNITY_USERS } from "@/data/mockUsers";

interface FriendContextType {
  friends: UserProfile[];
  onlineFriends: UserProfile[];
  receivedRequests: FriendRequestItem[];
  sentRequests: FriendRequestItem[];
  blockedUserIds: string[];
  discoverUsers: UserProfile[];
  sendFriendRequest: (targetUser: UserProfile) => { success: boolean; error?: string };
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  cancelFriendRequest: (requestId: string) => void;
  unfriend: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  getFriendshipStatus: (userIdOrUsername: string) => FriendshipStatus;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const { user, getUserProfile, getAllCommunityUsers } = useAuth();

  // Storage key is scoped to current user identity (or global demo)
  const currentKey = user?.id || (user ? `user-${user.name}` : "default_social");

  const [friendIds, setFriendIds] = useState<string[]>(["usr-riya", "usr-demo-2"]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestItem[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestItem[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount or user switch
  useEffect(() => {
    try {
      const storedFriends = localStorage.getItem(`chatverse_friends_${currentKey}`);
      if (storedFriends) {
        setFriendIds(JSON.parse(storedFriends));
      } else {
        // Initial default friends for rich experience: Riya & Sophia Chen
        const defaults = ["usr-riya", "usr-demo-2"];
        setFriendIds(defaults);
        localStorage.setItem(`chatverse_friends_${currentKey}`, JSON.stringify(defaults));
      }

      const storedReceived = localStorage.getItem(`chatverse_req_recv_${currentKey}`);
      if (storedReceived) {
        setReceivedRequests(JSON.parse(storedReceived));
      } else {
        // Initial received request from Aman Verma
        const amanProfile = INITIAL_COMMUNITY_USERS.find((u) => u.username === "aman_786");
        if (amanProfile && user) {
          const initialReq: FriendRequestItem = {
            id: `req-init-aman`,
            fromUser: amanProfile,
            toUser: {
              id: user.id || "me",
              name: user.name,
              username: user.username || "me",
              avatar: user.avatar,
              isGuest: user.isGuest,
              joinedAt: "Recent",
              bio: user.bio || "",
              interests: user.interests || [],
              role: user.role || "User",
              isOnline: true,
              friendsCount: 2,
            },
            timestamp: "10 mins ago",
            status: "pending",
          };
          setReceivedRequests([initialReq]);
          localStorage.setItem(`chatverse_req_recv_${currentKey}`, JSON.stringify([initialReq]));
        }
      }

      const storedSent = localStorage.getItem(`chatverse_req_sent_${currentKey}`);
      if (storedSent) {
        setSentRequests(JSON.parse(storedSent));
      }

      const storedBlocked = localStorage.getItem(`chatverse_blocked_${currentKey}`);
      if (storedBlocked) {
        setBlockedUserIds(JSON.parse(storedBlocked));
      }
    } catch (e) {
      console.warn("Friend storage load error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [currentKey, user]);

  // Sync friends to localStorage
  const persistFriends = (newFriends: string[]) => {
    setFriendIds(newFriends);
    try {
      localStorage.setItem(`chatverse_friends_${currentKey}`, JSON.stringify(newFriends));
    } catch {}
  };

  const persistReceived = (newReceived: FriendRequestItem[]) => {
    setReceivedRequests(newReceived);
    try {
      localStorage.setItem(`chatverse_req_recv_${currentKey}`, JSON.stringify(newReceived));
    } catch {}
  };

  const persistSent = (newSent: FriendRequestItem[]) => {
    setSentRequests(newSent);
    try {
      localStorage.setItem(`chatverse_req_sent_${currentKey}`, JSON.stringify(newSent));
    } catch {}
  };

  const persistBlocked = (newBlocked: string[]) => {
    setBlockedUserIds(newBlocked);
    try {
      localStorage.setItem(`chatverse_blocked_${currentKey}`, JSON.stringify(newBlocked));
    } catch {}
  };

  // Resolve friend IDs to full UserProfile objects
  const allCommunity = useMemo(() => {
    return getAllCommunityUsers();
  }, [getAllCommunityUsers]);

  const friends: UserProfile[] = useMemo(() => {
    return friendIds
      .map((id) => allCommunity.find((u) => u.id === id || u.username === id))
      .filter((u): u is UserProfile => Boolean(u && !blockedUserIds.includes(u.id)));
  }, [friendIds, allCommunity, blockedUserIds]);

  const onlineFriends = useMemo(() => {
    return friends.filter((f) => f.isOnline);
  }, [friends]);

  // Discover users: Community members who are NOT self, NOT already friends, NOT blocked, and have NO pending request
  const discoverUsers = useMemo(() => {
    return allCommunity.filter((u) => {
      if (user && (u.id === user.id || u.username === user.username)) return false;
      if (friendIds.includes(u.id) || friendIds.includes(u.username)) return false;
      if (blockedUserIds.includes(u.id)) return false;
      return true;
    });
  }, [allCommunity, user, friendIds, blockedUserIds]);

  // Actions
  const getFriendshipStatus = (userIdOrUsername: string): FriendshipStatus => {
    const clean = userIdOrUsername.trim().toLowerCase().replace(/^@/, "");

    if (user && (clean === user.id?.toLowerCase() || clean === user.username?.toLowerCase())) {
      return "none";
    }

    if (blockedUserIds.some((b) => b.toLowerCase() === clean)) {
      return "blocked";
    }

    if (friendIds.some((f) => f.toLowerCase() === clean)) {
      return "friends";
    }

    if (sentRequests.some((r) => r.toUser.id.toLowerCase() === clean || r.toUser.username.toLowerCase() === clean)) {
      return "pending_sent";
    }

    if (receivedRequests.some((r) => r.fromUser.id.toLowerCase() === clean || r.fromUser.username.toLowerCase() === clean)) {
      return "pending_received";
    }

    return "none";
  };

  const sendFriendRequest = (targetUser: UserProfile): { success: boolean; error?: string } => {
    if (!user) {
      return { success: false, error: "Please log in to send friend requests." };
    }
    if (user.isGuest) {
      return { success: false, error: "Guest users cannot send friend requests. Create an account to add friends!" };
    }
    if (user.id === targetUser.id || user.username === targetUser.username) {
      return { success: false, error: "You cannot add yourself as a friend." };
    }
    if (friendIds.includes(targetUser.id) || friendIds.includes(targetUser.username)) {
      return { success: false, error: "You are already friends with this user." };
    }
    if (blockedUserIds.includes(targetUser.id)) {
      return { success: false, error: "You have blocked this user." };
    }

    const newRequest: FriendRequestItem = {
      id: `req-${Date.now()}`,
      fromUser: {
        id: user.id || "me",
        name: user.name,
        username: user.username || "me",
        avatar: user.avatar,
        isGuest: false,
        joinedAt: "Recent",
        bio: user.bio || "",
        interests: user.interests || [],
        role: user.role || "User",
        isOnline: true,
        friendsCount: friends.length,
      },
      toUser: targetUser,
      timestamp: "Just now",
      status: "pending",
    };

    const updatedSent = [newRequest, ...sentRequests];
    persistSent(updatedSent);
    return { success: true };
  };

  const acceptFriendRequest = (requestId: string) => {
    const req = receivedRequests.find((r) => r.id === requestId);
    if (!req) return;

    // Add sender to friends
    const updatedFriends = Array.from(new Set([...friendIds, req.fromUser.id]));
    persistFriends(updatedFriends);

    // Remove from received
    const updatedReceived = receivedRequests.filter((r) => r.id !== requestId);
    persistReceived(updatedReceived);
  };

  const declineFriendRequest = (requestId: string) => {
    const updated = receivedRequests.filter((r) => r.id !== requestId);
    persistReceived(updated);
  };

  const cancelFriendRequest = (requestId: string) => {
    const updated = sentRequests.filter((r) => r.id !== requestId);
    persistSent(updated);
  };

  const unfriend = (userId: string) => {
    const updated = friendIds.filter((id) => id !== userId);
    persistFriends(updated);
  };

  const blockUser = (userId: string) => {
    const updatedFriends = friendIds.filter((id) => id !== userId);
    persistFriends(updatedFriends);

    const updatedBlocked = Array.from(new Set([...blockedUserIds, userId]));
    persistBlocked(updatedBlocked);

    // Also remove any pending requests
    persistReceived(receivedRequests.filter((r) => r.fromUser.id !== userId));
    persistSent(sentRequests.filter((r) => r.toUser.id !== userId));
  };

  const unblockUser = (userId: string) => {
    const updated = blockedUserIds.filter((id) => id !== userId);
    persistBlocked(updated);
  };

  return (
    <FriendContext.Provider
      value={{
        friends,
        onlineFriends,
        receivedRequests,
        sentRequests,
        blockedUserIds,
        discoverUsers,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        cancelFriendRequest,
        unfriend,
        blockUser,
        unblockUser,
        getFriendshipStatus,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error("useFriends must be used within a FriendProvider");
  }
  return context;
}
