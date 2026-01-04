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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
          prefix: string
          revoked_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id: string
          key_hash: string
          last_used_at?: string | null
          name: string
          prefix: string
          revoked_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
          prefix?: string
          revoked_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          content: Json
          created_at: string
          id: string
          kind: string
          position: number
          slide_id: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id: string
          kind: string
          position: number
          slide_id: string
          updated_at: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          kind?: string
          position?: number
          slide_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_slide_id_fkey"
            columns: ["slide_id"]
            isOneToOne: false
            referencedRelation: "slides"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          created_at: string
          id: string
          is_sample: boolean
          language: string
          logo_url: string | null
          outline: Json | null
          primary_color: string | null
          secondary_color: string | null
          share_access: string
          share_token: string | null
          theme_id: string
          title: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id: string
          is_sample?: boolean
          language?: string
          logo_url?: string | null
          outline?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          share_access?: string
          share_token?: string | null
          theme_id?: string
          title: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_sample?: boolean
          language?: string
          logo_url?: string | null
          outline?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          share_access?: string
          share_token?: string | null
          theme_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          deck_id: string
          error_code: string | null
          error_message: string | null
          expires_at: string | null
          file_url: string | null
          format: string
          generation_job_id: string | null
          id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deck_id: string
          error_code?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_url?: string | null
          format: string
          generation_job_id?: string | null
          id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deck_id?: string
          error_code?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_url?: string | null
          format?: string
          generation_job_id?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_jobs_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_jobs: {
        Row: {
          amount: string
          audience: string | null
          completed_at: string | null
          created_at: string
          deck_id: string | null
          error_code: string | null
          error_message: string | null
          export_as: string[] | null
          export_expires_at: string | null
          id: string
          idempotency_key: string | null
          image_mode: string
          image_style: string | null
          input_text: string
          language: string
          num_slides: number | null
          pdf_url: string | null
          pptx_url: string | null
          progress: number
          source_file_id: string | null
          started_at: string | null
          status: string
          template_id: string | null
          text_mode: string
          theme_id: string | null
          tone: string | null
          view_url: string | null
          workspace_id: string
        }
        Insert: {
          amount?: string
          audience?: string | null
          completed_at?: string | null
          created_at?: string
          deck_id?: string | null
          error_code?: string | null
          error_message?: string | null
          export_as?: string[] | null
          export_expires_at?: string | null
          id: string
          idempotency_key?: string | null
          image_mode?: string
          image_style?: string | null
          input_text: string
          language?: string
          num_slides?: number | null
          pdf_url?: string | null
          pptx_url?: string | null
          progress?: number
          source_file_id?: string | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          text_mode: string
          theme_id?: string | null
          tone?: string | null
          view_url?: string | null
          workspace_id: string
        }
        Update: {
          amount?: string
          audience?: string | null
          completed_at?: string | null
          created_at?: string
          deck_id?: string | null
          error_code?: string | null
          error_message?: string | null
          export_as?: string[] | null
          export_expires_at?: string | null
          id?: string
          idempotency_key?: string | null
          image_mode?: string
          image_style?: string | null
          input_text?: string
          language?: string
          num_slides?: number | null
          pdf_url?: string | null
          pptx_url?: string | null
          progress?: number
          source_file_id?: string | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          text_mode?: string
          theme_id?: string | null
          tone?: string | null
          view_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      slides: {
        Row: {
          created_at: string
          deck_id: string
          id: string
          layout_variant: string
          position: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deck_id: string
          id: string
          layout_variant?: string
          position: number
          type: string
          updated_at: string
        }
        Update: {
          created_at?: string
          deck_id?: string
          id?: string
          layout_variant?: string
          position?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slides_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          char_count: number | null
          created_at: string
          error_code: string | null
          error_message: string | null
          extracted_text: string | null
          filename: string
          id: string
          mime_type: string
          processed_at: string | null
          s3_key: string
          size: number
          status: string
          truncated: boolean
          workspace_id: string
        }
        Insert: {
          char_count?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          extracted_text?: string | null
          filename: string
          id: string
          mime_type: string
          processed_at?: string | null
          s3_key: string
          size: number
          status?: string
          truncated?: boolean
          workspace_id: string
        }
        Update: {
          char_count?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          extracted_text?: string | null
          filename?: string
          id?: string
          mime_type?: string
          processed_at?: string | null
          s3_key?: string
          size?: number
          status?: string
          truncated?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          onboarding_started_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          updated_at: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          onboarding_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          role: string
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id: string
          role?: string
          token: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          role?: string
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
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
