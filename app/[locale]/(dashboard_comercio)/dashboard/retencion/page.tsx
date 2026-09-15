'use client';
import { useState } from 'react';

interface ClienteRiesgo {
  id: string;
  nombre: string;
  telefono: string;
  diasInactivo: number;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  ofertaSugerida: string;
}

export default function RetencionPage() {
  const [clientes, setClientes] = useState<ClienteRiesgo[]>([
    {
      id: '1',
      nombre: 'Carlos Mendoza',
      telefono: '+584121234567',
      diasInactivo: 45,
      nivelRiesgo: 'ALTO',
      ofertaSugerida: '2x1 en tu café favorito esta semana',
    },
    {
      id: '2',
      nombre: 'María Delgado',
      telefono: '+584149876543',
      diasInactivo: 28,
      nivelRiesgo: 'MEDIO',
      ofertaSugerida: 'Postre gratis en tu consumo > $15',
    },
  ]);

  const [enviandoId, setEnviandoId] = useState<string | null>(null);

  const handleEnviarOferta = (id: string) => {
    setEnviandoId(id);
    setTimeout(() => {
      setClientes((prev) => prev.filter((c) => c.id !== id));
      setEnviandoId(null);
    }, 900);
  };

  const riesgoColor: Record<ClienteRiesgo['nivelRiesgo'], { bg: string; text: string }> = {
    ALTO: { bg: '#fde8e8', text: '#c0392b' },
    MEDIO: { bg: '#fdf3d8', text: '#b8860b' },
    BAJO: { bg: 'var(--card)', text: 'var(--slate)' },
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 720, margin: '0 auto' }}>
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

      <span
        style={{
          display: 'inline-block',
          background: 'var(--card)',
          color: 'var(--stamp)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          padding: '0.3rem 0.8rem',
          borderRadius: 999,
          marginBottom: '1rem',
        }}
      >
        DEMO — ASÍ SE VERÍA CON TUS CLIENTES REALES
      </span>

      <h1 style={{ fontSize: '1.7rem', margin: '0 0 0.3rem', color: 'var(--ink)' }}>Retención de clientes (IA)</h1>
      <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
        Clientes con probabilidad de abandono según su historial de consumo.
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
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEnviarOferta(cliente.id)}
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
  );
}