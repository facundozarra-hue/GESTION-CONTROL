import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vehiculosRouter from './routes/vehiculos.js';
import conductoresRouter from './routes/conductores.js';
import mantenimientosRouter from './routes/mantenimientos.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/vehiculos', vehiculosRouter);
app.use('/api/conductores', conductoresRouter);
app.use('/api/mantenimientos', mantenimientosRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;
