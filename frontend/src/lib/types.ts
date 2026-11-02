// TypeScript interfaces matching backend schemas

export interface Course {
  id: string;
  code: string;
  name: string;
  color: string;
  instructor?: string;
  description?: string;
  created_at?: string;
}

export type SessionStatus = 'queued' | 'transcribing' | 'generating' | 'processing' | 'ready' | 'failed';

export interface Session {
  id: string;
  course_id: string;
  bbb_meeting_id: string;
  title?: string;
  recorded_at: string;
  duration_seconds: number;
  video_url: string;
  audio_url: string;
  status: SessionStatus;
  progress?: number;
  error_message?: string;
  created_at?: string;
}

export interface Note {
  id: string;
  session_id: string;
  markdown_content: string;
  summary: string;
  executive_summary: string;
  created_at?: string;
}

export interface Flashcard {
  id: string;
  session_id?: string;
  front: string;
  back: string;
  difficulty: number; // 1-5
  tags?: string[];
}

export interface QuizQuestion {
  id: string;
  session_id?: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: 'lecture' | 'session' | 'deadline' | 'exam' | string;
  course_id: string;
  session_id?: string;
  description?: string;
  instructor?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  course_id?: string;
  session_id?: string;
  history?: ChatMessage[];
}

export interface IngestRequest {
  bbb_base_url?: string;
  bbb_url?: string;
  meeting_id?: string;
  course_id?: string;
  duration_seconds?: number;
  duration_hours?: number;
  create_new_course?: boolean;
  new_course_code?: string;
  new_course_name?: string;
  new_course_color?: string;
  new_course_instructor?: string;
  ai_provider?: string;
  ai_model?: string;
  api_key?: string;
  force_offline_reference?: boolean;
}

export interface IngestResponse {
  session_id: string;
  status: SessionStatus;
  message: string;
}

export interface SessionStatusResponse {
  id: string;
  status: SessionStatus;
  progress?: number;
  error_message?: string;
}

export interface DashboardStats {
  total_sessions: number;
  flashcards_generated: number;
  quizzes_completed: number;
  courses_count: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
