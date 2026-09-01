import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Verifica que quien llama a una ruta /api/admin/* es un
// administrador de la plataforma (no un dueño de negocio normal).
// Devuelve el user_id si es válido, o null si no lo es.
export async function verifyPlatformAdmin(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: admin } = await supabaseAdmin
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  return admin ? user.id : null;
}