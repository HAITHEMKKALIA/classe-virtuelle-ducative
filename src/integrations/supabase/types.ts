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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          anti_cheat: Json
          class_id: string | null
          consignes: string | null
          created_at: string
          duree_minutes: number
          ferme_at: string | null
          id: string
          matiere: string
          niveau: number
          ouvre_at: string | null
          prof_id: string
          published: boolean
          titre: string
          trimestre: number
          type: string
          updated_at: string
        }
        Insert: {
          anti_cheat?: Json
          class_id?: string | null
          consignes?: string | null
          created_at?: string
          duree_minutes?: number
          ferme_at?: string | null
          id?: string
          matiere?: string
          niveau?: number
          ouvre_at?: string | null
          prof_id: string
          published?: boolean
          titre: string
          trimestre?: number
          type?: string
          updated_at?: string
        }
        Update: {
          anti_cheat?: Json
          class_id?: string | null
          consignes?: string | null
          created_at?: string
          duree_minutes?: number
          ferme_at?: string | null
          id?: string
          matiere?: string
          niveau?: number
          ouvre_at?: string | null
          prof_id?: string
          published?: boolean
          titre?: string
          trimestre?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_members: {
        Row: {
          class_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["account_status"]
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["account_status"]
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["account_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_messages: {
        Row: {
          class_id: string
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_messages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          annee_scolaire: string
          code_invitation: string
          created_at: string
          description: string | null
          id: string
          niveau: number
          nom: string
          prof_id: string
        }
        Insert: {
          annee_scolaire?: string
          code_invitation?: string
          created_at?: string
          description?: string | null
          id?: string
          niveau?: number
          nom: string
          prof_id: string
        }
        Update: {
          annee_scolaire?: string
          code_invitation?: string
          created_at?: string
          description?: string | null
          id?: string
          niveau?: number
          nom?: string
          prof_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          class_id: string | null
          contenu: string
          cover_image_url: string | null
          created_at: string
          id: string
          images: Json
          matiere: string
          niveau: number
          prof_id: string
          published: boolean
          resume: string | null
          titre: string
          trimestre: number
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          contenu?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          images?: Json
          matiere?: string
          niveau?: number
          prof_id: string
          published?: boolean
          resume?: string | null
          titre: string
          trimestre?: number
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          contenu?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          images?: Json
          matiere?: string
          niveau?: number
          prof_id?: string
          published?: boolean
          resume?: string | null
          titre?: string
          trimestre?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          niveau: number | null
          requested_role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          niveau?: number | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          niveau?: number | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          assessment_id: string
          created_at: string
          enonce: string
          id: string
          image_url: string | null
          options: Json
          ordre: number
          points: number
          reponse_correcte: string | null
          type: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          enonce: string
          id?: string
          image_url?: string | null
          options?: Json
          ordre?: number
          points?: number
          reponse_correcte?: string | null
          type?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          enonce?: string
          id?: string
          image_url?: string | null
          options?: Json
          ordre?: number
          points?: number
          reponse_correcte?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          answers: Json
          assessment_id: string
          cheat_events: Json
          feedback: string | null
          graded_at: string | null
          id: string
          per_question: Json
          score: number | null
          started_at: string
          status: string
          student_id: string
          submitted_at: string | null
          total: number | null
        }
        Insert: {
          answers?: Json
          assessment_id: string
          cheat_events?: Json
          feedback?: string | null
          graded_at?: string | null
          id?: string
          per_question?: Json
          score?: number | null
          started_at?: string
          status?: string
          student_id: string
          submitted_at?: string | null
          total?: number | null
        }
        Update: {
          answers?: Json
          assessment_id?: string
          cheat_events?: Json
          feedback?: string | null
          graded_at?: string | null
          id?: string
          per_question?: Json
          score?: number | null
          started_at?: string
          status?: string
          student_id?: string
          submitted_at?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_take_assessment: {
        Args: { _assessment_id: string; _user_id: string }
        Returns: boolean
      }
      claim_super_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
      is_class_member: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_class_owner: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      owns_assessment: {
        Args: { _assessment_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "pending" | "approved" | "rejected"
      app_role: "super_admin" | "prof" | "eleve"
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
    Enums: {
      account_status: ["pending", "approved", "rejected"],
      app_role: ["super_admin", "prof", "eleve"],
    },
  },
} as const
