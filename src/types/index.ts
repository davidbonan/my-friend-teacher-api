export interface ChatRequest {
  messages: Message[];
  language: 'english' | 'hebrew';
  personality: PersonalityTraits;
  userId: string;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export interface PersonalityTraits {
  humor: number;
  mockery: number;
  seriousness: number;
  professionalism: number;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface AuthHeaders {
  'x-api-key': string;
  'x-user-id': string;
}