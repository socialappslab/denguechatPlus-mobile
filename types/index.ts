// <Questionnaire types>
export type TypeField = "text" | "multiple" | "list" | "splash";

export interface Questionnaire {
  name: number;
  createdAt: Date;
  initialQuestion: number;
  finalQuestion: number;
  questions: Question[];
}

export interface Question {
  id: number;
  question: string;
  typeField: TypeField;
  options?: Option[];
  description?: string;
  next?: number;
  image?: Image;
}

export interface Option {
  id: number;
  name: string;
  required?: boolean;
  textArea?: boolean;
  next?: number;
  image?: Image;
}

export interface Image {
  id: number;
  url: string;
}

// </Questionnaire types>
