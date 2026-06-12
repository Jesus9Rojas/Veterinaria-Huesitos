import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VetLogin from './pages/Login';
import ServiciosPage from './Modules/admin/pages/ServicioPage';
import AdminDashboard from './pages/AdminDashboard';
import RecepcionDashboard from './Modules/recepcion/pages/RecepcionDashboard';
import InicioRecepcion from './Modules/recepcion/pages/InicioRecepcion';
import CitasPage from './Modules/recepcion/pages/CitasPage';
import ClientesPage from './Modules/recepcion/pages/ClientesPage';
import CajaPage from './Modules/recepcion/pages/CajaPage';
import PuntoVentaPage from './Modules/recepcion/pages/PuntoVentaPage';
import VeterinarioDashboard from './Modules/veterinario/pages/VeterinarioDashboard';
import InicioVeterinario from './Modules/veterinario/pages/InicioVeterinario';
import MiAgendaPage from './Modules/veterinario/pages/MiAgendaPage';
import MisPacientesPage from './Modules/veterinario/pages/MisPacientesPage';
import HistorialClinicoPage from './Modules/veterinario/pages/HistorialClinicoPage';
import MisHorariosPage from './Modules/veterinario/pages/MisHorariosPage';
import MiPerfilPage from './Modules/veterinario/pages/MiPerfilPage';


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
        <Route path="/veterinario" element={<VeterinarioDashboard />}>
          <Route index element={<InicioVeterinario />} />
          <Route path="agenda" element={<MiAgendaPage />} />
          <Route path="pacientes" element={<MisPacientesPage />} />
          <Route path="pacientes/:id/historial" element={<HistorialClinicoPage />} />
          <Route path="horarios" element={<MisHorariosPage />} />
          <Route path="perfil" element={<MiPerfilPage />} />
        </Route>  
      </Routes>
    </Router>
  );
}
export default App;