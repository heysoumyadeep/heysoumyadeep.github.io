/**
 * ViewTracker.js
 *
 * Tracks per-post view counts using Supabase (Postgres).
 * Table schema:
 *   post_views (slug text primary key, views integer default 0, updated_at timestamptz)
 *
 * Uses the anon/public key — only view counts are stored, no sensitive data.
 * RLS policies on the table restrict operations to select + upsert only.
 *
 * Required env vars:
 *   VITE_SUPABASE_URL        – Project URL from Supabase → Settings → API
 *   VITE_SUPABASE_ANON_KEY   – anon public key from Supabase → Settings → API
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl   = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon  = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lazily initialise — returns null if env vars are missing (dev without config)
let _client = null;
function getClient() {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnon) return null;
  _client = createClient(supabaseUrl, supabaseAnon);
  return _client;
}

/**
 * Return the current view count for the given slug.
 * Returns 0 if the row doesn't exist yet or on any error.
 * @param {string} slug
 * @returns {Promise<number>}
 */
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

/**
 * Increment the view count for the given slug by 1 and return the new count.
 * Uses an upsert + Postgres function for an atomic increment.
 * Returns 0 on any error.
 * @param {string} slug
 * @returns {Promise<number>}
 */
export async function incrementView(slug) {
  try {
    const client = getClient();
    if (!client) return 0;

    // Upsert: insert row if it doesn't exist, otherwise increment views by 1
    const { data, error } = await client.rpc('increment_post_view', { post_slug: slug });

    if (error) {
      // Fallback: if the RPC doesn't exist yet, do a manual upsert
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
