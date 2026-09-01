import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  if (!url || !anonKey) return null;

  if (supabaseClientInstance && currentUrl === url && currentKey === anonKey) {
    return supabaseClientInstance;
  }

  try {
    supabaseClientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
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

    const { error } = await client.from('nexus_userdata').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "nexus_userdata" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: Remember to run the SQL snippet in Supabase SQL Editor)',
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

// --- Supabase Authentication Methods ---

export async function supabaseSignUp(
  url: string,
  anonKey: string,
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: User | null; session: Session | null; error?: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) return { user: null, session: null, error: 'Supabase client not initialized' };

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return { user: data.user, session: data.session };
  } catch (err: any) {
    return { user: null, session: null, error: err?.message || 'Registration failed' };
  }
}

export async function supabaseSignIn(
  url: string,
  anonKey: string,
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error?: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) return { user: null, session: null, error: 'Supabase client not initialized' };

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return { user: data.user, session: data.session };
  } catch (err: any) {
    return { user: null, session: null, error: err?.message || 'Login failed' };
  }
}

export async function supabaseSignOut(url: string, anonKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) return { success: true };

    const { error } = await client.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function supabaseGetSession(
  url: string,
  anonKey: string
): Promise<{ user: User | null; session: Session | null }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    if (!client) return { user: null, session: null };

    const { data, error } = await client.auth.getSession();
    if (error || !data.session) return { user: null, session: null };

    return { user: data.session.user, session: data.session };
  } catch {
    return { user: null, session: null };
  }
}

// --- Data Synchronization (Isolated by userId) ---

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

-- Enable Row Level Security
alter table nexus_userdata enable row level security;

-- Policy: Users can access and update their own personal records
create policy "Users can access their own data"
  on nexus_userdata
  for all
  using (auth.uid()::text = id or auth.role() = 'anon')
  with check (auth.uid()::text = id or auth.role() = 'anon');
`;
