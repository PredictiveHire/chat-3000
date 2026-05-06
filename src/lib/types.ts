export type QuestionType = "text" | "mcq" | "dropdown" | "phone" | "next" | "profile" | "video-setup" | "video";
export type MessageWidget = "question-format" | "text-question" | "video-question" | "company-intro-video";

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
  /** Metadata passed to the widget */
  widgetMeta?: Record<string, number | string>;
  /** Controls which paragraph is rendered large. Default: "heading-last" */
  textLayout?: TextLayout;
  /** Blob URL of a recorded video response */
  videoUrl?: string;
  /** Step type for special rendering (e.g. "mcq") */
  stepType?: QuestionType;
}
