// ─────────────────────────────────────────────────────────────────────────
//  EDIT THIS FILE TO CUSTOMIZE YOUR APPLICATION
//
//  • SERVER_NAME is your community's name, used everywhere on the page.
//  • EXPECTATIONS and REQUIREMENTS fill the "please read" notice at the top.
//  • QUESTIONS is the list people answer. Each needs a unique `name`.
//    `type` is "text" (single line) or "textarea" (paragraph).
//    Set `required: true` to make it mandatory. `inline: true` packs short
//    answers side-by-side in the Discord message. Keep `maxLength` <= 1000.
// ─────────────────────────────────────────────────────────────────────────

export const SERVER_NAME = "/self";

// The two read-only lists shown in the notice at the top of the form.
export const EXPECTATIONS = [
  "Be willing to learn, and stay active in the server",
  "Answer every question honestly, and in complete sentences",
  "No AI-generated, copied, or auto-generated answers",
];

export const REQUIREMENTS = [
  "You must be Level 3 or higher",
  "You must have fewer than 2 warnings",
  "You must be over 14 years old",
  "You must have 2FA enabled on your account",
];

export const QUESTIONS = [
  {
    name: "discordUsername",
    number: "01",
    label: "What's your Discord username?",
    type: "text",
    required: true,
    inline: true,
    maxLength: 40,
    placeholder: "e.g. si_j.e",
  },
  {
    name: "level",
    number: "02",
    label: "What level are you in /self?",
    type: "text",
    required: true,
    inline: true,
    maxLength: 40,
    placeholder: "e.g. Level 12",
  },
  {
    name: "age",
    number: "03",
    label: "How old are you?",
    type: "text",
    required: true,
    inline: true,
    maxLength: 3,
    placeholder: "e.g. 15",
  },
  {
    name: "timezone",
    number: "04",
    label: "What is your timezone?",
    type: "text",
    required: true,
    inline: true,
    maxLength: 40,
    placeholder: "e.g. GMT +8",
  },
  {
    name: "experience",
    number: "05",
    label: "Do you have past or current experience in moderating?",
    type: "textarea",
    required: true,
    maxLength: 1000,
    placeholder: "Tell us about it. If you have not moderated before, just say so.",
  },
  {
    name: "motivation",
    number: "06",
    label: "Why do you want to become a moderator in /self?",
    type: "textarea",
    required: true,
    maxLength: 1000,
    placeholder: "What makes you want to help run this community?",
  },
  {
    name: "scenarioSlurs",
    number: "07",
    label: "If someone started spamming slurs in chat, what would you do?",
    type: "textarea",
    required: true,
    maxLength: 1000,
    placeholder: "Walk us through your steps.",
  },
  {
    name: "contribution",
    number: "08",
    label:
      "If you become a moderator, what would you do? (host events, be active, etc.)",
    type: "textarea",
    required: true,
    maxLength: 1000,
    placeholder: "Tell us what you would bring to the team.",
  },
  {
    name: "tos",
    number: "09",
    label: "Do you uphold all of Discord's Terms of Service?",
    type: "text",
    required: true,
    inline: true,
    maxLength: 60,
    placeholder: "e.g. Yes",
  },
  {
    name: "additional",
    number: "10",
    label: "Anything else you'd like us to know?",
    type: "textarea",
    required: false,
    maxLength: 1000,
    placeholder: "Optional",
  },
];

// Alias kept so the API route can import a single flat list.
export const ALL_FIELDS = QUESTIONS;
