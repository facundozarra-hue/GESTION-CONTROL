import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function normalizarFecha(val) {
  if (!val || val === '') return null;
  if (val.includes('T')) return val;
  return new Date(val).toISOString();
}

function normalizarFechas(data) {
  const r = { ...data };
  r.fechaIngreso = normalizarFecha(r.fechaIngreso) ?? undefined;
  r.fechaEgreso = normalizarFecha(r.fechaEgreso);
  r.proximoServiceFecha = normalizarFecha(r.proximoServiceFecha);
  return r;
}

export async function listar(req, res, next) {
  try {
    const { vehiculoId, tipo, estado } = req.query;
    const where = {};
    if (vehiculoId) where.vehiculoId = Number(vehiculoId);
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    const mantenimientos = await prisma.mantenimiento.findMany({
      where,
      include: { vehiculo: true },
      orderBy: { fechaIngreso: 'desc' },
    });
    res.json(mantenimientos);
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    const mantenimiento = await prisma.mantenimiento.findUnique({
      where: { id: Number(req.params.id) },
      include: { vehiculo: true },
    });
    if (!mantenimiento) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    res.json(mantenimiento);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const data = normalizarFechas({ ...req.body });
    if (data.vehiculoId) data.vehiculoId = Number(data.vehiculoId);
    if (data.costo) data.costo = parseFloat(data.costo);
    if (data.kilometrajeAlService) data.kilometrajeAlService = parseInt(data.kilometrajeAlService);

    const mantenimiento = await prisma.mantenimiento.create({ data });

    await prisma.vehiculo.update({
      where: { id: data.vehiculoId },
      data: { estado: 'EN_MANTENIMIENTO' },
    });

    res.status(201).json(mantenimiento);
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const data = normalizarFechas({ ...req.body });
    if (data.costo) data.costo = parseFloat(data.costo);
    if (data.kilometrajeAlService) data.kilometrajeAlService = parseInt(data.kilometrajeAlService);

    const mantenimiento = await prisma.mantenimiento.update({
      where: { id: Number(req.params.id) },
      data,
      include: { vehiculo: true },
    });

    if (data.estado === 'COMPLETADO' || data.estado === 'CANCELADO') {
      await prisma.vehiculo.update({
        where: { id: mantenimiento.vehiculoId },
        data: { estado: 'ACTIVO' },
      });
    }

    res.json(mantenimiento);
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await prisma.mantenimiento.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: 'Eliminado' });
  } catch (err) {
    next(err);
  }
}
