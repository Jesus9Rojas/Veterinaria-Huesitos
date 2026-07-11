import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  Search, Users, Activity, X, PawPrint, 
  User, Mail, Smartphone, Weight, CalendarDays, ShieldAlert, HeartPulse 
} from 'lucide-react';
import { listarTodasMascotas } from '../../../services/mascotaService';
import PacienteCard from '../components/PacienteCard';

const MisPacientesPage = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalPerfilOpen, setModalPerfilOpen] = useState(false);
  const [pacienteActivo, setPacienteActivo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        const data = await listarTodasMascotas();
        if (isMounted) {
          data.sort((a, b) => a.nombre.localeCompare(b.nombre));
          setPacientes(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
        if (isMounted) setLoading(false);
      }
    };
    fetchPacientes();
    return () => { isMounted = false; };
  }, []);

  const pacientesFiltrados = pacientes.filter(p => {
    const termino = busqueda.toLowerCase();
    const nombreMascota = p.nombre?.toLowerCase() || '';
    const nombreDueno = (p.dueno?.nombreCompleto || p.dueno?.nombreCompleto || '').toLowerCase();
    
    return nombreMascota.includes(termino) || nombreDueno.includes(termino);
  });

  const abrirFichaPaciente = (paciente) => {
    setPacienteActivo(paciente);
    setModalPerfilOpen(true);
  };

  const irAlHistorial = () => {
    setModalPerfilOpen(false);
    navigate(`/veterinario/pacientes/${pacienteActivo.id}/historial`);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'Edad desconocida';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad === 0 ? 'Menos de 1 año' : `${edad} año(s)`;
  };

  const pesoMascota = pacienteActivo?.pesoActual || pacienteActivo?.peso;
  const nombreDueno = pacienteActivo?.dueno?.nombreCompleto || pacienteActivo?.dueno?.nombreCompleto || 'No registrado';
  const telefonoDueno = pacienteActivo?.dueno?.telefono || pacienteActivo?.dueno?.telefono || 'No registrado';

  const correoDueno = pacienteActivo?.dueno?.usuario?.correo || 
                      pacienteActivo?.dueno?.usuario?.correo || 
                      pacienteActivo?.dueno?.correo || 
                      pacienteActivo?.dueno?.correo || 
                      'No registrado';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA Y BUSCADOR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 w-full lg:w-auto text-center lg:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3 justify-center lg:justify-start">
            <Users className="text-indigo-500" size={32} /> Directorio de Pacientes
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto lg:mx-0">
            Busque rápidamente a cualquier paciente por su nombre o el de su dueño para revisar su ficha técnica y acceder a su historial clínico.
          </p>
        </div>

        <div className="relative z-10 w-full lg:w-96 shrink-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar paciente o dueño..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 rounded-2xl text-base font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {pacientesFiltrados.length} Resultados
            </span>
          </div>
        </div>
      </div>

      {/* GRILLA DE PACIENTES */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 text-indigo-500 font-semibold animate-pulse gap-3 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          <Activity className="animate-spin" size={36} />
          <p>Cargando base de datos de pacientes...</p>
        </div>
      ) : pacientesFiltrados.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          <PawPrint size={48} className="mb-4 text-slate-300" />
          <p className="text-xl font-black text-slate-600">No se encontraron pacientes</p>
          <p className="text-sm mt-1">Intente con otro término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pacientesFiltrados.map(paciente => (
            <PacienteCard 
              key={paciente.id} 
              paciente={paciente} 
              onVerPerfil={abrirFichaPaciente} 
            />
          ))}
        </div>
      )}

      {/* ================= MODAL: FICHA TÉCNICA DEL PACIENTE ================= */}
      {modalPerfilOpen && pacienteActivo && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalPerfilOpen(false)}></div>
          <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Cabecera del Modal */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <HeartPulse className="text-rose-500" /> Ficha Técnica Resumida
              </h3>
              <button type="button" onClick={() => setModalPerfilOpen(false)} className="text-slate-400 hover:text-slate-800 hover:bg-slate-200 p-2 rounded-xl transition-all"><X size={20}/></button>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-32 h-32 rounded-3xl bg-indigo-50 text-indigo-500 border-4 border-white shadow-lg shadow-indigo-500/20 flex items-center justify-center font-black text-5xl shrink-0 overflow-hidden ring-1 ring-slate-100">
                  {pacienteActivo.fotoUrl && pacienteActivo.fotoUrl !== "/uploads/defecto-mascota.png" ? (
                    <img src={pacienteActivo.fotoUrl} alt={pacienteActivo.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <PawPrint size={48} className="opacity-50" />
                  )}
                </div>
                <div className="text-center sm:text-left space-y-3 pt-2">
                  <h2 className="text-3xl font-black text-slate-800 leading-none">{pacienteActivo.nombre}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-indigo-200">
                      {pacienteActivo.especie}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-slate-200">
                      {pacienteActivo.sexo || 'Sexo N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Biometría */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/60">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Biometría del Paciente</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <CalendarDays size={18} className="mx-auto text-sky-500 mb-1" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Edad</p>
                    <p className="text-sm font-black text-slate-700">{calcularEdad(pacienteActivo.fechaNacimiento)}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <Weight size={18} className="mx-auto text-amber-500 mb-1" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Peso</p>
                    <p className="text-sm font-black text-slate-700">
                      {pesoMascota ? `${pesoMascota} Kg` : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center col-span-2">
                    <PawPrint size={18} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Raza</p>
                    <p className="text-sm font-black text-slate-700 truncate" title={pacienteActivo.raza}>{pacienteActivo.raza || 'Mixta'}</p>
                  </div>
                </div>

                {/* Notas / Alergias */}
                {(pacienteActivo.alergias || pacienteActivo.alertasMedicas) && (
                  <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3">
                    <ShieldAlert className="text-red-500 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-black text-red-800 uppercase tracking-widest">Alertas / Alergias</p>
                      <p className="text-sm font-semibold text-red-600 mt-1">{pacienteActivo.alergias || pacienteActivo.alertasMedicas}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tutor / Responsable */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tutor / Responsable</h4>
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0"><User size={20}/></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</p>
                        <p className="text-sm font-black text-slate-800">{nombreDueno}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Smartphone size={12}/> Celular</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{telefonoDueno}</p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mail size={12}/> Correo Electrónico</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5 truncate" title={correoDueno}>
                        {correoDueno}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTÓN MAESTRO AL HISTORIAL CLÍNICO */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <button 
                onClick={irAlHistorial}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Activity size={24} /> Abrir Historial Clínico Completo
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                Consultas, Recetas, Vacunas y Exámenes
              </p>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default MisPacientesPage;