import { supabase } from './supabaseClient';

export interface ClienteRiesgo {
  clienteId: string;
  diasInactivo: number;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  promocionSugerida: string;
}

export async function detectarClientesEnRiesgo(comercioId: string): Promise<ClienteRiesgo[]> {
  const { data: predicciones, error } = await supabase
    .from('predicciones_retencion')
    .select('*')
    .eq('comercio_id', comercioId)
    .eq('ejecutada', false)
    .order('dias_inactivo', { ascending: false });

  if (error || !predicciones) return [];

  return predicciones.map(p => ({
    clienteId: p.cliente_id,
    diasInactivo: p.dias_inactivo,
    nivelRiesgo: p.nivel_riesgo,
    promocionSugerida: p.oferta_sugerida?.mensaje || '20% OFF en tu próxima visita'
  }));
}

export async function obtenerNextBestOffer(clienteId: string, comercioId: string) {
  const { data: historial } = await supabase
    .from('transacciones')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('comercio_id', comercioId);

  const totalCompras = historial?.length || 0;
  if (totalCompras > 10) {
    return { tipo: 'VIP', recompensa: 'Acceso anticipado a nuevo menú / Pase Exclusivo' };
  } else if (totalCompras === 0) {
    return { tipo: 'BIENVENIDA', recompensa: '10% OFF en primera visita' };
  }
  return { tipo: 'RETENCIÓN', recompensa: 'Postre gratis en consumos mayores a $25' };
}