export type QuestionType = "text" | "mcq" | "dropdown" | "phone" | "next" | "profile";
export type MessageWidget = "question-format";

export type TextLayout = "heading-first" | "heading-last";

export interface InterviewStep {
  id: string;
  /** One or more bubbles the interviewer sends for this step */
  messages: string[];
  type: QuestionType;
  /** Options for `mcq` and `dropdown` steps */
  options?: string[];
  /** Optional widget rendered below the message */
  widget?: MessageWidget;
  /** Controls which paragraph is rendered large. Default: "heading-last" */
  textLayout?: TextLayout;
}

export interface ChatMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  variant?: "next";
  /** Optional widget rendered below interviewer message */
  widget?: MessageWidget;
  /** Controls which paragraph is rendered large. Default: "heading-last" */
  textLayout?: TextLayout;
}
