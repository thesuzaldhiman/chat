# Connect — Modern Social Chat & Community Rooms Platform

A modern, minimal, responsive social chatting web application built with Next.js (App Router), React, TypeScript, Tailwind CSS, and Lucide React icons.

## Features & Core MVP Scope
- **Configurable Brand Name**: Easily configurable in `src/config/site.ts` (currently `Connect`).
- **Strict Premium Palette**:
  - Main Background: `#F8FAFC`
  - Card Background: `#FFFFFF`
  - Primary Text: `#243447`
  - Secondary Text: `#64748B`
  - Primary Accent: `#3D8B83`
  - Accent Light: `#E8F4F1`
  - Border: `#E7ECF0`
  - Online Status: `#22C55E`
- **1. Home Page (`/`)**:
  - Sticky clean navigation header.
  - Minimal hero: *"Meet People. Start Conversations."* with live activity indicator.
  - 4 Discovery Option cards: Chat Rooms (featured), Random Video, Random Voice, Random Chat.
  - Popular Chat Rooms grid with active online counters.
  - Minimal vision & features footer.
- **2. Chat Rooms Listing (`/rooms`)**:
  - Live search by room name or interest.
  - Horizontal category filters: *All Rooms, General, Friendship, Love & Relationships, Entertainment, Music, Gaming, Education, Late Night*.
  - Sort by popularity (online members) or alphabetical.
  - 12 realistic sample rooms with online badges.
  - Clean empty state with filter reset.
- **3. Dynamic Individual Chat Room (`/rooms/[roomSlug]`)**:
  - Clean 3-column desktop layout (Left: Navigation & user profile; Center: Chat feed & composer; Right: Room info & online members).
  - Working message sending, timestamps, sender bubble styles, date separators, and auto-scroll.
  - Real-time emoji popover picker & attachment UI.
  - Searchable room members list.
  - Seamless room switching directly from the sidebar.
  - Mobile responsive: collapsible slide-out drawer navigation and room info drawer.
- **Guest User Experience**:
  - One-click guest entry modal with custom display name and avatar picker.
  - Remembers identity during the session in `localStorage`.
- **Discovery Option Pages**:
  - `/random-chat`, `/random-voice`, `/random-video` with polished Coming Soon states.

## Running Locally
```bash
cd connect-platform
npm run start # or npm run dev
```
Open **[http://localhost:3005](http://localhost:3005)** in your browser or **http://192.168.29.83:3005** on your mobile device on the same Wi-Fi.
