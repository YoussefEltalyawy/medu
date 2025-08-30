export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          content: string
          created_at: string | null
          id: string
          time: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          time?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          time?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_reviews: {
        Row: {
          ease_factor: number | null
          id: string
          interval_days: number | null
          next_review: string | null
          quality: number | null
          reviewed_at: string | null
          user_id: string | null
          vocabulary_word_id: string | null
        }
        Insert: {
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          next_review?: string | null
          quality?: number | null
          reviewed_at?: string | null
          user_id?: string | null
          vocabulary_word_id?: string | null
        }
        Update: {
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          next_review?: string | null
          quality?: number | null
          reviewed_at?: string | null
          user_id?: string | null
          vocabulary_word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_reviews_vocabulary_word_id_fkey"
            columns: ["vocabulary_word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_words"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_templates: {
        Row: {
          category: string | null
          created_at: string | null
          default_duration: number
          default_target: number
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          title: string
          tracking_type: string | null
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_duration: number
          default_target: number
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          tracking_type?: string | null
          unit: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_duration?: number
          default_target?: number
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          tracking_type?: string | null
          unit?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          current: number | null
          deadline: string | null
          description: string | null
          difficulty: string | null
          id: string
          progress: number | null
          status: string | null
          target: number
          template_id: string | null
          title: string
          tracking_type: string | null
          unit: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          current?: number | null
          deadline?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target: number
          template_id?: string | null
          title: string
          tracking_type?: string | null
          unit: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          current?: number | null
          deadline?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target?: number
          template_id?: string | null
          title?: string
          tracking_type?: string | null
          unit?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "goal_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          content: string
          created_at: string | null
          date: string | null
          id: string
          study_time: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          date?: string | null
          id?: string
          study_time: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string | null
          id?: string
          study_time?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          current_level: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          level_progress: number | null
          longest_streak: number | null
          total_study_time: number | null
          updated_at: string | null
          user_id: string | null
          weekly_study_time: number | null
          words_learned: number | null
        }
        Insert: {
          current_level?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level_progress?: number | null
          longest_streak?: number | null
          total_study_time?: number | null
          updated_at?: string | null
          user_id?: string | null
          weekly_study_time?: number | null
          words_learned?: number | null
        }
        Update: {
          current_level?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level_progress?: number | null
          longest_streak?: number | null
          total_study_time?: number | null
          updated_at?: string | null
          user_id?: string | null
          weekly_study_time?: number | null
          words_learned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          current_level: string | null
          email: string
          full_name: string | null
          id: string
          target_language: string | null
          updated_at: string | null
          display_name: string | null
          native_language: string | null
          experience_level: string | null
          content_preferences: Json | null
          learning_goals: string[] | null
          weekly_study_time: number | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_level?: string | null
          email: string
          full_name?: string | null
          id?: string
          target_language?: string | null
          updated_at?: string | null
          display_name?: string | null
          native_language?: string | null
          experience_level?: string | null
          content_preferences?: Json | null
          learning_goals?: string[] | null
          weekly_study_time?: number | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_level?: string | null
          email?: string
          full_name?: string | null
          id?: string
          target_language?: string | null
          updated_at?: string | null
          display_name?: string | null
          native_language?: string | null
          experience_level?: string | null
          content_preferences?: Json | null
          learning_goals?: string[] | null
          weekly_study_time?: number | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
        }
        Relationships: []
      }
      vocabulary_words: {
        Row: {
          created_at: string | null
          date_added: string | null
          english: string
          example: string | null
          german: string
          id: string
          last_reviewed: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_added?: string | null
          english: string
          example?: string | null
          german: string
          id?: string
          last_reviewed?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_added?: string | null
          english?: string
          example?: string | null
          german?: string
          id?: string
          last_reviewed?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_words_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_due_flashcards: {
        Args: { user_uuid: string; review_date: string }
        Returns: {
          id: string
          german: string
          english: string
          example: string
          status: string
          last_reviewed: string
          next_review: string
        }[]
      }
      update_flashcard_review: {
        Args: {
          p_user_id: string
          p_word_id: string
          p_status: string
          p_reviewed_at: string
          p_quality: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
