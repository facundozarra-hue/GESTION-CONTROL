import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listar(req, res, next) {
  try {
    const conductores = await prisma.conductor.findMany({
      include: {
        asignaciones: {
          where: { activa: true },
          include: { vehiculo: true },
          take: 1,
        },
      },
      orderBy: { apellido: 'asc' },
    });
    res.json(conductores);
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    const conductor = await prisma.conductor.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        asignaciones: {
          include: { vehiculo: true },
          orderBy: { fechaInicio: 'desc' },
        },
      },
    });
    if (!conductor) return res.status(404).json({ error: 'Conductor no encontrado' });
    res.json(conductor);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const conductor = await prisma.conductor.create({ data: req.body });
    res.status(201).json(conductor);
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const conductor = await prisma.conductor.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(conductor);
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const conductor = await prisma.conductor.update({
      where: { id: Number(req.params.id) },
      data: { estado: 'INACTIVO' },
    });
    res.json(conductor);
  } catch (err) {
    next(err);
  }
}
