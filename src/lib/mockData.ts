import type { InterviewStep } from "./types";

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
  "Cape Verde", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Estonia", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Guinea",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania",
  "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Panama", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia",
  "Senegal", "Serbia", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tunisia",
  "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

/** Scripted demo interview: text, multiple choice, then dropdown */
export const mockInterview: InterviewStep[] = [
  {
    id: "intro",
    type: "next",
    messages: [
      "Thanks for applying to the Staff Engineer role at Sapia.ai.\n\nSapia.ai is a ~80-person tech company headquartered in Melbourne, with teams in London and Singapore. We build AI-powered tools that help large employers hire more fairly and at scale — our customers include some of the world's biggest retailers, banks, and telcos.",
    ],
    textLayout: "heading-first",
  },
  {
    id: "format",
    type: "next",
    messages: [
      "Today's interview is for a Senior Engineer role based in Melbourne, Australia. We're looking for someone who can do fullstack coding.\n\nHere is what to expect in this interview:",
    ],
    textLayout: "heading-first",
    widget: "question-format",
  },
  {
    id: "profile",
    type: "profile",
    messages: [
      "Before we get started, let's grab a few quick details.",
    ],
  },
  {
    id: "experience",
    type: "mcq",
    messages: [
      "Nice, that's a great reason to be here.",
      "How many years of professional engineering experience do you have?",
    ],
    options: ["0–1 years", "2–4 years", "5–9 years", "10+ years"],
  },
  {
    id: "ownership",
    type: "text",
    messages: [
      "Got it, thanks for sharing.",
      "One thing we really value at Sapia is a strong sense of ownership — engineers who take an idea all the way from ambiguity to production.",
      "Can you tell me about a time you drove a technical initiative end-to-end? What was the challenge, and how did you approach it?",
    ],
  },
  {
    id: "growth",
    type: "text",
    messages: [
      "That's a really strong example, thanks for walking me through it.",
      "What's an area you're actively trying to level up in right now — technically or otherwise? Even a short phrase works.",
    ],
  },
];
