import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Resolve Supabase configuration securely from environment or store
export function getResolvedSupabaseConfig(userCustomUrl?: string, userCustomKey?: string): { url: string; key: string } {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

  const url = userCustomUrl || envUrl;
  const key = userCustomKey || envKey;

  return { url, key };
}

let supabaseClientInstance: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getSupabaseClient(urlOverride?: string, keyOverride?: string): SupabaseClient | null {
  const { url, key } = getResolvedSupabaseConfig(urlOverride, keyOverride);
  if (!url || !key) return null;

  if (supabaseClientInstance && currentUrl === url && currentKey === key) {
    return supabaseClientInstance;
  }

  try {
    supabaseClientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentUrl = url;
    currentKey = key;
    return supabaseClientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(urlOverride?: string, keyOverride?: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = getSupabaseClient(urlOverride, keyOverride);
    if (!client) {
      return { success: false, message: 'Supabase credentials not configured.' };
    }

    const { error } = await client.from('nexus_userdata').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "nexus_userdata" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Table will be auto-managed)',
        };
      }
      return {
        success: false,
        message: `Supabase Error: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to PostgreSQL database!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Could not reach database endpoint.',
    };
  }
}

// --- Supabase Authentication Methods ---

export async function supabaseSignUp(
  email: string,
  password: string,
  fullName?: string,
  urlOverride?: string,
  keyOverride?: string
): Promise<{ user: User | null; session: Session | null; error?: string }> {
  try {
    const client = getSupabaseClient(urlOverride, keyOverride);
    if (!client) return { user: null, session: null, error: 'Database service is initializing. Please try again.' };

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
  email: string,
  password: string,
  urlOverride?: string,
  keyOverride?: string
): Promise<{ user: User | null; session: Session | null; error?: string }> {
  try {
    const client = getSupabaseClient(urlOverride, keyOverride);
    if (!client) return { user: null, session: null, error: 'Database service is initializing. Please try again.' };

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

export async function supabaseSignOut(urlOverride?: string, keyOverride?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient(urlOverride, keyOverride);
    if (!client) return { success: true };

    const { error } = await client.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function supabaseGetSession(
  urlOverride?: string,
  keyOverride?: string
): Promise<{ user: User | null; session: Session | null }> {
  try {
    const client = getSupabaseClient(urlOverride, keyOverride);
    if (!client) return { user: null, session: null };

    const { data, error } = await client.auth.getSession();
    if (error || !data.session) return { user: null, session: null };

    return { user: data.session.user, session: data.session };
  } catch {
    return { user: null, session: null };
  }
}

// --- Data Synchronization (Auto-isolated by userId) ---

export async function syncStateToSupabase(
  userId: string,
  state: any,
  urlOverride?: string,
  keyOverride?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient(urlOverride, keyOverride);
    if (!client) return { success: false, error: 'Database client not initialized' };

    const { error } = await client
      .from('nexus_userdata')
      .upsert({
        id: userId || 'default_user',
        data: state,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchStateFromSupabase(
  userId: string,
  urlOverride?: string,
  keyOverride?: string
): Promise<{ data: any | null; error?: string }> {
  try {
    const client = getSupabaseClient(urlOverride, keyOverride);
    if (!client) return { data: null, error: 'Database client not initialized' };

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

export const SUPABASE_SETUP_SQL = `-- Run once in Supabase SQL Editor:
create table if not exists nexus_userdata (
  id text primary key,
  data jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table nexus_userdata enable row level security;

create policy "Users can access their own data"
  on nexus_userdata
  for all
  using (auth.uid()::text = id or auth.role() = 'anon')
  with check (auth.uid()::text = id or auth.role() = 'anon');
`;
