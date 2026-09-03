'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Resena {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// 1. Componente que utiliza useSearchParams
function ReputacionContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get('itemId') || 'TU_ITEM_ID_AQUI';

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [resenas, setResenas] = useState<Resena[]>([]);

  useEffect(() => {
    if (!itemId) return;

    const cargarResenas = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setResenas(data);
      }
    };

    cargarResenas();

    const channel = supabase
      .channel(`realtime-reviews-${itemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const nuevaResena = payload.new as Resena;
            setResenas((prev) => [nuevaResena, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const resenaActualizada = payload.new as Resena;
            setResenas((prev) =>
              prev.map((r) => (r.id === resenaActualizada.id ? resenaActualizada : r))
            );
          } else if (payload.eventType === 'DELETE') {
            setResenas((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Por favor selecciona una calificación con las estrellas.');

    setCargando(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setCargando(false);
      return alert('Debes estar autenticado para enviar una valoración.');
    }

    const { error } = await supabase
      .from('reviews')
      .upsert(
        {
          user_id: user.id,
          item_id: itemId,
          rating: rating,
          comment: comentario,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, item_id' }
      );

    setCargando(false);

    if (error) {
      alert('Error al guardar la reseña: ' + error.message);
    } else {
      setEnviado(true);
      setRating(0);
      setComentario('');
      setTimeout(() => setEnviado(false), 2500);
    }
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
              disabled={cargando}
              style={{
                background: cargando ? '#94A3B8' : '#2563EB',
                color: '#FFF',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: cargando ? 'not-allowed' : 'pointer',
              }}
            >
              {cargando ? 'Guardando...' : 'Enviar valoración'}
            </button>
          </form>
        )}
      </div>

      {resenas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Últimas valoraciones recibidas</h3>
          {resenas.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#FFF',
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ color: '#F59E0B', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {'★'.repeat(r.rating)}
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155' }}>
                {r.comment || 'Sin comentario escrito.'}
              </p>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 2. Export por defecto envuelto en Suspense
export default function ReputacionPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>}>
      <ReputacionContent />
    </Suspense>
  );
}