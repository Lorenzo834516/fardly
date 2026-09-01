export default function DashboardROIPage() {
  const metricas = {
    ventasAtribuidas: 4820,
    clientesRecuperados: 47,
    ventasClientesRecuperados: 1360,
    ventasReferidos: 780,
    ventasPromociones: 2680,
    costoPlataforma: 79,
  };

  const roiEstimado = Math.round(metricas.ventasAtribuidas / metricas.costoPlataforma);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <p className="text-purple-200 text-sm uppercase tracking-wider font-semibold">Impacto Estimado Este Mes</p>
          <h1 className="text-4xl font-extrabold mt-1">${metricas.ventasAtribuidas.toLocaleString()} USD</h1>
          <p className="text-xs text-purple-200 mt-1">Generado a través de automatizaciones e IA</p>
        </div>
        <div className="text-right">
          <span className="bg-green-400 text-gray-900 font-bold px-3 py-1 rounded-full text-sm">
            ROI {roiEstimado}X
          </span>
          <p className="text-xs mt-2 text-purple-200">Costo mensual: ${metricas.costoPlataforma}/mes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm text-gray-500">Clientes Recuperados</p>
          <p className="text-2xl font-bold">{metricas.clientesRecuperados}</p>
          <p className="text-xs text-green-600 font-medium">+${metricas.ventasClientesRecuperados} en ventas</p>
        </div>
        <div className="border p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm text-gray-500">Ventas por Referidos</p>
          <p className="text-2xl font-bold">${metricas.ventasReferidos}</p>
          <p className="text-xs text-blue-600 font-medium">Boca a boca digital</p>
        </div>
        <div className="border p-4 rounded-xl bg-white shadow-sm">
          <p className="text-sm text-gray-500">Ventas por Promociones IA</p>
          <p className="text-2xl font-bold">${metricas.ventasPromociones}</p>
          <p className="text-xs text-purple-600 font-medium">Next Best Offer</p>
        </div>
      </div>
    </div>
  );
}