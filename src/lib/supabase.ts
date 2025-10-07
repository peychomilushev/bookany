import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          logo_url?: string;
          theme_color: string;
          timezone: string;
          description?: string;
          phone?: string;
          email?: string;
          address?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description?: string;
          duration: number;
          price: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      reservations: {
        Row: {
          id: string;
          business_id: string;
          service_id?: string;
          customer_name: string;
          customer_phone?: string;
          customer_email?: string;
          party_size?: number;
          special_requests?: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          reservation_date: string;
          reservation_time: string;
          notes?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reservations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reservations']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
          price_id: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          business_id: string;
          reservation_id: string;
          type: 'email' | 'sms';
          recipient: string;
          subject?: string;
          content: string;
          status: 'pending' | 'sent' | 'failed';
          scheduled_for: string;
          sent_at?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          business_id: string;
          customer_name: string;
          customer_contact: string;
          channel: 'phone' | 'telegram' | 'web' | 'email';
          content: string;
          status: 'unread' | 'read' | 'replied';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
    };
  };
};