import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, AlertTriangle } from 'lucide-react';
import client from '../api/client';

const ESTADOS = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];
const CATEGORIAS = ['A', 'B', 'C', 'D', 'E', 'F'];

function estadoBadge(estado) {
  const map = {
    ACTIVO: 'bg-green-600/20 text-green-400',
    INACTIVO: 'bg-gray-600/20 text-gray-400',
    SUSPENDIDO: 'bg-red-600/20 text-red-400',
  };
  return map[estado] || '';
}

const emptyForm = {
  nombre: '', apellido: '', dni: '', telefono: '', email: '',
  licenciaCategoria: '', licenciaVencimiento: '',
  estado: 'ACTIVO', observaciones: '',
};

export default function Conductores() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const { data: conductores = [], isLoading } = useQuery({
    queryKey: ['conductores'],
    queryFn: () => client.get('/conductores').then(r => r.data),
  });

  const guardar = useMutation({
    mutationFn: (data) => editId
      ? client.put(`/conductores/${editId}`, data)
      : client.post('/conductores', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conductores'] });
      cerrarModal();
    },
  });

  function abrirNuevo() { setForm(emptyForm); setEditId(null); setModal(true); }
  function abrirEditar(c) {
    setForm({
      nombre: c.nombre || '', apellido: c.apellido || '', dni: c.dni || '',
      telefono: c.telefono || '', email: c.email || '',
      licenciaCategoria: c.licenciaCategoria || '',
      licenciaVencimiento: c.licenciaVencimiento ? c.licenciaVencimiento.slice(0, 10) : '',
      estado: c.estado || 'ACTIVO', observaciones: c.observaciones || '',
    });
    setEditId(c.id); setModal(true);
  }
  function cerrarModal() { setModal(false); setEditId(null); setForm(emptyForm); }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...form,
      licenciaVencimiento: form.licenciaVencimiento || null,
    };
    guardar.mutate(data);
  }

  const hoy = new Date();
  const en30 = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Conductores</h1>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Conductor
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr className="text-gray-400">
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">DNI</th>
              <th className="text-left px-4 py-3">Teléfono</th>
              <th className="text-left px-4 py-3">Licencia</th>
              <th className="text-left px-4 py-3">Vto. Licencia</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Vehículo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-500">Cargando...</td></tr>
            ) : conductores.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-500">Sin conductores</td></tr>
            ) : conductores.map(c => {
              const vehiculo = c.asignaciones?.[0]?.vehiculo;
              const licVence = c.licenciaVencimiento ? new Date(c.licenciaVencimiento) : null;
              const porVencer = licVence && licVence >= hoy && licVence <= en30;
              return (
                <tr key={c.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white font-medium">{c.apellido}, {c.nombre}</td>
                  <td className="px-4 py-3 text-gray-400">{c.dni}</td>
                  <td className="px-4 py-3 text-gray-400">{c.telefono || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{c.licenciaCategoria || '—'}</td>
                  <td className="px-4 py-3">
                    {licVence ? (
                      <span className={`flex items-center gap-1 text-sm ${porVencer ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {porVencer && <AlertTriangle size={12} />}
                        {licVence.toLocaleDateString('es-AR')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge(c.estado)}`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono">
                    {vehiculo ? vehiculo.patente : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => abrirEditar(c)} className="text-gray-400 hover:text-blue-400 transition-colors">
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {editId ? 'Editar Conductor' : 'Nuevo Conductor'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre *" value={form.nombre} onChange={v => setForm(f => ({ ...f, nombre: v }))} required />
                <Field label="Apellido *" value={form.apellido} onChange={v => setForm(f => ({ ...f, apellido: v }))} required />
                <Field label="DNI *" value={form.dni} onChange={v => setForm(f => ({ ...f, dni: v }))} required />
                <Field label="Teléfono" value={form.telefono} onChange={v => setForm(f => ({ ...f, telefono: v }))} />
                <Field label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
                <SelectField label="Categoría Licencia" value={form.licenciaCategoria} onChange={v => setForm(f => ({ ...f, licenciaCategoria: v }))} options={CATEGORIAS} empty="Sin categoría" />
                <Field label="Venc. Licencia" type="date" value={form.licenciaVencimiento} onChange={v => setForm(f => ({ ...f, licenciaVencimiento: v }))} />
                <SelectField label="Estado" value={form.estado} onChange={v => setForm(f => ({ ...f, estado: v }))} options={ESTADOS} />
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

function SelectField({ label, value, onChange, options, empty }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
        {empty && <option value="">{empty}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
