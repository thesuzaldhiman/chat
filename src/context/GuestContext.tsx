"use client";

import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";

export { AuthProvider, useAuth };

// Backward-compatible hook alias for existing components
export function useGuest() {
  const auth = useAuth();
  return {
    guestUser: auth.user,
    setGuestIdentity: auth.continueAsGuest,
    clearGuestIdentity: auth.logout,
    isModalOpen: auth.isModalOpen,
    openGuestModal: (targetSlug?: string) => auth.openAuthModal("guest", targetSlug),
    closeGuestModal: auth.closeAuthModal,
    targetRoomSlug: auth.targetRoomSlug,
    comingSoonFeature: auth.comingSoonFeature,
    openComingSoon: auth.openComingSoon,
    closeComingSoon: auth.closeComingSoon,
  };
}

export const GuestProvider = AuthProvider;
