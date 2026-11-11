# ChatVerse — Design System (Warm Social Friendly)

## 1. Color System & Role Tokens

| Token | Hex Value | Role & Usage |
|---|---|---|
| `--color-accent` | `#2563EB` | Primary brand accent, CTA buttons, active tabs, sender bubbles |
| `--color-accent-hover` | `#1D4ED8` | Primary button hover state, interactive focus ring |
| `--color-accent-light` | `#EFF6FF` | Soft background tints, active room indicators, badge fills |
| `--color-bg-canvas` | `#F8FAFC` | Main app background (crisp, warm Slate-50) |
| `--color-bg-surface` | `#FFFFFF` | Card surfaces, modals, chat input containers |
| `--color-border-subtle` | `#E2E8F0` | Default card borders, panel dividers |
| `--color-border-hover` | `rgba(37, 99, 235, 0.35)` | Interactive border state on hover |
| `--color-text-primary` | `#0F172A` | High contrast headings, active message text |
| `--color-text-secondary`| `#64748B` | Subtitles, timestamps, offline status, placeholders |
| `--color-online-pulse` | `#10B981` | Pulsing green active presence, live audio waveform |
| `--color-danger` | `#E11D48` | End call buttons, reject requests, block user actions |

---

## 2. Typography Scale (Plus Jakarta Sans / Inter)

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display / Hero** | `36px - 48px` | `800 (ExtraBold)` | `1.15` | Homepage hero headlines |
| **Heading 1** | `24px - 28px` | `800 (ExtraBold)` | `1.2` | Page titles (Rooms, Messages, Friends) |
| **Heading 2** | `18px - 20px` | `700 (Bold)` | `1.25` | Section titles, active room titles |
| **Heading 3** | `14px - 15px` | `700 (Bold)` | `1.3` | Card headers, username labels |
| **Body (Default)** | `13px - 14px` | `500 (Medium)` | `1.5` | Chat messages, bio descriptions |
| **Caption / Meta** | `11px - 12px` | `600 (SemiBold)` | `1.4` | Timestamps, online count badges, pills |

---

## 3. Radii & Shape Language
- **Cards & Panes:** `rounded-2xl` (16px) or `rounded-3xl` (24px) for hero containers.
- **Buttons & Form Inputs:** `rounded-xl` (12px) for comfortable tactile feel.
- **Status Pills & Chips:** `rounded-full` (9999px).
- **Message Bubbles:** `rounded-2xl` with asymmetric corners (`rounded-tl-xs` for partner, `rounded-tr-xs` for own).

---

## 4. Elevation & Shadows
- **Card Subtle:** `shadow-[0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)]`
- **Elevated Modal / Dock:** `shadow-[0_8px_30px_rgba(0,0,0,0.08)]`
- **Primary Button Glow:** `shadow-sm shadow-[#2563EB]/25`

---

## 5. Component Patterns
- **Floating Reactions Dock:** Horizontal emoji tray with micro-scale hover effects (`hover:scale-125`).
- **Live Presence Avatars:** 36px avatar with bottom-right green dot and optional animated audio bars for active speakers.
- **Call Controls Dock:** Floating dark pill at bottom with high-contrast icon buttons.
