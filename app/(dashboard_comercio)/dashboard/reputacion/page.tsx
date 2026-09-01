'use client';
import { useState } from 'react';

export default function ReputacionPage() {
  const [rating, setRating] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white shadow-lg rounded-xl border">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">¿Cómo estuvo tu experiencia hoy?</h2>
      
      {!enviado ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            className="w-full border p-2 rounded-md text-gray-700"
            rows={3}
            placeholder="Cuéntanos qué te gustó o qué podemos mejorar..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setEnviado(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
          >
            Enviar valoración
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rating >= 4 ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800">¡Nos alegra mucho! 🎉</h3>
              <p className="text-sm text-green-700 mt-1">
                ¿Nos apoyarías dejando tu opinión pública en nuestra ficha de Google?
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-md font-medium"
              >
                Dejar Reseña en Google
              </a>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800">Gracias por tu retroalimentación</h3>
              <p className="text-sm text-blue-700 mt-1">
                Hemos recibido tu comentario internamente para mejorar nuestro servicio.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}