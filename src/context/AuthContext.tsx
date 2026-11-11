"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserIdentity, UserProfile } from "@/types";
import { INITIAL_COMMUNITY_USERS } from "@/data/mockUsers";

interface StoredAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  joinedAt: string;
  bio: string;
  location?: string;
  interests?: string[];
  role: "User" | "Moderator" | "Admin";
  friendsCount: number;
  website?: string;
  bannerGradient?: string;
  roomsJoined?: string[];
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: "usr-demo-1",
    name: "Alex Morgan",
    username: "alex_morgan",
    email: "alex@example.com",
    passwordHash: "password123",
    avatar: "👨‍💻",
    joinedAt: "October 2026",
    bio: "Full-stack developer, coffee lover & open-source enthusiast.",
    location: "New York, USA",
    interests: ["Tech", "Coffee", "Open Source", "Design", "Gaming"],
    role: "User",
    friendsCount: 14,
    website: "https://github.com",
    bannerGradient: "from-teal-600 to-emerald-700",
    roomsJoined: ["general-chat", "late-night-talks", "music-lovers"],
  },
  {
    id: "usr-demo-2",
    name: "Sophia Chen",
    username: "sophia_c",
    email: "sophia@example.com",
    passwordHash: "password123",
    avatar: "👩‍🎨",
    joinedAt: "September 2026",
    bio: "Digital artist, UI/UX designer and anime enthusiast.",
    location: "Vancouver, Canada",
    interests: ["Art", "Cinema", "Design", "Indie Music"],
    role: "User",
    friendsCount: 22,
    website: "https://dribbble.com",
    bannerGradient: "from-sky-600 to-indigo-700",
    roomsJoined: ["general-chat", "movie-discussions"],
  },
];

