import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
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
  return map[estado] || '';
}

function VencimientoAlert({ label, fecha }) {
  if (!fecha) return null;
  const d = new Date(fecha);
  const hoy = new Date();
  const dias = Math.ceil((d - hoy) / (1000 * 60 * 60 * 24));
  if (dias > 30) return null;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${dias < 0 ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
      <AlertTriangle size={14} />
      {label}: {dias < 0 ? `venció hace ${Math.abs(dias)} días` : `vence en ${dias} días`}
    </div>
  );
}

export default function VehiculoDetalle() {
  const { id } = useParams();
  const [tab, setTab] = useState('mantenimientos');

  const { data: vehiculo, isLoading } = useQuery({
    queryKey: ['vehiculo', id],
    queryFn: () => client.get(`/vehiculos/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="text-gray-400">Cargando...</div>;
  if (!vehiculo) return <div className="text-gray-400">Vehículo no encontrado</div>;

  return (
    <div>
      <div className="mb-6">
        <Link to="/vehiculos" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
          <ArrowLeft size={16} /> Volver a Vehículos
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white font-mono">{vehiculo.patente}</h1>
            <p className="text-gray-400 mt-1">{vehiculo.marca} {vehiculo.modelo} · {vehiculo.anio} · {vehiculo.tipo}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoBadge(vehiculo.estado)}`}>
            {vehiculo.estado}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <VencimientoAlert label="VTV" fecha={vehiculo.vencimientoVTV} />
        <VencimientoAlert label="Seguro" fecha={vehiculo.vencimientoSeguro} />
        <VencimientoAlert label="Habilitación" fecha={vehiculo.vencimientoHabilitacion} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Kilometraje</p>
          <p className="text-xl font-bold text-white">{vehiculo.kilometraje?.toLocaleString()} km</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Color</p>
          <p className="text-xl font-bold text-white">{vehiculo.color || '—'}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Mantenimientos</p>
          <p className="text-xl font-bold text-white">{vehiculo.mantenimientos?.length || 0}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {['mantenimientos', 'asignaciones'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {tab === 'mantenimientos' ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr className="text-gray-400">
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Descripción</th>
                <th className="text-left px-4 py-3">Taller</th>
                <th className="text-left px-4 py-3">Costo</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {vehiculo.mantenimientos?.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-500">Sin mantenimientos</td></tr>
              ) : vehiculo.mantenimientos?.map(m => (
                <tr key={m.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-gray-300">{m.tipo}</td>
                  <td className="px-4 py-3 text-gray-400">{m.descripcion}</td>
                  <td className="px-4 py-3 text-gray-400">{m.taller || '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{m.costo ? `$${m.costo.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge(m.estado)}`}>
                      {m.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(m.fechaIngreso).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr className="text-gray-400">
                <th className="text-left px-4 py-3">Conductor</th>
                <th className="text-left px-4 py-3">DNI</th>
                <th className="text-left px-4 py-3">Desde</th>
                <th className="text-left px-4 py-3">Hasta</th>
                <th className="text-left px-4 py-3">Activa</th>
              </tr>
            </thead>
            <tbody>
              {vehiculo.asignaciones?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Sin asignaciones</td></tr>
              ) : vehiculo.asignaciones?.map(a => (
                <tr key={a.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-gray-300">{a.conductor?.nombre} {a.conductor?.apellido}</td>
                  <td className="px-4 py-3 text-gray-400">{a.conductor?.dni}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(a.fechaInicio).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-gray-400">{a.fechaFin ? new Date(a.fechaFin).toLocaleDateString('es-AR') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.activa ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                      {a.activa ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
