import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function normalizarFechas(data) {
  const camposFecha = ['vencimientoVTV', 'vencimientoSeguro', 'vencimientoHabilitacion'];
  const resultado = { ...data };
  for (const campo of camposFecha) {
    if (resultado[campo] === '' || resultado[campo] === null) {
      resultado[campo] = null;
    } else if (resultado[campo] && !resultado[campo].includes('T')) {
      resultado[campo] = new Date(resultado[campo]).toISOString();
    }
  }
  return resultado;
}

export async function listar(req, res, next) {
  try {
    const { estado } = req.query;
    const where = estado ? { estado } : {};
    const vehiculos = await prisma.vehiculo.findMany({
      where,
      include: {
        asignaciones: {
          where: { activa: true },
          include: { conductor: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(vehiculos);
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        mantenimientos: { orderBy: { fechaIngreso: 'desc' } },
        asignaciones: {
          include: { conductor: true },
          orderBy: { fechaInicio: 'desc' },
        },
      },
    });
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(vehiculo);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const vehiculo = await prisma.vehiculo.create({ data: normalizarFechas(req.body) });
    res.status(201).json(vehiculo);
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const vehiculo = await prisma.vehiculo.update({
      where: { id: Number(req.params.id) },
      data: normalizarFechas(req.body),
    });
    res.json(vehiculo);
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const vehiculo = await prisma.vehiculo.update({
      where: { id: Number(req.params.id) },
      data: { estado: 'BAJA' },
    });
    res.json(vehiculo);
  } catch (err) {
    next(err);
  }
}
