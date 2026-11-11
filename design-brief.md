# ChatVerse — Design Brief (UI Handoff)

## Product Summary
ChatVerse is a modern, light-themed social platform designed for effortless human connection. It bridges themed community chat lounges (100vh 3-column rooms for love, friendship, music, and late-night talks) with instant 1-on-1 random WebRTC text, voice, and video matching, tied together by a persistent social graph with encrypted direct messaging and integrated 1-on-1 calling.

### Problem Statement
Social internet users need an immediate, welcoming, and frictionless space to connect with themed communities and interesting strangers across text, voice, and video, without mandatory sign-up walls or overwhelming clutter.

---

## Primary User & Context of Use
- **The Connected Seeker:** Students, creative professionals, and late-night conversationalists seeking authentic discussion or serendipitous encounters.
- **Context:** Mobile one-handed browsing during transit/leisure; desktop wide-screen multitasking during work breaks or late-night gaming.

---

## Chosen Concept & Mental Model
- **Concept:** The Social Lounge (Hybrid Persistent App Shell).
- **Mental Model:** A warm, multi-room digital community house. You move between cozy public discussion lounges and private one-on-one calling booths with zero friction.

---

## Core Flows
1. **Explore & Chat in Lounge:** Land on app ➔ Select "Love Chat" from left rail or hub ➔ 100vh 3-column room opens ➔ Chat, react with floating emojis, inspect online member roster ➔ Tap member ➔ Add as friend.
2. **Instant Video Match:** Open `/random-video` ➔ Hardware check in Camera Lobby ➔ Tap "Start Video Match" ➔ Matched in < 2s ➔ Live call with floating emojis, screen share, and chat drawer ➔ Add friend or skip.
3. **Friend Reconnection & Calling:** Tap "Messages" ➔ Select conversation ➔ Tap "Voice" or "Video" call in header ➔ Live ringing with Web Audio tone ➔ Connected call modal with PIP camera and duration timer.

---

## Navigation & Screen Inventory
- **Global Chrome:**
  - Desktop: Left persistent navigation rail (Icons + Tooltips + Active Badges).
  - Mobile: Fluid bottom navigation bar (5 quick touch points).
- **Hero Screen (Design First):** **Individual Chat Room Studio (`/rooms/[roomSlug]`)**
  - Establishes the 100vh layout, 3-column spatial architecture, warm message bubbles, and mobile slide-over drawers.
- **Key Screens:**
  1. Home Hub (`/`) — Discovery, live pulse indicator, 4 interactive feature cards.
  2. Individual Chat Room (`/rooms/[roomSlug]`) — 3-column 100vh immersive lounge.
  3. Random Video Matching (`/random-video`) — Pre-call lobby, radar ping, live call stage.
  4. Direct Messaging (`/messages`) — 2-column encrypted chat studio with call triggers.
  5. Friends Directory (`/friends`) — Status tabs, friend cards with quick-call shortcuts.
  6. User Profile (`/profile/[username]`) — Public identity dossier, mutual friends, role badges.

---

## Brand & Visual System
- **Visual Personality:** Warm Social Friendly (Bumble / Discord warmth + Linear responsiveness).
- **Must Never Feel:** Sketchy/dark anonymous webcam site, cold enterprise dashboard, or generic AI template.
- **Color Palette:**
  - Primary Accent: Royal Azure `#2563EB`
  - Accent Hover: Deep Blue `#1D4ED8`
  - Accent Tint: Ice Blue `#EFF6FF`
  - Canvas Background: Crisp Slate-50 `#F8FAFC`
  - Card Surfaces: Pure White `#FFFFFF` with subtle `#E2E8F0` borders
  - Live Status: Emerald Green `#10B981` (pulsing indicator)
  - Typography: Inter / Geist sans-serif, bold clear headings, high contrast text `#0F172A`.

---

## Responsive Breakpoints
- **Desktop (>= 1024px):** Spacious 3-column layouts; left persistent rail; right-hand roster.
- **Tablet (768px - 1023px):** 2-column layouts; collapsible sidebars.
- **Mobile (< 768px):** Fluid bottom navigation bar; slide-over drawer sheets for rosters, media, and in-call chat; thumb-accessible primary action buttons.

---

## Scope Guardrails
- **Included (Must Have):** Persistent app shell, 3-column chat room view, camera preview lobby, in-call emoji reactions, video PIP, 1-on-1 voice/video calling modal, auto-guest cookie persistence.
- **Excluded (Won't Have):** Paid paywalls, subscription tiers, cloud video recording.
