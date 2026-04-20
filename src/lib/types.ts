export type QuestionType = "text" | "mcq" | "dropdown" | "phone";

export interface InterviewStep {
  id: string;
  /** One or more bubbles the interviewer sends for this step */
  messages: string[];
  type: QuestionType;
  /** Options for `mcq` and `dropdown` steps */
  options?: string[];
}

export interface ChatMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
}
