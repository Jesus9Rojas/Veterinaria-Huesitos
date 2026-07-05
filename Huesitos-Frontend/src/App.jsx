import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sileo'; 

import Landing from './pages/Landing';
import VetLogin from './pages/Login';
import SolicitarRecuperacion from './pages/SolicitarRecuperacion';
import RestablecerPassword from './pages/RestablecerPassword';
import RegistroClientePage from './pages/RegistroClientePage';

import AdminDashboard from '../src/Modules/admin/pages/AdminDashboard';

import ClienteDashboard from './Modules/clientes/pages/ClienteDashboard';
import MisMascotasCliente from './Modules/clientes/pages/MisMascotasCliente';
import MisCitasCliente from './Modules/clientes/pages/MisCitasCliente';

import RecepcionDashboard from './Modules/recepcion/pages/RecepcionDashboard';
import InicioRecepcion from './Modules/recepcion/pages/InicioRecepcion';
import CitasPage from './Modules/recepcion/pages/CitasPage';
import HorariosMedicosPage from './Modules/recepcion/pages/HorariosMedicosPage';
import ClientesPage from './Modules/recepcion/pages/ClientesPage';
import CajaPage from './Modules/recepcion/pages/CajaPage';
import PuntoVentaPage from './Modules/recepcion/pages/PuntoVentaPage';
import RecepcionPerfilPage from './Modules/recepcion/pages/RecepcionPerfilPage'; 

import VeterinarioDashboard from './Modules/veterinario/pages/VeterinarioDashboard';
import InicioVeterinario from './Modules/veterinario/pages/InicioVeterinario';
import MiAgendaPage from './Modules/veterinario/pages/MiAgendaPage';
import MisPacientesPage from './Modules/veterinario/pages/MisPacientesPage';
import HistorialClinicoPage from './Modules/veterinario/pages/HistorialClinicoPage';
import MisHorariosPage from './Modules/veterinario/pages/MisHorariosPage';
import MiPerfilPage from './Modules/veterinario/pages/MiPerfilPage';
import ConsultasVeterinarioPage from './Modules/veterinario/pages/ConsultasVeterinarioPage';

import AuxiliarDashboard from '../src/Modules/auxiliar/pages/AuxiliarDashboard';

function App() {
  return (
    <>
      <div className="!z-[99999] relative" style={{ zIndex: 99999 }}>
        <Toaster 
          position="top-right" 
          theme="dark" 
          className="!z-[99999]"
          style={{ zIndex: 99999 }}
          options={{ 
            fill: "#020617", 
            roundness: 16, 
            styles: { 
              title: "!text-white font-black tracking-wide", 
              description: "!text-slate-300", 
              badge: "!bg-slate-800", 
              button: "!bg-slate-800 hover:!bg-slate-700 !text-white" 
            } 
          }} 
        />
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<VetLogin />} />
          <Route path="/registro" element={<RegistroClientePage />} />
          
          <Route path="/recuperar-cuenta" element={<SolicitarRecuperacion />} />
          <Route path="/restablecer-password" element={<RestablecerPassword />} />
          
          <Route path="/cliente" element={<ClienteDashboard />}>
            <Route index element={<MisMascotasCliente />} />
            <Route path="mascotas" element={<MisMascotasCliente />} />
            <Route path="citas" element={<MisCitasCliente />} />
          </Route>

          <Route path="/admin" element={<AdminDashboard />} />
          
          <Route path="/recepcion" element={<RecepcionDashboard />}>
            <Route index element={<InicioRecepcion />} /> 
            <Route path="citas" element={<CitasPage />} />
            <Route path="horarios" element={<HorariosMedicosPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="caja" element={<CajaPage />} />
            <Route path="tienda" element={<PuntoVentaPage />} /> 
            <Route path="perfil" element={<RecepcionPerfilPage />} />
          </Route>
          
          <Route path="/veterinario" element={<VeterinarioDashboard />}>
            <Route index element={<InicioVeterinario />} />
            <Route path="agenda" element={<MiAgendaPage />} />
            <Route path="pacientes" element={<MisPacientesPage />} />
            <Route path="pacientes/:id/historial" element={<HistorialClinicoPage />} />
            <Route path="horarios" element={<MisHorariosPage />} />
            <Route path="consultas" element={<ConsultasVeterinarioPage />} />
            <Route path="perfil" element={<MiPerfilPage />} />
          </Route>

          <Route path="/auxiliar/*" element={<AuxiliarDashboard />} />  
        </Routes>
      </Router>
    </>
  );
}

export default App;