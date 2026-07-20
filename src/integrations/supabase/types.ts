export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          central_idea: string | null
          cover_prompt: string | null
          created_at: string
          id: string
          litle_id: string | null
          litle_signature: string | null
          stats: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          central_idea?: string | null
          cover_prompt?: string | null
          created_at?: string
          id?: string
          litle_id?: string | null
          litle_signature?: string | null
          stats?: Json
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          central_idea?: string | null
          cover_prompt?: string | null
          created_at?: string
          id?: string
          litle_id?: string | null
          litle_signature?: string | null
          stats?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          book_id: string
          centroid: Json | null
          created_at: string
          id: string
          order_idx: number
          synthesized_text: string | null
          title: string
          user_id: string
        }
        Insert: {
          book_id: string
          centroid?: Json | null
          created_at?: string
          id?: string
          order_idx: number
          synthesized_text?: string | null
          title: string
          user_id: string
        }
        Update: {
          book_id?: string
          centroid?: Json | null
          created_at?: string
          id?: string
          order_idx?: number
          synthesized_text?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      chunks: {
        Row: {
          book_id: string
          chapter_id: string | null
          content: string
          content_hash: string
          created_at: string
          embedding: Json | null
          id: string
          order_idx: number
          similarity_score: number | null
          source_id: string
          superseded_by: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id?: string | null
          content: string
          content_hash: string
          created_at?: string
          embedding?: Json | null
          id?: string
          order_idx: number
          similarity_score?: number | null
          source_id: string
          superseded_by?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string | null
          content?: string
          content_hash?: string
          created_at?: string
          embedding?: Json | null
          id?: string
          order_idx?: number
          similarity_score?: number | null
          source_id?: string
          superseded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chunks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chunks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chunks_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "chunks"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_nodes: {
        Row: {
          created_at: string
          hash: string
          id: string
          label: string | null
          node_type: string
          parent_id: string | null
          payload: Json
          record_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hash: string
          id?: string
          label?: string | null
          node_type: string
          parent_id?: string | null
          payload?: Json
          record_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hash?: string
          id?: string
          label?: string | null
          node_type?: string
          parent_id?: string | null
          payload?: Json
          record_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "evidence_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_nodes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "evidence_records"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_records: {
        Row: {
          book_id: string | null
          created_at: string
          crypto_profile: string
          id: string
          is_published: boolean
          litle_id: string
          namespace: string | null
          root_hash: string | null
          updated_at: string
          user_id: string
          work_type: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          crypto_profile?: string
          id?: string
          is_published?: boolean
          litle_id: string
          namespace?: string | null
          root_hash?: string | null
          updated_at?: string
          user_id: string
          work_type?: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          crypto_profile?: string
          id?: string
          is_published?: boolean
          litle_id?: string
          namespace?: string | null
          root_hash?: string | null
          updated_at?: string
          user_id?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_records_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          book_id: string
          char_count: number | null
          created_at: string
          extracted_text: string | null
          filename: string
          id: string
          mime: string | null
          size: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          char_count?: number | null
          created_at?: string
          extracted_text?: string | null
          filename: string
          id?: string
          mime?: string | null
          size?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          char_count?: number | null
          created_at?: string
          extracted_text?: string | null
          filename?: string
          id?: string
          mime?: string | null
          size?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
