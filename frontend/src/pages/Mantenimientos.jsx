import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import client from '../api/client';

const TIPOS = ['PREVENTIVO', 'CORRECTIVO', 'REVISION'];
const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];

function estadoBadge(estado) {
  const map = {
    PENDIENTE: 'bg-gray-600/20 text-gray-400',
    EN_PROCESO: 'bg-blue-600/20 text-blue-400',
    COMPLETADO: 'bg-green-600/20 text-green-400',
    CANCELADO: 'bg-red-600/20 text-red-400',
  };
  return map[estado] || '';
}

const emptyForm = {
  vehiculoId: '', tipo: 'PREVENTIVO', descripcion: '', taller: '',
  costo: '', kilometrajeAlService: '', fechaIngreso: '',
  fechaEgreso: '', estado: 'PENDIENTE',
  proximoServiceKm: '', proximoServiceFecha: '', observaciones: '',
};

export default function Mantenimientos() {
  const qc = useQueryClient();
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const { data: mantenimientos = [], isLoading } = useQuery({
    queryKey: ['mantenimientos', filtroTipo, filtroEstado],
    queryFn: () => {
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroEstado) params.estado = filtroEstado;
      return client.get('/mantenimientos', { params }).then(r => r.data);
    },
  });

  const { data: vehiculos = [] } = useQuery({
    queryKey: ['vehiculos-select'],
    queryFn: () => client.get('/vehiculos').then(r => r.data),
  });

  const guardar = useMutation({
    mutationFn: (data) => editId
      ? client.put(`/mantenimientos/${editId}`, data)
      : client.post('/mantenimientos', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mantenimientos'] });
      qc.invalidateQueries({ queryKey: ['vehiculos'] });
      cerrarModal();
    },
  });

  function abrirNuevo() { setForm(emptyForm); setEditId(null); setModal(true); }
  function abrirEditar(m) {
    setForm({
      vehiculoId: m.vehiculoId || '',
      tipo: m.tipo || 'PREVENTIVO',
      descripcion: m.descripcion || '',
      taller: m.taller || '',
      costo: m.costo || '',
      kilometrajeAlService: m.kilometrajeAlService || '',
      fechaIngreso: m.fechaIngreso ? m.fechaIngreso.slice(0, 10) : '',
      fechaEgreso: m.fechaEgreso ? m.fechaEgreso.slice(0, 10) : '',
      estado: m.estado || 'PENDIENTE',
      proximoServiceKm: m.proximoServiceKm || '',
      proximoServiceFecha: m.proximoServiceFecha ? m.proximoServiceFecha.slice(0, 10) : '',
      observaciones: m.observaciones || '',
    });
    setEditId(m.id); setModal(true);
  }
  function cerrarModal() { setModal(false); setEditId(null); setForm(emptyForm); }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...form,
      vehiculoId: parseInt(form.vehiculoId),
      costo: form.costo ? parseFloat(form.costo) : null,
      kilometrajeAlService: form.kilometrajeAlService ? parseInt(form.kilometrajeAlService) : null,
      fechaIngreso: form.fechaIngreso || null,
      fechaEgreso: form.fechaEgreso || null,
      proximoServiceKm: form.proximoServiceKm ? parseInt(form.proximoServiceKm) : null,
      proximoServiceFecha: form.proximoServiceFecha || null,
    };
    guardar.mutate(data);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Mantenimientos</h1>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Mantenimiento
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr className="text-gray-400">
              <th className="text-left px-4 py-3">Vehículo</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Descripción</th>
              <th className="text-left px-4 py-3">Taller</th>
              <th className="text-left px-4 py-3">Costo</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-500">Cargando...</td></tr>
            ) : mantenimientos.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-500">Sin registros</td></tr>
            ) : mantenimientos.map(m => (
              <tr key={m.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                <td className="px-4 py-3 font-mono font-bold text-white">{m.vehiculo?.patente}</td>
                <td className="px-4 py-3 text-gray-400">{m.tipo}</td>
                <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{m.descripcion}</td>
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
                <td className="px-4 py-3">
                  <button onClick={() => abrirEditar(m)} className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {editId ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Vehículo *</label>
                  <select
                    value={form.vehiculoId}
                    onChange={e => setForm(f => ({ ...f, vehiculoId: e.target.value }))}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccionar vehículo</option>
                    {vehiculos.map(v => (
                      <option key={v.id} value={v.id}>{v.patente} — {v.marca} {v.modelo}</option>
                    ))}
                  </select>
                </div>
                <SelectField label="Tipo" value={form.tipo} onChange={v => setForm(f => ({ ...f, tipo: v }))} options={TIPOS} />
                <SelectField label="Estado" value={form.estado} onChange={v => setForm(f => ({ ...f, estado: v }))} options={ESTADOS} />
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Descripción *</label>
                  <input
                    value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <Field label="Taller" value={form.taller} onChange={v => setForm(f => ({ ...f, taller: v }))} />
                <Field label="Costo ($)" type="number" value={form.costo} onChange={v => setForm(f => ({ ...f, costo: v }))} />
                <Field label="Km al service" type="number" value={form.kilometrajeAlService} onChange={v => setForm(f => ({ ...f, kilometrajeAlService: v }))} />
                <Field label="Fecha Ingreso" type="date" value={form.fechaIngreso} onChange={v => setForm(f => ({ ...f, fechaIngreso: v }))} />
                <Field label="Fecha Egreso" type="date" value={form.fechaEgreso} onChange={v => setForm(f => ({ ...f, fechaEgreso: v }))} />
                <Field label="Próx. Service Km" type="number" value={form.proximoServiceKm} onChange={v => setForm(f => ({ ...f, proximoServiceKm: v }))} />
                <Field label="Próx. Service Fecha" type="date" value={form.proximoServiceFecha} onChange={v => setForm(f => ({ ...f, proximoServiceFecha: v }))} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Observaciones</label>
                <textarea
                  value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardar.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {guardar.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
