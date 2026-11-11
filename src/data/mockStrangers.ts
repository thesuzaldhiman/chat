export interface StrangerPartner {
  id: string;
  name: string;
  avatar: string;
  location: string;
  interests: string[];
  initialGreeting: string;
  conversationReplies: Record<string, string>;
  defaultReplies: string[];
}

export const STRANGER_PARTNERS: StrangerPartner[] = [
  {
    id: "stranger-102",
    name: "Stranger #4829",
    avatar: "🦊",
    location: "Seattle, USA",
    interests: ["Tech & Coding", "Music & Playlists", "Gaming"],
    initialGreeting: "Hey! What kind of music or games are you into lately?",
    conversationReplies: {
      game: "Nice! I've been playing a lot of RPGs and indie co-op games lately.",
      movie: "Have you seen any good sci-fi movies recently? Looking for recommendations!",
      hi: "Hey there! Nice to get matched with someone friendly.",
      hello: "Hello! How has your day been going?",
      music: "I'm listening to a lot of synthwave and indie rock right now.",
    },
    defaultReplies: [
      "That's really interesting! Tell me more about that.",
      "Haha I totally agree with you on that one.",
      "Honestly, that sounds like a great way to spend the weekend.",
      "Never thought about it from that perspective, pretty cool!",
    ],
  },
  {
    id: "stranger-205",
    name: "Stranger #7193",
    avatar: "🐼",
    location: "London, UK",
    interests: ["Movies & Cinema", "Philosophy & Late Night", "Casual Banter"],
    initialGreeting: "Hi! Late night here, just looking for some casual thoughts and movie banter.",
    conversationReplies: {
      movie: "Cinema is my favorite topic! What is your all-time comfort film?",
      hi: "Hey! How is the weather where you're at right now?",
      coffee: "Coffee is basically running through my veins right now ☕",
      book: "Currently reading some mystery novels, what about you?",
    },
    defaultReplies: [
      "Oh 100%! That is such an underrated take.",
      "That's so true. I was just thinking about that earlier today.",
      "Haha sounds awesome! What else are you working on?",
      "Good point. Random chats are so refreshing when you meet cool people.",
    ],
  },
  {
    id: "stranger-341",
    name: "Stranger #2041",
    avatar: "🐨",
    location: "Melbourne, Australia",
    interests: ["Love & Relationships", "Language Practice", "Casual Banter"],
    initialGreeting: "G'day! Hope you're having an awesome day wherever you are!",
    conversationReplies: {
      hi: "Hello hello! Whereabouts in the world are you connecting from?",
      travel: "I love solo traveling! Packing a backpack and seeing new cities is unmatched.",
      food: "Don't get me started on food haha, I could talk about tacos and ramen all day.",
    },
    defaultReplies: [
      "Awesome! Always nice to connect with people with great energy.",
      "Definitely! How long have you been on ChatVerse?",
      "That sounds wonderful. You seem like a really chill person!",
    ],
  },
];

export const MATCHING_TOPICS = [
  { id: "all", label: "Any Topic (Fastest)", icon: "✨" },
  { id: "movies", label: "Movies & Cinema", icon: "🍿" },
  { id: "music", label: "Music & Playlists", icon: "🎧" },
  { id: "tech", label: "Tech & Coding", icon: "💻" },
  { id: "gaming", label: "Gaming Zone", icon: "🎮" },
  { id: "late-night", label: "Late Night Talks", icon: "🌙" },
  { id: "friendship", label: "Casual Friendship", icon: "☕" },
];
