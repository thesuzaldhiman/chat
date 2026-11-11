export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  bannerGradient?: string;
  isGuest: boolean;
  joinedAt: string;
  bio: string;
  location?: string;
  interests: string[];
  role: "User" | "Moderator" | "Admin";
  isOnline: boolean;
  lastSeen?: string;
  friendsCount: number;
  mutualFriendsCount?: number;
  roomsJoined?: string[];
  website?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  isGuest: boolean;
  joinedAt: string;
  bio?: string;
  location?: string;
  interests?: string[];
  role?: "User" | "Moderator" | "Admin";
  friendsCount?: number;
}

export interface UserIdentity {
  id?: string;
  name: string;
  username?: string;
  email?: string;
  avatar: string;
  isGuest: boolean;
  joinedAt?: number | string;
  bio?: string;
  location?: string;
  interests?: string[];
  friendsCount?: number;
  role?: "User" | "Moderator" | "Admin";
  website?: string;
}

export interface ChatMessage {
  id: string;
  roomSlug: string;
  sender: {
    name: string;
    avatar: string;
    isGuest?: boolean;
    color?: string;
  };
  text: string;
  timestamp: string;
  dateKey?: string;
  isOwn?: boolean;
}

export interface RoomMember {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  isOnline: boolean;
  role?: "Member" | "Moderator";
}

export interface ChatRoom {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  onlineCount: number;
  totalMembers: number;
  isPrivate: boolean;
  featured?: boolean;
  iconName?: string;
  initials: string;
  accentBg: string;
  accentColor: string;
}

export type FriendshipStatus = "none" | "pending_sent" | "pending_received" | "friends" | "blocked";

export interface FriendRequestItem {
  id: string;
  fromUser: UserProfile;
  toUser: UserProfile;
  timestamp: string;
  status: "pending" | "accepted" | "declined";
}

export interface PrivateMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  createdAt: number;
  status: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  participantIds: string[];
  otherUser: UserProfile;
  lastMessage?: PrivateMessage;
  unreadCount: number;
  updatedAt: number;
}

export interface NotificationItem {
  id: string;
  type: "friend_request" | "message" | "room_invite" | "system";
  title: string;
  description: string;
  timestamp: string;
  createdAt: number;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
  data?: {
    username?: string;
    roomSlug?: string;
    requestId?: string;
  };
}

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  duration?: number;
}

