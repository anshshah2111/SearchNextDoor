/**
 * Pre-scripted Echo responses for when no Anthropic API key is available.
 * These capture Echo's personality and provide a working demo experience.
 */

type Intent = "opener" | "discovery" | "checkin" | "closer" | "freeform";

const OPENERS = [
  "Hey. Glad you're out here. What's the one thing you're trying to get away from today?",
  "Hey. Ready? Where are we headed today?",
  "Oh hey. Good timing. I was just sitting here. What are we walking off?",
  "Hey there. The air's nice right now. Where should we go?",
];

const DISCOVERIES = [
  "Oh — new street for us. What's down here?",
  "Huh. Never been this way before. What made you turn?",
  "This is new. I like it when we go somewhere different.",
  "Oh — we haven't been down here. Interesting.",
];

const CHECKINS = [
  "What's the best thing you ate today?",
  "What's playing in your head right now?",
  "You listening to anything good lately?",
  "What's something you saw today that stuck with you?",
  "If you could be anywhere else right now, where?",
  "What's the last thing that made you laugh?",
];

const CLOSERS = [
  "Good walk. Same time tomorrow?",
  "Glad we did that. See you next time.",
  "That was nice. Let's do it again soon.",
  "Good one. The city's a little more yours now.",
];

const FREEFORM = [
  "Mm. Yeah, I get that.",
  "That's interesting. Tell me more.",
  "Huh. I hadn't thought of it that way.",
  "Yeah. Makes sense.",
  "Mm. What else?",
  "I like that.",
  "Right. And then what?",
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getEchoFallback(intent: Intent): string {
  switch (intent) {
    case "opener":
      return pickRandom(OPENERS);
    case "discovery":
      return pickRandom(DISCOVERIES);
    case "checkin":
      return pickRandom(CHECKINS);
    case "closer":
      return pickRandom(CLOSERS);
    case "freeform":
      return pickRandom(FREEFORM);
    default:
      return pickRandom(FREEFORM);
  }
}
