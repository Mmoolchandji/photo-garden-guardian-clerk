export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      fabric_types: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fabric_types_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      photos: {
        Row: {
          created_at: string
          description: string
          fabric: string
          id: string
          image_url: string
          legacy: boolean
          price: number
          stock_status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          fabric?: string
          id?: string
          image_url: string
          legacy?: boolean
          price?: number
          stock_status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string
          fabric?: string
          id?: string
          image_url?: string
          legacy?: boolean
          price?: number
          stock_status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      shared_galleries: {
        Row: {
          created_at: string
          id: string
          photos: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photos: Json
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          photos?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_galleries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
