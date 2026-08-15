import { createClient } from '@supabase/supabase-js';

// OJO: este cliente usa la SERVICE ROLE KEY, que se salta RLS.
// Nunca lo importes en un componente 'use client' ni lo expongas
// al navegador. Solo se usa dentro de app/api/**/route.ts.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);