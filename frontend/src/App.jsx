import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vehiculos from './pages/Vehiculos';
import VehiculoDetalle from './pages/VehiculoDetalle';
import Conductores from './pages/Conductores';
import Mantenimientos from './pages/Mantenimientos';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="vehiculos" element={<Vehiculos />} />
        <Route path="vehiculos/:id" element={<VehiculoDetalle />} />
        <Route path="conductores" element={<Conductores />} />
        <Route path="mantenimientos" element={<Mantenimientos />} />
      </Route>
    </Routes>
  );
}
