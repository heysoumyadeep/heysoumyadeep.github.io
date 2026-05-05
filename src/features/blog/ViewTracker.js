// Tracks per-post view counts via Supabase
// Needs: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _client = null;
function getClient() {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnon) return null;
  _client = createClient(supabaseUrl, supabaseAnon);
  return _client;
}

export async function getViews(slug) {
  try {
    const client = getClient();
    if (!client) return 0;

    const { data, error } = await client
      .from('post_views')
      .select('views')
      .eq('slug', slug)
      .single();

    if (error || !data) return 0;
    return data.views ?? 0;
  } catch {
    return 0;
  }
}

export async function incrementView(slug) {
  try {
    const client = getClient();
    if (!client) return 0;

    const { data, error } = await client.rpc('increment_post_view', { post_slug: slug });

    if (error) {
      // Fallback if RPC doesn't exist yet
      const { data: upserted, error: upsertError } = await client
        .from('post_views')
        .upsert(
          { slug, views: 1, updated_at: new Date().toISOString() },
          { onConflict: 'slug', ignoreDuplicates: false }
        )
        .select('views')
        .single();

      if (upsertError || !upserted) return 0;
      return upserted.views ?? 0;
    }

    return typeof data === 'number' ? data : 0;
  } catch {
    return 0;
  }
}
