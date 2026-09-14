'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState('este_mes');
  const [simulandoEjecucion, setSimulandoEjecucion] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Objeto con datos mock según el período seleccionado
  const datos = {
    este_mes: { impacto: 4820, clientes: 47, referidos: 780, promos: 2680, costo: 79 },
    mes_pasado: { impacto: 3910, clientes: 38, referidos: 620, promos: 2150, costo: 79 },
    trimestre: { impacto: 12450, clientes: 132, referidos: 2100, promos: 7300, costo: 237 },
  }[periodo] || { impacto: 4820, clientes: 47, referidos: 780, promos: 2680, costo: 79 };

  const roiEstimado = Math.round(datos.impacto / datos.costo);

  const stats = [
    { label: 'Clientes recuperados', value: datos.clientes, sub: `+$${datos.promos} en ventas` },
    { label: 'Ventas por referidos', value: `$${datos.referidos}`, sub: 'Boca a boca digital' },
    { label: 'Ventas por promociones IA', value: `$${datos.promos}`, sub: 'Next Best Offer' },
  ];

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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Resumen Ejecutivo
          </h1>
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

      {/* Tarjeta principal de impacto */}
      <div
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: 16,
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <p style={{ color: '#94A3B8', fontSize: '0.78rem', letterSpacing: '0.04em', fontWeight: 700, margin: 0 }}>
            IMPACTO ESTIMADO ({periodo.toUpperCase().replace('_', ' ')})
          </p>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.3rem 0 0', lineHeight: 1 }}>
            ${datos.impacto.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.6 }}>USD</span>
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.82rem', margin: '0.4rem 0 0' }}>
            Generado a través de automatizaciones e IA
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: '#EAB308',
              color: '#0F172A',
              fontWeight: 800,
              fontSize: '0.95rem',
              padding: '0.4rem 1rem',
              borderRadius: 999,
            }}
          >
            ROI {roiEstimado}X
          </span>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0.5rem 0 0' }}>
            Costo estimado: ${datos.costo}/período
          </p>
        </div>
      </div>

      {/* Tarjetas secundarias de métricas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: '1.25rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.35rem 0 0', color: '#0F172A' }}>{s.value}</p>
            <p style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 600, margin: '0.35rem 0 0' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Sección Inferior: Acciones Rápidas e IA */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          padding: '1.75rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
            Automatizaciones de Inteligencia Artificial
          </h3>
          <p style={{ margin: '0.35rem 0 0 0', color: '#64748B', fontSize: '0.875rem' }}>
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
          {simulandoEjecucion ? 'Ejecutando IA...' : '⚡ Lanzar Automática de Reactivación'}
        </button>
      </div>

    </div>
  );
}