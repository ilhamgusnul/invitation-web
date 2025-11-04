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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          meta: Json
          type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          meta?: Json
          type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          meta?: Json
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number | null
          created_at: string
          event_id: string
          id: string
          method: Database["public"]["Enums"]["donation_method"]
          name: string
          note: string | null
          proof_url: string | null
          status: Database["public"]["Enums"]["donation_status"]
        }
        Insert: {
          amount?: number | null
          created_at?: string
          event_id: string
          id?: string
          method: Database["public"]["Enums"]["donation_method"]
          name: string
          note?: string | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Update: {
          amount?: number | null
          created_at?: string
          event_id?: string
          id?: string
          method?: Database["public"]["Enums"]["donation_method"]
          name?: string
          note?: string | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "donations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_details: {
        Row: {
          couple: Json
          created_at: string
          event_id: string
          music_url: string | null
          seo_meta: Json
          story: string | null
          updated_at: string
        }
        Insert: {
          couple?: Json
          created_at?: string
          event_id: string
          music_url?: string | null
          seo_meta?: Json
          story?: string | null
          updated_at?: string
        }
        Update: {
          couple?: Json
          created_at?: string
          event_id?: string
          music_url?: string | null
          seo_meta?: Json
          story?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_details_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          expire_at: string | null
          id: string
          org_id: string | null
          publish_at: string | null
          slug: string
          status: Database["public"]["Enums"]["event_status"]
          theme_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expire_at?: string | null
          id?: string
          org_id?: string | null
          publish_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["event_status"]
          theme_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expire_at?: string | null
          id?: string
          org_id?: string | null
          publish_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["event_status"]
          theme_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string
          email: string | null
          event_id: string
          id: string
          invite_token: string | null
          name: string
          phone: string | null
          pin: string | null
          segment: string | null
          status: Database["public"]["Enums"]["guest_status"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          invite_token?: string | null
          name: string
          phone?: string | null
          pin?: string | null
          segment?: string | null
          status?: Database["public"]["Enums"]["guest_status"]
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          invite_token?: string | null
          name?: string
          phone?: string | null
          pin?: string | null
          segment?: string | null
          status?: Database["public"]["Enums"]["guest_status"]
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string
          event_id: string
          id: string
          sort: number
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          sort?: number
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          sort?: number
          type?: Database["public"]["Enums"]["media_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          approved: boolean
          created_at: string
          event_id: string
          id: string
          message: string
          name: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          event_id: string
          id?: string
          message: string
          name: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          event_id?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan?: string
        }
        Relationships: [
          {
            foreignKeyName: "orgs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvps: {
        Row: {
          created_at: string
          guest_id: string
          id: string
          note: string | null
          pax: number
          status: Database["public"]["Enums"]["rsvp_status"]
        }
        Insert: {
          created_at?: string
          guest_id: string
          id?: string
          note?: string | null
          pax?: number
          status: Database["public"]["Enums"]["rsvp_status"]
        }
        Update: {
          created_at?: string
          guest_id?: string
          id?: string
          note?: string | null
          pax?: number
          status?: Database["public"]["Enums"]["rsvp_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          datetime: string
          event_id: string
          id: string
          title: string
          tz: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          datetime: string
          event_id: string
          id?: string
          title: string
          tz?: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          datetime?: string
          event_id?: string
          id?: string
          title?: string
          tz?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          created_at: string
          id: string
          is_premium: boolean
          name: string
          preview_url: string | null
          slug: string
          tokens: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_premium?: boolean
          name: string
          preview_url?: string | null
          slug: string
          tokens?: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_premium?: boolean
          name?: string
          preview_url?: string | null
          slug?: string
          tokens?: Json
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          created_at: string
          event_id: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          note: string | null
        }
        Insert: {
          address: string
          created_at?: string
          event_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          note?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          event_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      donation_method: "qris" | "transfer"
      donation_status: "pending" | "confirmed" | "rejected"
      event_status: "draft" | "published"
      guest_status: "invited" | "sent" | "opened" | "rsvped"
      media_type: "image" | "video"
      org_member_role: "owner" | "admin"
      rsvp_status: "yes" | "no" | "maybe"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      donation_method: ["qris", "transfer"],
      donation_status: ["pending", "confirmed", "rejected"],
      event_status: ["draft", "published"],
      guest_status: ["invited", "sent", "opened", "rsvped"],
      media_type: ["image", "video"],
      org_member_role: ["owner", "admin"],
      rsvp_status: ["yes", "no", "maybe"],
    },
  },
} as const
