export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string;
};

export type ChatSession = {
  id: string;
  user_id: string;
  title: string | null;
  mode: "investor" | "market" | "mvp";
  created_at: string;
  updated_at?: string;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "model";
  content: string;
  created_at: string;
};

export type ApiUsage = {
  id: string;
  user_id: string;
  endpoint: string;
  tokens_used: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: Omit<ChatSession, "id" | "created_at" | "updated_at">;
        Update: Partial<ChatSession>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, "id" | "created_at">;
        Update: Partial<ChatMessage>;
        Relationships: [];
      };
      api_usage: {
        Row: ApiUsage;
        Insert: Omit<ApiUsage, "id" | "created_at">;
        Update: Partial<ApiUsage>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
