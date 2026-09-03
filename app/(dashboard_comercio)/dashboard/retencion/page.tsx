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
      telefono: '584121234567',
      diasInactivo: 45,
      nivelRiesgo: 'ALTO',
      ofertaSugerida: '2x1 en tu café favorito esta semana',
    },
    {
      id: '2',
      nombre: 'María Delgado',
      telefono: '584149876543',
      diasInactivo: 28,
      nivelRiesgo: 'MEDIO',
      ofertaSugerida: 'Postre gratis en tu consumo > $15',
    },
  ]);

  const [enviandoId, setEnviandoId] = useState<string | null>(null);

  const handleEnviarOferta = (cliente: ClienteRiesgo) => {
    setEnviandoId(cliente.id);

    // Formatear mensaje y abrir WhatsApp
    const mensaje = encodeURIComponent(
      `¡Hola ${cliente.nombre}! Te extrañamos mucho. Tenemos una oferta especial para ti: ${cliente.ofertaSugerida}. ¡Muestra este mensaje en tu próxima visita!`
    );
    window.open(`https://wa.me/${cliente.telefono}?text=${mensaje}`, '_blank');

    setTimeout(() => {
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
      setEnviandoId(null);
    }, 1200);
  };

  const handleRegenerarOferta = (id: string) => {
    const nuevasOfertas = [
      '20% de descuento en tu cuenta total',
      'Café o bebida de cortesía hoy',
      'Sello doble en tu tarjeta de puntos',
      'Papas o acompañante gratis en tu pedido',
    ];

    const ofertaAleatoria = nuevasOfertas[Math.floor(Math.random() * nuevasOfertas.length)];

    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ofertaSugerida: ofertaAleatoria } : c))
    );
  };

  const handleSimularCliente = () => {
    const nombres = ['Andrés Silva', 'Valeria Gómez', 'Gabriel Rojas', 'Camila Benítez'];
    const nuevoNombre = nombres[Math.floor(Math.random() * nombres.length)];
    const id = Date.now().toString();

    setClientes((prev) => [
      ...prev,
      {
        id,
        nombre: nuevoNombre,
        telefono: '584120000000',
        diasInactivo: Math.floor(Math.random() * 30) + 15,
        nivelRiesgo: Math.random() > 0.5 ? 'ALTO' : 'MEDIO',
        ofertaSugerida: '15% OFF en tu próxima compra',
      },
    ]);
  };

  return (
    <div style={{ maxWidth: 850, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Retención de Clientes (IA)
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Detección automática de clientes con riesgo de abandono y promociones personalizadas.
          </p>
        </div>

        <button
          onClick={handleSimularCliente}
          style={{
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          + Simular nuevo cliente en riesgo
        </button>
      </div>

      {/* Lista de Clientes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {clientes.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '3rem 2rem',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              color: '#64748B',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem' }}>
              ¡Todo bajo control!
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              No tienes clientes en riesgo de abandono por el momento.
            </p>
          </div>
        ) : (
          clientes.map((cliente) => (
            <div
              key={cliente.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Información superior */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
                      {cliente.nombre}
                    </h3>
                    <span
                      style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: cliente.nivelRiesgo === 'ALTO' ? '#FEE2E2' : '#FEF3C7',
                        color: cliente.nivelRiesgo === 'ALTO' ? '#B91C1C' : '#B45309',
                      }}
                    >
                      RIESGO {cliente.nivelRiesgo}
                    </span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    Inactivo hace <strong style={{ color: '#334155' }}>{cliente.diasInactivo} días</strong> • Teléfono: {cliente.telefono}
                  </p>
                </div>
              </div>

              {/* Sugerencia de la IA */}
              <div
                style={{
                  backgroundColor: '#F0F9FF',
                  borderLeft: '4px solid #0284C7',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ color: '#0369A1', fontSize: '0.9rem', fontWeight: 600 }}>
                  🤖 <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.8, letterSpacing: '0.05em' }}>IA Sugiere:</span>{' '}
                  <span style={{ color: '#0C4A6E', fontWeight: 700 }}>{cliente.ofertaSugerida}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRegenerarOferta(cliente.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284C7',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  🔄 Nueva opción
                </button>
              </div>

              {/* Botón de Acción */}
              <button
                type="button"
                onClick={() => handleEnviarOferta(cliente)}
                disabled={enviandoId === cliente.id}
                style={{
                  width: '100%',
                  backgroundColor: enviandoId === cliente.id ? '#9CA3AF' : '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.8rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: enviandoId === cliente.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                {enviandoId === cliente.id ? 'Abriendo WhatsApp...' : 'Enviar Promoción por WhatsApp 📲'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}