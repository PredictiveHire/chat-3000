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

const woolworthsInterview: InterviewStep[] = [
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
    id: "customer-service",
    type: "text",
    messages: [
      "Team Members help customers feel welcome and supported in store.",
      "Tell us about a time you helped a customer or someone in your community. What did they need, and what did you do?",
    ],
    widget: "text-question",
  },
  {
    id: "teamwork",
    type: "text",
    messages: [
      "Working at Woolworths means being part of a busy team.",
      "Describe a time you worked with others to get a task done. What was your role, and how did you support the team?",
    ],
    widget: "text-question",
  },
  {
    id: "reliability",
    type: "text",
    messages: [
      "Reliability is important because the store depends on every team member showing up ready to help.",
      "Tell us about a time you had to be dependable for work, school, sport, volunteering, or family. How did you make sure people could count on you?",
    ],
    widget: "text-question",
  },
  {
    id: "busy-shift",
    type: "text",
    messages: [
      "Stores can get busy, especially during peak shopping times.",
      "Imagine the store is busy, a customer needs help finding an item, and your team is trying to restock shelves. What would you do first, and why?",
    ],
    widget: "text-question",
  },
  {
    id: "safety",
    type: "text",
    messages: [
      "Team Members help keep the store safe, clean, and easy to shop in.",
      "If you noticed a spill in an aisle while you were helping a customer, how would you handle it?",
    ],
    widget: "text-question",
  },
  {
    id: "video-setup",
    type: "video-setup",
    messages: [
      "Thank you for completing this portion of the interview.\n\nNext up, you'll answer 1 video question. Before we begin, here's what to expect:",
    ],
    widget: "video-setup-tips",
  },
  {
    id: "video-q1",
    type: "video",
    messages: [
      "Why would you like to work as a Team Member at Woolworths, and what would you bring to the store team?",
    ],
    widget: "video-question",
  },
  {
    id: "retail-experience",
    type: "mcq",
    messages: [
      "How much experience do you have in retail, hospitality, customer service, volunteering, or other people-facing work?",
    ],
    options: ["No experience yet", "Less than 6 months", "6 months to 2 years", "More than 2 years"],
  },
  {
    id: "weekly-availability",
    type: "mcq",
    messages: [
      "Which best describes your weekly availability for store shifts?",
    ],
    options: ["Weekdays only", "Weekends only", "Weekdays and weekends", "Flexible across most days"],
  },
  {
    id: "shift-preference",
    type: "mcq",
    messages: [
      "Team Member shifts can include mornings, afternoons, evenings, and weekends. Which shift pattern suits you best?",
    ],
    options: ["Morning shifts", "Afternoon shifts", "Evening shifts", "Any shift pattern"],
  },
  {
    id: "work-areas",
    type: "multi-select",
    messages: [
      "Which store areas would you be interested in working in? Select all that apply.",
    ],
    options: ["Customer service", "Registers", "Stocking shelves", "Online orders", "Fresh food"],
  },
];

const qantasInterview: InterviewStep[] = [
  {
    id: "intro",
    type: "next",
    messages: [
      "Thanks for applying to the Cabin Crew role at Qantas — Australia's iconic national carrier! ✈️\n\nQantas connects Australia and the world, operating flights to over 100 destinations across 20 countries. Our cabin crew are the face of the Qantas brand, delivering world-class safety and service at 35,000 feet.\n\nWatch this video to know more about us",
    ],
    textLayout: "heading-first",
    widget: "company-intro-video",
  },
  {
    id: "format",
    type: "next",
    messages: [
      "Today's interview is for a Cabin Crew role at Qantas. We're looking for someone who is warm, safety-focused, and passionate about delivering exceptional customer experiences.\n\nHere is what to expect in this interview:",
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
    id: "service",
    type: "text",
    messages: [
      "Can you tell me about a time you went above and beyond to create a memorable experience for a customer or guest?",
    ],
    widget: "text-question",
  },
  {
    id: "pressure",
    type: "text",
    messages: [
      "How do you stay calm and professional when dealing with a difficult or stressful situation? Walk us through a specific example.",
    ],
    widget: "text-question",
  },
  {
    id: "video-setup",
    type: "video-setup",
    messages: [
      "Next up, you'll answer a video question. Before we begin, here's what to expect:",
    ],
    widget: "video-setup-tips",
  },
  {
    id: "video-q1",
    type: "video",
    messages: [
      "Why do you want to be a Cabin Crew member for Qantas, and what makes you the right fit for this role?",
    ],
    widget: "video-question",
  },
  {
    id: "experience",
    type: "mcq",
    messages: [
      "How much customer-facing work experience do you have?",
    ],
    options: ["No experience", "Less than 1 year", "1–3 years", "3+ years"],
  },
  {
    id: "availability",
    type: "multi-select",
    messages: [
      "Cabin crew work rotating rosters. Which shift types are you available for? Select all that apply.",
    ],
    options: ["Early morning (4am–12pm)", "Daytime (8am–6pm)", "Evening (2pm–10pm)", "Overnight / red-eye", "Weekends", "Public holidays"],
  },
];

const sephoraInterview: InterviewStep[] = [
  {
    id: "intro",
    type: "next",
    messages: [
      "Thanks for applying to the Beauty Advisor role at Sephora — the world's leading beauty retailer! 💄\n\nSephora inspires clients to play, discover, and express their beauty. With over 3,000 stores worldwide, our Beauty Advisors are passionate experts who deliver personalised, inclusive beauty experiences every day.\n\nWatch this video to know more about us",
    ],
    textLayout: "heading-first",
    widget: "company-intro-video",
  },
  {
    id: "format",
    type: "next",
    messages: [
      "Today's interview is for a Beauty Advisor role at Sephora. We're looking for someone who is passionate about beauty, loves connecting with people, and thrives in a fast-paced retail environment.\n\nHere is what to expect in this interview:",
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
    id: "beauty-passion",
    type: "text",
    messages: [
      "Tell us about your passion for beauty — what excites you most about the industry, and how do you keep up with trends and new products?",
    ],
    widget: "text-question",
  },
  {
    id: "client-experience",
    type: "text",
    messages: [
      "Describe a time you helped a customer find exactly what they were looking for, even when they weren't sure themselves. How did you approach it?",
    ],
    widget: "text-question",
  },
  {
    id: "video-setup",
    type: "video-setup",
    messages: [
      "Next up, you'll answer a video question. Before we begin, here's what to expect:",
    ],
    widget: "video-setup-tips",
  },
  {
    id: "video-q1",
    type: "video",
    messages: [
      "Why do you want to be a Beauty Advisor at Sephora, and what would you bring to the client experience?",
    ],
    widget: "video-question",
  },
  {
    id: "experience",
    type: "mcq",
    messages: [
      "How much experience do you have in beauty, retail, or a client-facing role?",
    ],
    options: ["No experience", "Less than 1 year", "1–3 years", "3+ years"],
  },
  {
    id: "availability",
    type: "multi-select",
    messages: [
      "Our stores operate 7 days a week. Which days are you available to work? Select all that apply.",
    ],
    options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
];

export const mockInterview = woolworthsInterview;

export function getMockInterview(brandId: string): InterviewStep[] {
  if (brandId === "qantas") return qantasInterview;
  if (brandId === "sephora") return sephoraInterview;
  return woolworthsInterview;
}
