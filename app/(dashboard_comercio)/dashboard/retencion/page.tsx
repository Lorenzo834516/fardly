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
    }, 1000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Retención de Clientes (IA)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Clientes con probabilidad de abandono según su historial de consumo.
        </p>
      </div>

      <div className="grid gap-4">
        {clientes.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border text-center text-gray-500">
            ¡Excelente! No hay clientes en riesgo de abandono en este momento.
          </div>
        ) : (
          clientes.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{cliente.nombre}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      cliente.nivelRiesgo === 'ALTO'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    Riesgo {cliente.nivelRiesgo}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Inactivo hace <span className="font-semibold text-gray-700">{cliente.diasInactivo} días</span>
                </p>
                <p className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md mt-2 inline-block font-medium">
                  🤖 IA Sugiere: {cliente.ofertaSugerida}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleEnviarOferta(cliente.id)}
                disabled={enviandoId === cliente.id}
                className="bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors self-end md:self-center"
              >
                {enviandoId === cliente.id ? 'Enviando...' : 'Enviar por WhatsApp 📲'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}