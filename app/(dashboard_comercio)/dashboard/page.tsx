'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState('este_mes');
  const [simulandoEjecucion, setSimulandoEjecucion] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Datos dinámicos según el filtro
  const datos = {
    este_mes: { impacto: '$4,820 USD', roi: '61X', clientes: 47, referidos: '$780', promos: '$2,680' },
    mes_pasado: { impacto: '$3,910 USD', roi: '49X', clientes: 38, referidos: '$620', promos: '$2,150' },
    trimestre: { impacto: '$12,450 USD', roi: '55X', clientes: 132, referidos: '$2,100', promos: '$7,300' },
  }[periodo] || { impacto: '$4,820 USD', roi: '61X', clientes: 47, referidos: '$780', promos: '$2,680' };

  const ejecutarAutomatizacion = () => {
    setSimulandoEjecucion(true);
    setTimeout(() => {
      setSimulandoEjecucion(false);
      setMensajeExito('¡Campaña de reactivación enviada con éxito a 12 clientes en riesgo!');
      setTimeout(() => setMensajeExito(''), 5000);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Encabezado y Filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Resumen Ejecutivo</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Rendimiento general de tus estrategias de fidelización e IA
          </p>
        </div>

        {/* Selector de Período */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#E2E8F0', padding: '4px', borderRadius: '8px' }}>
          {[
            { id: 'este_mes', label: 'Este Mes' },
            { id: 'mes_pasado', label: 'Mes Pasado' },
            { id: 'trimestre', label: 'Trimestre' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriodo(item.id)}
              style={{
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: periodo === item.id ? '#FFFFFF' : 'transparent',
                color: periodo === item.id ? '#0F172A' : '#64748B',
                boxShadow: periodo === item.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerta interactiva */}
      {mensajeExito && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          {mensajeExito}
        </div>
      )}

      {/* Grid de Métricas Principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Tarjeta 1 */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Impacto Estimado
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: '0.5rem 0' }}>
            {datos.impacto}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              ROI {datos.roi}
            </span>
            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Costo: $79/mes</span>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Clientes Recuperados
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563EB', margin: '0.5rem 0' }}>
            {datos.clientes}
          </div>
          <div style={{ color: '#16A34A', fontSize: '0.85rem', fontWeight: 600 }}>
            +${datos.promos} generados en ventas
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ventas por Referidos
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: '0.5rem 0' }}>
            {datos.referidos}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.8rem' }}>
            Boca a boca digital activado
          </div>
        </div>

      </div>

      {/* Sección Inferior: Acciones Rápidas e IA */}
      <div style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Automatizaciones de Inteligencia Artificial</h3>
          <p style={{ margin: '0.35rem 0 0 0', color: '#94A3B8', fontSize: '0.9rem' }}>
            Detecta clientes inactivos y envía promociones personalizadas automáticamente.
          </p>
        </div>
        <button
          onClick={ejecutarAutomatizacion}
          disabled={simulandoEjecucion}
          style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: simulandoEjecucion ? 'wait' : 'pointer',
            opacity: simulandoEjecucion ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          {simulandoEjecucion ? 'Ejecutando IA...' : '⚡ Lanza Automática de Reactivación'}
        </button>
      </div>

    </div>
  );
}