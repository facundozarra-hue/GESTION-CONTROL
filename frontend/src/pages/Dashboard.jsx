import { useQuery } from '@tanstack/react-query';
import { Car, CheckCircle, Wrench, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import client from '../api/client';

function estadoBadge(estado) {
  const map = {
    ACTIVO: 'bg-green-600/20 text-green-400',
    EN_MANTENIMIENTO: 'bg-yellow-600/20 text-yellow-400',
    BAJA: 'bg-red-600/20 text-red-400',
    PENDIENTE: 'bg-gray-600/20 text-gray-400',
    EN_PROCESO: 'bg-blue-600/20 text-blue-400',
    COMPLETADO: 'bg-green-600/20 text-green-400',
    CANCELADO: 'bg-red-600/20 text-red-400',
  };
  return map[estado] || 'bg-gray-600/20 text-gray-400';
}

export default function Dashboard() {
  const { data: vehiculos = [] } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: () => client.get('/vehiculos').then(r => r.data),
  });

  const { data: mantenimientos = [] } = useQuery({
    queryKey: ['mantenimientos'],
    queryFn: () => client.get('/mantenimientos').then(r => r.data),
  });

  const activos = vehiculos.filter(v => v.estado === 'ACTIVO').length;
  const enMant = vehiculos.filter(v => v.estado === 'EN_MANTENIMIENTO').length;

  const hoy = new Date();
  const en30dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
  const mantMes = mantenimientos.filter(m => {
    const d = new Date(m.fechaIngreso);
    return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
  }).length;

  const porVencerVTV = vehiculos.filter(v => {
    if (!v.vencimientoVTV) return false;
    const d = new Date(v.vencimientoVTV);
    return d >= hoy && d <= en30dias;
  });

  const ultimosMantenimientos = mantenimientos.slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Vehículos" value={vehiculos.length} icon={Car} color="blue" />
        <StatCard title="Activos" value={activos} icon={CheckCircle} color="green" />
        <StatCard title="En Mantenimiento" value={enMant} icon={Wrench} color="yellow" />
        <StatCard title="Mantenimientos este mes" value={mantMes} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Últimos Mantenimientos</h2>
          {ultimosMantenimientos.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin registros</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left pb-2">Vehículo</th>
                  <th className="text-left pb-2">Tipo</th>
                  <th className="text-left pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ultimosMantenimientos.map(m => (
                  <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 text-gray-300">{m.vehiculo?.patente}</td>
                    <td className="py-2 text-gray-400">{m.tipo}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge(m.estado)}`}>
                        {m.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            VTV por vencer (próximos 30 días)
          </h2>
          {porVencerVTV.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin vencimientos próximos</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left pb-2">Patente</th>
                  <th className="text-left pb-2">Marca/Modelo</th>
                  <th className="text-left pb-2">VTV vence</th>
                </tr>
              </thead>
              <tbody>
                {porVencerVTV.map(v => (
                  <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 font-mono text-white">{v.patente}</td>
                    <td className="py-2 text-gray-300">{v.marca} {v.modelo}</td>
                    <td className="py-2 text-yellow-400">
                      {new Date(v.vencimientoVTV).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
