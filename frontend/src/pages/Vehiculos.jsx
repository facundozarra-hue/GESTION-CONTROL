import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Eye, Pencil } from 'lucide-react';
import client from '../api/client';

const TIPOS = ['AUTO', 'CAMIONETA', 'CAMION', 'MOTO', 'OTRO'];
const ESTADOS = ['ACTIVO', 'EN_MANTENIMIENTO', 'BAJA'];

function estadoBadge(estado) {
  const map = {
    ACTIVO: 'bg-green-600/20 text-green-400',
    EN_MANTENIMIENTO: 'bg-yellow-600/20 text-yellow-400',
    BAJA: 'bg-red-600/20 text-red-400',
  };
  return map[estado] || '';
}

const emptyForm = {
  patente: '', marca: '', modelo: '', anio: '', color: '',
  tipo: 'AUTO', kilometraje: '', estado: 'ACTIVO',
  vencimientoVTV: '', vencimientoSeguro: '', vencimientoHabilitacion: '',
  observaciones: '',
};

export default function Vehiculos() {
  const qc = useQueryClient();
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const { data: vehiculos = [], isLoading } = useQuery({
    queryKey: ['vehiculos', filtroEstado],
    queryFn: () => client.get('/vehiculos', { params: filtroEstado ? { estado: filtroEstado } : {} }).then(r => r.data),
  });

  const guardar = useMutation({
    mutationFn: (data) => editId
      ? client.put(`/vehiculos/${editId}`, data)
      : client.post('/vehiculos', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehiculos'] });
      cerrarModal();
    },
  });

  function abrirNuevo() {
    setForm(emptyForm);
    setEditId(null);
    setModal(true);
  }

  function abrirEditar(v) {
    setForm({
      patente: v.patente || '', marca: v.marca || '', modelo: v.modelo || '',
      anio: v.anio || '', color: v.color || '', tipo: v.tipo || 'AUTO',
      kilometraje: v.kilometraje || '', estado: v.estado || 'ACTIVO',
      vencimientoVTV: v.vencimientoVTV ? v.vencimientoVTV.slice(0, 10) : '',
      vencimientoSeguro: v.vencimientoSeguro ? v.vencimientoSeguro.slice(0, 10) : '',
      vencimientoHabilitacion: v.vencimientoHabilitacion ? v.vencimientoHabilitacion.slice(0, 10) : '',
      observaciones: v.observaciones || '',
    });
    setEditId(v.id);
    setModal(true);
  }

  function cerrarModal() {
    setModal(false);
    setEditId(null);
    setForm(emptyForm);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      ...form,
      anio: parseInt(form.anio),
      kilometraje: parseInt(form.kilometraje) || 0,
      vencimientoVTV: form.vencimientoVTV || null,
      vencimientoSeguro: form.vencimientoSeguro || null,
      vencimientoHabilitacion: form.vencimientoHabilitacion || null,
    };
    guardar.mutate(data);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Vehículos</h1>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Vehículo
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr className="text-gray-400">
              <th className="text-left px-4 py-3">Patente</th>
              <th className="text-left px-4 py-3">Marca / Modelo</th>
              <th className="text-left px-4 py-3">Año</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Conductor</th>
              <th className="text-left px-4 py-3">Km</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-500">Cargando...</td></tr>
            ) : vehiculos.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-500">Sin vehículos</td></tr>
            ) : vehiculos.map(v => {
              const conductor = v.asignaciones?.[0]?.conductor;
              return (
                <tr key={v.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-white">{v.patente}</td>
                  <td className="px-4 py-3 text-gray-300">{v.marca} {v.modelo}</td>
                  <td className="px-4 py-3 text-gray-400">{v.anio}</td>
                  <td className="px-4 py-3 text-gray-400">{v.tipo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge(v.estado)}`}>
                      {v.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {conductor ? `${conductor.nombre} ${conductor.apellido}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{v.kilometraje?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/vehiculos/${v.id}`} className="text-gray-400 hover:text-blue-400 transition-colors">
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => abrirEditar(v)} className="text-gray-400 hover:text-blue-400 transition-colors">
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {editId ? 'Editar Vehículo' : 'Nuevo Vehículo'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Patente *" value={form.patente} onChange={v => setForm(f => ({ ...f, patente: v }))} required />
                <Field label="Marca *" value={form.marca} onChange={v => setForm(f => ({ ...f, marca: v }))} required />
                <Field label="Modelo *" value={form.modelo} onChange={v => setForm(f => ({ ...f, modelo: v }))} required />
                <Field label="Año *" type="number" value={form.anio} onChange={v => setForm(f => ({ ...f, anio: v }))} required />
                <Field label="Color" value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} />
                <Field label="Kilometraje" type="number" value={form.kilometraje} onChange={v => setForm(f => ({ ...f, kilometraje: v }))} />
                <SelectField label="Tipo" value={form.tipo} onChange={v => setForm(f => ({ ...f, tipo: v }))} options={TIPOS} />
                <SelectField label="Estado" value={form.estado} onChange={v => setForm(f => ({ ...f, estado: v }))} options={ESTADOS} />
                <Field label="Vencimiento VTV" type="date" value={form.vencimientoVTV} onChange={v => setForm(f => ({ ...f, vencimientoVTV: v }))} />
                <Field label="Vencimiento Seguro" type="date" value={form.vencimientoSeguro} onChange={v => setForm(f => ({ ...f, vencimientoSeguro: v }))} />
                <Field label="Vencimiento Habilitación" type="date" value={form.vencimientoHabilitacion} onChange={v => setForm(f => ({ ...f, vencimientoHabilitacion: v }))} />
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
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
