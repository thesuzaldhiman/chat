export const siteConfig = {
  name: "ChatVerse",
  tagline: "Meet People. Start Conversations.",
  description:
    "Find your community, join interesting conversations, and connect with people from everywhere.",
  links: {
    home: "/",
    rooms: "/rooms",
    randomChat: "/random-chat",
    randomVoice: "/random-voice",
    randomVideo: "/random-video",
  },
  categories: [
    "All Rooms",
    "General",
    "Friendship",
    "Love & Relationships",
    "Entertainment",
    "Music",
    "Gaming",
    "Education",
    "Late Night",
  ] as const,
};

export type CategoryType = (typeof siteConfig.categories)[number];
