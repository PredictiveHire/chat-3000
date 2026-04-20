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
    type: "text",
    messages: [
      "Hey! Thanks for making time today — really appreciate it. 👋",
      "I'm Alex, and I'll be guiding you through this chat interview for the Staff Engineer role at Sapia.ai.",
      "It's pretty relaxed — just a few questions to get to know you better. There are no right or wrong answers, so feel free to be yourself.",
      "To kick things off: in a sentence or two, what drew you to this role specifically?",
    ],
  },
  {
    id: "experience",
    type: "mcq",
    messages: [
      "Nice, that's a great reason to be here.",
      "Let's talk background a little. How many years of professional engineering experience do you have?",
    ],
    options: ["0–1 years", "2–4 years", "5–9 years", "10+ years"],
  },
  {
    id: "work-style",
    type: "dropdown",
    messages: [
      "Got it, thanks for sharing.",
      "Where are you currently based? Pick your country from the list.",
    ],
    options: COUNTRIES,
  },
  {
    id: "ownership",
    type: "text",
    messages: [
      "Perfect.",
      "One thing we really value at Sapia is a strong sense of ownership — engineers who take an idea all the way from ambiguity to production.",
      "Can you tell me about a time you drove a technical initiative end-to-end? What was the challenge, and how did you approach it?",
    ],
  },
  {
    id: "growth",
    type: "text",
    messages: [
      "That's a really strong example, thanks for walking me through it.",
      "Last one: what's an area you're actively trying to level up in right now — technically or otherwise? Even a short phrase works.",
    ],
  },
  {
    id: "contact-number",
    type: "phone",
    messages: [
      "Great answer, thank you.",
      "Before we wrap up, please share your mobile number so our team can contact you for next steps.",
    ],
  },
];
