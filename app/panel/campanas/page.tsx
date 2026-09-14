'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface ClienteRiesgo {
  id: string;
  nombre: string;
  telefono: string | null;
  diasInactivo: number;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  ofertaSugerida: string;
}

const UMBRAL_DIAS = 30;

function calcularNivelYOferta(diasInactivo: number): { nivel: ClienteRiesgo['nivelRiesgo']; oferta: string } {
  if (diasInactivo >= 60) return { nivel: 'ALTO', oferta: '20% de descuento en tu próxima visita' };
  if (diasInactivo >= 30) return { nivel: 'MEDIO', oferta: 'Un producto gratis en tu próxima compra' };
  return { nivel: 'BAJO', oferta: 'Te esperamos con un pequeño detalle 🎁' };
}

export default function PanelCampanas() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteRiesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [mensajesPorCliente, setMensajesPorCliente] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!biz) {
        setLoading(false);
        return;
      }

      const { data: rows } = await supabase
        .from('customers')
        .select('id, full_name, phone, last_visit_at, created_at')
        .eq('business_id', biz.id)
        .not('phone', 'is', null);

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - UMBRAL_DIAS);

      const enRiesgo = (rows ?? [])
        .map((c) => {
          const referencia = c.last_visit_at ?? c.created_at;
          const dias = Math.floor((Date.now() - new Date(referencia).getTime()) / (1000 * 60 * 60 * 24));
          return { c, dias };
        })
        .filter(({ dias }) => dias >= UMBRAL_DIAS)
        .sort((a, b) => b.dias - a.dias)
        .map(({ c, dias }) => {
          const { nivel, oferta } = calcularNivelYOferta(dias);
          return {
            id: c.id,
            nombre: c.full_name ?? 'Sin nombre',
            telefono: c.phone,
            diasInactivo: dias,
            nivelRiesgo: nivel,
            ofertaSugerida: oferta,
          };
        });

      setClientes(enRiesgo);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleEnviarOferta(cliente: ClienteRiesgo) {
    setEnviandoId(cliente.id);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch('/api/panel/campanas/inactivos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ customerIds: [cliente.id], incentiveText: cliente.ofertaSugerida }),
    });
    const data = await res.json();
    setEnviandoId(null);

    if (!res.ok) {
      setMensajesPorCliente((m) => ({ ...m, [cliente.id]: data.error ?? 'No se pudo enviar' }));
      return;
    }

    const resultado = data.results?.[0];
    if (resultado?.status === 'enviado') {
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
    } else {
      setMensajesPorCliente((m) => ({ ...m, [cliente.id]: resultado?.status ?? 'No se pudo enviar' }));
    }
  }

  const riesgoColor: Record<ClienteRiesgo['nivelRiesgo'], { bg: string; text: string }> = {
    ALTO: { bg: '#fde8e8', text: '#c0392b' },
    MEDIO: { bg: '#fdf3d8', text: '#b8860b' },
    BAJO: { bg: 'var(--card)', text: 'var(--slate)' },
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Cargando...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '3rem 1.5rem' }}>
      <style>{`
        .retencion-cta {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .retencion-cta:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
        }
        .retencion-card {
          transition: box-shadow 0.18s ease;
        }
        .retencion-card:hover {
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link
          href="/panel"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1rem' }}
        >
          ← Volver al panel
        </Link>

        <span className="eyebrow">Panel</span>
        <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 0.3rem' }}>Retención de clientes (IA)</h1>
        <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Clientes sin visitar hace {UMBRAL_DIAS}+ días, con una oferta sugerida según su tiempo de inactividad.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {clientes.length === 0 ? (
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--slate)', margin: 0 }}>¡Excelente! No hay clientes en riesgo de abandono en este momento.</p>
            </div>
          ) : (
            clientes.map((cliente) => {
              const colores = riesgoColor[cliente.nivelRiesgo];
              return (
                <div
                  key={cliente.id}
                  className="retencion-card"
                  style={{
                    background: 'var(--card)',
                    borderRadius: 16,
                    padding: '1.3rem 1.4rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0, color: 'var(--ink)' }}>{cliente.nombre}</h3>
                        <span
                          style={{
                            background: colores.bg,
                            color: colores.text,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 999,
                          }}
                        >
                          Riesgo {cliente.nivelRiesgo}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate)', margin: '0.3rem 0 0' }}>
                        Inactivo hace <strong style={{ color: 'var(--ink)' }}>{cliente.diasInactivo} días</strong>
                      </p>
                      {mensajesPorCliente[cliente.id] && (
                        <p style={{ fontSize: '0.78rem', color: '#c0392b', margin: '0.4rem 0 0' }}>{mensajesPorCliente[cliente.id]}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEnviarOferta(cliente)}
                      disabled={enviandoId === cliente.id}
                      className="retencion-cta"
                      style={{
                        background: 'var(--ink)',
                        color: 'var(--paper)',
                        border: 'none',
                        borderRadius: 999,
                        padding: '0.6rem 1.2rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        opacity: enviandoId === cliente.id ? 0.7 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {enviandoId === cliente.id ? 'Enviando...' : 'Enviar por WhatsApp 📲'}
                    </button>
                  </div>

                  <p
                    style={{
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      padding: '0.6rem 0.9rem',
                      borderRadius: 10,
                      margin: 0,
                      width: 'fit-content',
                    }}
                  >
                    🤖 IA sugiere: {cliente.ofertaSugerida}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}