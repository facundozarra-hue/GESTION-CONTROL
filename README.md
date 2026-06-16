# Gestión de Flota Automotriz

Sistema web para gestión y mantenimiento de flota automotriz.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + Prisma
- Base de datos: PostgreSQL

## Inicio rápido

### Backend
```bash
cd backend
cp .env.example .env
# Editar .env con credenciales de PostgreSQL
npm install
npm run db:migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Módulos
- **Vehículos**: Registro de flota con alertas de vencimientos
- **Conductores**: Legajo de conductores con control de licencias
- **Mantenimientos**: Historial de services con seguimiento de estado