interface AuthContextType {
  user: UserIdentity | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: (name: string, avatar: string) => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserIdentity>) => Promise<{ success: boolean; error?: string }>;
  getUserProfile: (usernameOrId: string) => UserProfile | null;
  getAllCommunityUsers: () => UserProfile[];
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Modals & Navigation helpers
  isModalOpen: boolean;
  modalMode: "guest" | "login" | "register";
  openAuthModal: (mode?: "guest" | "login" | "register", targetSlug?: string) => void;
  closeAuthModal: () => void;
  targetRoomSlug: string | null;

  comingSoonFeature: string | null;
  openComingSoon: (featureName: string) => void;
  closeComingSoon: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"guest" | "login" | "register">("guest");
  const [targetRoomSlug, setTargetRoomSlug] = useState<string | null>(null);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  // Initialize stored accounts & active session
  useEffect(() => {
    try {
      // 1. Ensure accounts repository exists in localStorage
      const existingAccounts = localStorage.getItem("chatverse_accounts");
      if (!existingAccounts) {
        localStorage.setItem("chatverse_accounts", JSON.stringify(DEFAULT_ACCOUNTS));
      }

      // 2. Check for active session
      const activeSession = localStorage.getItem("chatverse_session");
      if (activeSession) {
        setUser(JSON.parse(activeSession));
        return;
      }

      // 3. Fallback to guest identity if previously set
      const guestStored = localStorage.getItem("connect_guest_user");
      if (guestStored) {
        setUser(JSON.parse(guestStored));
      }
    } catch (e) {
      console.warn("Storage access error:", e);
    }
  }, []);

  const getAccounts = (): StoredAccount[] => {
    try {
      const stored = localStorage.getItem("chatverse_accounts");
      return stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  };

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const accounts = getAccounts();

    const matched = accounts.find(
      (acc) =>
        acc.email.toLowerCase() === cleanId ||
        acc.username.toLowerCase() === cleanId
    );

    if (!matched) {
      return { success: false, error: "No account found with this username or email." };
    }

    if (matched.passwordHash !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const sessionUser: UserIdentity = {
      id: matched.id,
      name: matched.name,
      username: matched.username,
      email: matched.email,
      avatar: matched.avatar,
      isGuest: false,
      joinedAt: matched.joinedAt,
      bio: matched.bio,
      location: matched.location,
      interests: matched.interests || [],
      friendsCount: matched.friendsCount || 0,
      role: matched.role || "User",
      website: matched.website,
    };

    setUser(sessionUser);
    try {
      localStorage.setItem("chatverse_session", JSON.stringify(sessionUser));
      localStorage.removeItem("connect_guest_user");
    } catch {
      // ignore
    }

    return { success: true };
  };

  const register = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanName = data.name.trim();
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const cleanEmail = data.email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return { success: false, error: "Name must be at least 2 characters." };
    }
    if (cleanUsername.length < 3) {
      return { success: false, error: "Username must be at least 3 characters." };
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (data.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const accounts = getAccounts();

    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: "Username is already taken. Try another." };
    }
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newAccount: StoredAccount = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: data.password,
      avatar: "👨‍💻",
      joinedAt: "November 2026",
      bio: "Hello! I just joined ChatVerse to meet new people and explore communities.",
      location: "",
      interests: ["General", "Friendship"],
      role: "User",
      friendsCount: 0,
      website: "",
      bannerGradient: "from-teal-600 to-cyan-700",
      roomsJoined: ["general-chat"],
    };

    accounts.push(newAccount);
    try {
      localStorage.setItem("chatverse_accounts", JSON.stringify(accounts));
    } catch {
      // ignore
    }

    const sessionUser: UserIdentity = {
      id: newAccount.id,
      name: newAccount.name,
      username: newAccount.username,
      email: newAccount.email,
      avatar: newAccount.avatar,
      isGuest: false,
      joinedAt: newAccount.joinedAt,
      bio: newAccount.bio,
      location: newAccount.location,
      interests: newAccount.interests,
      friendsCount: 0,
      role: "User",
      website: newAccount.website,
    };

    setUser(sessionUser);
    try {
      localStorage.setItem("chatverse_session", JSON.stringify(sessionUser));
      localStorage.removeItem("connect_guest_user");
    } catch {
      // ignore
    }

    return { success: true };
  };

  const updateProfile = async (
    updatedData: Partial<UserIdentity>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // If guest, update local guest state
    if (user.isGuest) {
      const updatedGuest: UserIdentity = {
        ...user,
        name: updatedData.name ? updatedData.name.trim() : user.name,
        avatar: updatedData.avatar || user.avatar,
      };
      setUser(updatedGuest);
      try {
        localStorage.setItem("connect_guest_user", JSON.stringify(updatedGuest));
      } catch {
        // ignore
      }
      return { success: true };
    }

    // For registered users, update account in storage
    const accounts = getAccounts();
    const index = accounts.findIndex((a) => a.id === user.id || a.username === user.username);

    if (index === -1) {
      return { success: false, error: "Account record not found" };
    }

    // Check username uniqueness if changed
    if (
      updatedData.username &&
      updatedData.username.toLowerCase() !== user.username?.toLowerCase()
    ) {
      const cleanUsername = updatedData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      const exists = accounts.some(
        (a) => a.username.toLowerCase() === cleanUsername && a.id !== user.id
      );
      if (exists) {
        return { success: false, error: "Username is already taken by another user." };
      }
      accounts[index].username = cleanUsername;
    }

    if (updatedData.name) accounts[index].name = updatedData.name.trim();
    if (updatedData.bio !== undefined) accounts[index].bio = updatedData.bio.trim();
    if (updatedData.location !== undefined) accounts[index].location = updatedData.location.trim();
    if (updatedData.interests) accounts[index].interests = updatedData.interests;
    if (updatedData.avatar) accounts[index].avatar = updatedData.avatar;
    if (updatedData.website !== undefined) accounts[index].website = updatedData.website.trim();

    try {
      localStorage.setItem("chatverse_accounts", JSON.stringify(accounts));
    } catch {
      // ignore
    }

    const updatedSession: UserIdentity = {
      ...user,
      name: accounts[index].name,
      username: accounts[index].username,
      avatar: accounts[index].avatar,
      bio: accounts[index].bio,
      location: accounts[index].location,
      interests: accounts[index].interests || [],
      website: accounts[index].website,
    };

    setUser(updatedSession);
    try {
      localStorage.setItem("chatverse_session", JSON.stringify(updatedSession));
    } catch {
      // ignore
    }

    return { success: true };
  };

  const getUserProfile = (usernameOrId: string): UserProfile | null => {
    const clean = usernameOrId.trim().toLowerCase().replace(/^@/, "");

    // 1. Check in stored accounts (registered users)
    const accounts = getAccounts();
    const foundStored = accounts.find(
      (a) => a.username.toLowerCase() === clean || a.id.toLowerCase() === clean
    );

    if (foundStored) {
      return {
        id: foundStored.id,
        name: foundStored.name,
        username: foundStored.username,
        email: foundStored.email,
        avatar: foundStored.avatar,
        bannerGradient: foundStored.bannerGradient || "from-teal-600 to-emerald-700",
        isGuest: false,
        joinedAt: foundStored.joinedAt || "October 2026",
        bio: foundStored.bio || "ChatVerse community member.",
        location: foundStored.location,
        interests: foundStored.interests || ["Chat", "Communities"],
        role: foundStored.role || "User",
        isOnline: true,
        lastSeen: "Online now",
        friendsCount: foundStored.friendsCount || 0,
        mutualFriendsCount: 3,
        roomsJoined: foundStored.roomsJoined || ["general-chat"],
        website: foundStored.website,
      };
    }

    // 2. Check in community mock users (Riya, Aman, Pooja, Neha, Rocky, etc.)
    const foundMock = INITIAL_COMMUNITY_USERS.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.id.toLowerCase() === clean ||
        u.name.toLowerCase().includes(clean)
    );

    if (foundMock) return foundMock;

    // 3. If guest matches current guest
    if (user?.isGuest && (user.name.toLowerCase() === clean || clean === "guest")) {
      return {
        id: user.id || "guest-active",
        name: user.name,
        username: user.name.toLowerCase().replace(/\s+/g, "_"),
        avatar: user.avatar,
        isGuest: true,
        joinedAt: "Active Session",
        bio: "Temporary Guest user exploring public rooms.",
        interests: ["Chat", "Public Rooms"],
        role: "User",
        isOnline: true,
        friendsCount: 0,
        mutualFriendsCount: 0,
      };
    }

    return null;
  };

  const getAllCommunityUsers = (): UserProfile[] => {
    const accounts = getAccounts();
    const storedProfiles: UserProfile[] = accounts.map((a) => ({
      id: a.id,
      name: a.name,
      username: a.username,
      email: a.email,
      avatar: a.avatar,
      bannerGradient: a.bannerGradient || "from-teal-600 to-emerald-700",
      isGuest: false,
      joinedAt: a.joinedAt,
      bio: a.bio,
      location: a.location,
      interests: a.interests || [],
      role: a.role,
      isOnline: true,
      lastSeen: "Online now",
      friendsCount: a.friendsCount,
      mutualFriendsCount: 2,
      roomsJoined: a.roomsJoined || ["general-chat"],
      website: a.website,
    }));

    // Merge mock users not already in accounts
    const merged = [...storedProfiles];
    for (const mock of INITIAL_COMMUNITY_USERS) {
      if (!merged.some((m) => m.username.toLowerCase() === mock.username.toLowerCase())) {
        merged.push(mock);
      }
    }

    return merged;
  };

  const continueAsGuest = (name: string, avatar: string) => {
    const guestData: UserIdentity = {
      id: `guest-${Date.now()}`,
      name: name.trim() || `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: avatar || "🦊",
      isGuest: true,
      joinedAt: Date.now(),
      friendsCount: 0,
      role: "User",
    };

    setUser(guestData);
    try {
      localStorage.setItem("connect_guest_user", JSON.stringify(guestData));
      localStorage.removeItem("chatverse_session");
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("chatverse_session");
      localStorage.removeItem("connect_guest_user");
    } catch {
      // ignore
    }
  };

  const forgotPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getAccounts();
    const found = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, error: "No account found with this email." };
    }

    // Generate simulated recovery token
    const token = `tok-${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem("chatverse_reset_token", token);
    sessionStorage.setItem("chatverse_reset_email", cleanEmail);

    return {
      success: true,
      message: `Password reset instructions and link generated for ${cleanEmail}.`,
    };
  };

  const resetPassword = async (newPassword: string) => {
    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters." };
    }

    const email = sessionStorage.getItem("chatverse_reset_email");
    if (!email) {
      return { success: false, error: "Invalid or expired reset session. Please request a new link." };
    }

    const accounts = getAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      return { success: false, error: "Account not found." };
    }

    account.passwordHash = newPassword;
    try {
      localStorage.setItem("chatverse_accounts", JSON.stringify(accounts));
      sessionStorage.removeItem("chatverse_reset_token");
      sessionStorage.removeItem("chatverse_reset_email");
    } catch {
      // ignore
    }

    return { success: true };
  };

  const openAuthModal = (mode: "guest" | "login" | "register" = "guest", targetSlug?: string) => {
    setModalMode(mode);
    if (targetSlug) setTargetRoomSlug(targetSlug);
    setIsModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsModalOpen(false);
    setTargetRoomSlug(null);
  };

  const openComingSoon = (featureName: string) => {
    setComingSoonFeature(featureName);
  };

  const closeComingSoon = () => {
    setComingSoonFeature(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !user.isGuest,
        isGuest: !!user && user.isGuest,
        login,
        register,
        continueAsGuest,
        logout,
        updateProfile,
        getUserProfile,
        getAllCommunityUsers,
        forgotPassword,
        resetPassword,
        isModalOpen,
        modalMode,
        openAuthModal,
        closeAuthModal,
        targetRoomSlug,
        comingSoonFeature,
        openComingSoon,
        closeComingSoon,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
