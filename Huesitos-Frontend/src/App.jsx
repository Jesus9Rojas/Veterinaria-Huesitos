import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VetLogin from './pages/Login';
import ServiciosPage from './pages/ServicioPage';
import AdminDashboard from './pages/AdminDashboard';
import RecepcionDashboard from './Modules/recepcion/pages/RecepcionDashboard';
import InicioRecepcion from './Modules/recepcion/pages/InicioRecepcion';
import CitasPage from './Modules/recepcion/pages/CitasPage';
import ClientesPage from './Modules/recepcion/pages/ClientesPage';
import CajaPage from './Modules/recepcion/pages/CajaPage';
import PuntoVentaPage from './Modules/recepcion/pages/PuntoVentaPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/servicios" element={<ServiciosPage/>} />
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<VetLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/recepcion" element={<RecepcionDashboard />}>
        <Route index element={<InicioRecepcion />} /> 
        <Route path="citas" element={<CitasPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="caja" element={<CajaPage />} />
        <Route path="tienda" element={<PuntoVentaPage />} /> 
        </Route>  
      </Routes>
    </Router>
  );
}
export default App;