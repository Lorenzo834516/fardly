'use client';

import { useState } from 'react';

export default function ReputacionPage() {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [resenas, setResenas] = useState<{ estrellas: number; texto: string; fecha: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Por favor selecciona una calificación con las estrellas.');

    const nuevaResena = {
      estrellas: rating,
      texto: comentario,
      fecha: 'Hace un momento',
    };

    setResenas([nuevaResena, ...resenas]);
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setRating(0);
      setComentario('');
    }, 2500);
  };

  return (
    <div style={{ maxWidth: 650, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '2.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          ¿Cómo estuvo tu experiencia hoy?
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '0 0 1.5rem' }}>
          Tu opinión ayuda a mejorar el servicio.
        </p>

        {enviado ? (
          <div style={{ padding: '1.5rem', background: '#DCFCE7', color: '#15803D', borderRadius: '10px', fontWeight: 600 }}>
            🎉 ¡Gracias por tu valoración! Ha sido registrada.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Selector de Estrellas Interactivo */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2.2rem',
                    cursor: 'pointer',
                    color: star <= (hoverRating || rating) ? '#F59E0B' : '#CBD5E1',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos qué te gustó o qué podemos mejorar..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'none',
              }}
            />

            <button
              type="submit"
              style={{
                background: '#2563EB',
                color: '#FFF',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Enviar valoracion
            </button>
          </form>
        )}
      </div>

      {/* Historial de Reseñas */}
      {resenas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Últimas valoraciones recibidas</h3>
          {resenas.map((r, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFF',
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ color: '#F59E0B', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {'★'.repeat(r.estrellas)}
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155' }}>
                {r.texto || 'Sin comentario escrito.'}
              </p>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{r.fecha}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}