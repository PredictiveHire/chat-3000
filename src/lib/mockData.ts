import type { InterviewStep } from "./types";

export const CANDIDATE_NAME = "Sarah";

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
      "Thanks for applying to the Team Member role at Woolworths Group, Australia's #1 trusted retail brand! 🍏\n\nWoolworths Group is one of Australia's largest retailers, serving millions of customers every week across our supermarkets, metro stores, and online. Our team members are the heart of everything we do.\n\nWatch this video to know more about us",
    ],
    textLayout: "heading-first",
    widget: "company-intro-video",
  },
  {
    id: "format",
    type: "next",
    messages: [
      "Today's interview is for a Team Member role at Woolworths. We're looking for someone who is friendly, reliable, and passionate about great customer service.\n\nHere is what to expect in this interview:",
    ],
    textLayout: "heading-first",
    widget: "question-format",
  },
  {
    id: "resume-link",
    type: "next",
    messages: [
      "You can pause and come back to this interview at anytime using this web link. It will also be sent to your email inbox.",
    ],
    widget: "resume-link",
  },
  {
    id: "profile",
    type: "profile",
    messages: [
      "Let's grab a few quick details.",
    ],
  },
  {
    id: "ownership",
    type: "text",
    messages: [
      "One thing we really value at Sapia is a strong sense of ownership — engineers who take an idea all the way from ambiguity to production.",
      "Can you tell me about a time you drove a technical initiative end-to-end? What was the challenge, and how did you approach it?",
    ],
    widget: "text-question",
  },
  {
    id: "growth",
    type: "text",
    messages: [
      "That's a really strong example, thanks for walking me through it.",
      "What's an area you're actively trying to level up in right now — technically or otherwise? Even a short phrase works.",
    ],
    widget: "text-question",
  },
  {
    id: "video-setup",
    type: "video-setup",
    messages: [
      "Thank you for completing this portion of the interview.\n\nNext up, you'll answer 2 video questions. Before we begin, here's what to expect:",
    ],
    widget: "video-setup-tips",
  },
  {
    id: "video-q1",
    type: "video",
    messages: [
      "You're all set! Here's your first video question.",
      "Tell us about a project you're most proud of and what made it successful.",
    ],
    widget: "video-question",
  },
  {
    id: "experience",
    type: "mcq",
    messages: [
      "Almost done! Just one last quick question.",
      "How many years of professional engineering experience do you have?",
    ],
    options: ["0–1 years", "2–4 years", "5–9 years", "10+ years"],
  },
];
