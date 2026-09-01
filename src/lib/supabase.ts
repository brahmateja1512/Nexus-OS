import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  if (!url || !anonKey) return null;

  if (supabaseClientInstance && currentUrl === url && currentKey === anonKey) {
    return supabaseClientInstance;
  }

  try {
    supabaseClientInstance = createClient(url, anonKey);
    currentUrl = url;
    currentKey = anonKey;
    return supabaseClientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) {
      return { success: false, message: 'Invalid Supabase URL or Anon Key.' };
    }

    // Ping Supabase with a lightweight query
    const { error } = await client.from('nexus_userdata').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, it still confirms valid URL and key authentication
      if (error.code === '42P01' || error.message.includes('relation "nexus_userdata" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: Remember to run the SQL snippet to create the table)',
        };
      }
      return {
        success: false,
        message: `Supabase Error: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase PostgreSQL!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Could not reach Supabase endpoint.',
    };
  }
}

export async function syncStateToSupabase(
  url: string,
  anonKey: string,
  userId: string,
  state: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await client
      .from('nexus_userdata')
      .upsert({
        id: userId || 'default_user',
        data: state,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Supabase sync exception:', err);
    return { success: false, error: err?.message };
  }
}

export async function fetchStateFromSupabase(
  url: string,
  anonKey: string,
  userId: string
): Promise<{ data: any | null; error?: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) return { data: null, error: 'Supabase client not initialized' };

    const { data, error } = await client
      .from('nexus_userdata')
      .select('data')
      .eq('id', userId || 'default_user')
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data?.data || null };
  } catch (err: any) {
    return { data: null, error: err?.message };
  }
}

export const SUPABASE_SETUP_SQL = `-- Run this in Supabase SQL Editor:
create table if not exists nexus_userdata (
  id text primary key,
  data jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable access for anonymous client
alter table nexus_userdata enable row level security;
create policy "Allow all operations for anon" on nexus_userdata for all using (true) with check (true);
`;
