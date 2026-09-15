'use client';
import { useState } from 'react';

export default function ReputacionPage() {
  const [rating, setRating] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 460, margin: '0 auto' }}>
      <style>{`
        .reputacion-cta {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .reputacion-cta:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
        }
        .reputacion-cta:disabled {
          opacity: 0.55;
          cursor: default;
        }
        .star-button {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          transition: transform 0.12s ease;
        }
        .star-button:hover {
          transform: scale(1.15);
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
          marginBottom: '1.25rem',
        }}
      >
        DEMO — ASÍ SE VERÍA CON TUS CLIENTES REALES
      </span>

      <div
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          padding: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 1.25rem', color: 'var(--ink)' }}>
          ¿Cómo estuvo tu experiencia hoy?
        </h1>

        {!enviado ? (
          <>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="star-button"
                  style={{ color: rating >= star ? 'var(--gold)' : 'var(--line)' }}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Cuéntanos qué te gustó o qué podemos mejorar..."
              style={{
                width: '100%',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: '0.75rem',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                color: 'var(--ink)',
                background: 'var(--paper)',
                resize: 'vertical',
                marginBottom: '1.25rem',
              }}
            />

            <button
              type="button"
              onClick={() => setEnviado(true)}
              disabled={rating === 0}
              className="reputacion-cta"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: 'var(--ink)',
                color: 'var(--paper)',
                border: 'none',
                borderRadius: 999,
                padding: '0.85rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: rating === 0 ? 'default' : 'pointer',
              }}
            >
              Enviar valoración
            </button>
          </>
        ) : (
          <div>
            {rating >= 4 ? (
              <div style={{ background: 'var(--paper)', borderRadius: 14, padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>¡Nos alegra mucho! 🎉</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--slate)', margin: '0.5rem 0 1rem' }}>
                  ¿Nos apoyarías dejando tu opinión pública en nuestra ficha de Google?
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="reputacion-cta"
                  style={{
                    display: 'inline-flex',
                    background: 'var(--gold)',
                    color: 'var(--ink)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    padding: '0.65rem 1.3rem',
                    borderRadius: 999,
                    textDecoration: 'none',
                  }}
                >
                  Dejar reseña en Google
                </a>
              </div>
            ) : (
              <div style={{ background: 'var(--paper)', borderRadius: 14, padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Gracias por tu retroalimentación</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--slate)', margin: '0.5rem 0 0' }}>
                  Hemos recibido tu comentario internamente para mejorar nuestro servicio.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setEnviado(false);
                setRating(0);
                setComentario('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate)',
                fontSize: '0.85rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginTop: '1rem',
                padding: 0,
              }}
            >
              Probar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}