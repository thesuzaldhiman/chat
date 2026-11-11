# ChatVerse — Requirements

## Summary
ChatVerse is a modern, frictionless social chatting platform combining themed 3-column chat lounges (Love, Friendship, Late Night, Music, Gaming), instant spontaneous 1-on-1 text/voice/video matching, and a persistent social graph with direct private messaging and call infrastructure. It eliminates invasive sign-up barriers through automatic guest persistence while offering rich member accounts.

## Problem framing
### Problem statement
Social web users need an immediate, welcoming, and frictionless space to connect with themed communities and interesting strangers across text, voice, and video, without mandatory sign-up walls or overwhelming clutter.

### Primary user snapshot
- **Persona:** The Connected Seeker (students, young professionals, late-night conversationalists).
- **Context of use:** Mobile on the couch or commuting; desktop during work breaks or late-night gaming sessions.
- **Jobs to be done:** Find an engaging conversation right now, meet someone new without pressure, stay in touch with genuine connections.
- **Pain points:** Forced registration forms before seeing if an app is good, dead chat rooms, toxic unmoderated trolls, laggy WebRTC video.

### Key scenarios
1. **Instant Late-Night Chill:** User lands on ChatVerse late at night on mobile, joins "Late Night Talks" in 1 click as `Guest_8392`, sends messages immediately.
2. **Spontaneous Video Chemistry:** User tests camera in preview lobby, hits "Start Video Matching", connects to a friendly peer in < 2s, exchanges laughter and adds them as a friend.
3. **Friend Reconnection:** User sees online green indicator for their friend Riya, clicks "Voice Call" directly from Direct Messages, and chats for 20 minutes in HD audio.

### How might we
- HMW make room entry and random pairing feel completely instantaneous from the very first second?
- HMW deliver a warm, inviting 3-column chat lounge on desktop that feels cozy and respectful?
- HMW make mobile navigation (drawers, rosters, in-call chat) feel buttery smooth with one thumb?

## Problem
Modern social platforms either force long registration funnels or devolve into toxic, unstructured anonymous matching. Users lack a middle ground that provides frictionless entry with structured community warmth and safe friendship building.

## Goals and success metrics
- **Instant Time to Conversation:** < 5 seconds from landing to sending first message.
- **Matching Speed:** < 2s to find an active stranger in random text/voice/video.
- **Conversion to Registered Member:** Natural conversion when users want permanent usernames or to keep friends.
- **Uptime & Latency:** 99.8% uptime, WebRTC roundtrip latency < 60ms.

## Users
### Primary user
- Active social chatters looking for lively discussions or spontaneous 1-on-1 connections.
### Secondary users
- Room moderators maintaining positive community vibes.
### Roles and permissions
- **Guest:** Instant auto-assigned nickname; full access to public rooms and random matching; cannot send persistent friend requests.
- **Member:** Permanent username, custom avatar, bio, friends list, private DMs, 1-on-1 audio/video calls.
- **Moderator:** Can pin messages, kick/mute abusive users, manage room topic tags.
- **Admin:** Full platform management.

## Core jobs (ranked)
1. **Join & Chat in Themed Rooms:** 100vh real-time multi-user chat with online roster, emojis, and media.
2. **Spontaneous Random Match:** Instant 1-on-1 matching across text, crystal-clear voice, and 1080p WebRTC video.
3. **Friendships & Direct Messaging:** Add friends from rooms or matches, send private messages, and view profiles.
4. **1-on-1 Calling:** Voice and video calling between friends with in-call controls.

## Scope
### Must have
- Responsive persistent app shell (left rail on desktop, bottom bar on mobile).
- 3-column chat room view with quick-switch rail, main stream, and online member roster.
- Real camera preview lobby and live video call screen with PIP, reactions, and chat drawer.
- Automatic guest cookie persistence (zero blocking login walls).
- Private messaging with read status, unread counts, and active call triggers.
### Should have
- Animated emoji reaction bubbles.
- Live audio meter in lobby.
- Device settings modal (mic/cam selection).
### Won't have (this version)
- Paid subscription paywalls.
- Screen recording cloud storage.

## Brand and tone
- **Personality:** Warm, welcoming, modern, human, safe, clean.
- **Must never feel:** Like a generic AI template, dark/grungy sketchy chat site, or cluttered corporate tool.
- **References:** Bumble / Discord warmth, Linear-grade responsiveness, Telegram-clean messaging.
- **Color tokens:** Royal Azure `#2563EB`, Light Ice Blue `#EFF6FF`, Slate-50 background `#F8FAFC`, Emerald `#10B981`.

## Lifecycle
- **Day 1:** Instant auto-guest, quick room exploration.
- **Day 7:** Registered profile, 5+ accepted friends, active in 2-3 favorite rooms.
- **Day 30+:** Regular voice/video calls with friends, potential community moderator.

## Edge cases and states
- **Empty state:** Friendly illustrations with 1-click action buttons ("Discover People", "Join Room").
- **Call failure:** Reconnect toast with graceful fallback to text chat.
- **Mobile keyboard popup:** Chat input sticks above viewport without layout jumping.

## Decision log
| Decision | Options considered | Chosen | Why |
|---|---|---|---|
| Platform Archetype | Community Hub vs Spontaneous Matcher vs Hybrid | Fast Social & Community Hybrid | Gives both persistent rooms and instant matching |
| Navigation Architecture | Top Navbar vs Persistent App Shell | Persistent App Shell | 1-click switching between Rooms, DMs, Friends, Video |
| Visual Personality | Minimalist Monochrome vs Warm Social Friendly vs Dark Media Hub | Warm Social Friendly (Bumble/Discord style) | Friendly, inviting, approachable, high social engagement |
| Mobile Multi-pane UX | Tab screens vs Slide-over Drawers | Drawer / Sheet Overlay | Keeps user immersed in live chat while inspecting members/media |
| Guest Onboarding | Forced Login Modal vs Auto-Guest | Instant Auto-Guest | Zero-friction entry, maximum conversion |
