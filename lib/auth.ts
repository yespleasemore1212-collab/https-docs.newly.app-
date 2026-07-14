export { supabase } from '@/lib/supabase';

export async function getBearerToken(): Promise<string | null> {
  const { supabase } = await import('@/lib/supabase');
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
