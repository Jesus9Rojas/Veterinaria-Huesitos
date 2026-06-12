import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, PawPrint, HeartPulse, Clock, 
  UserCheck, Activity, ChevronRight, AlertCircle, ShieldAlert 
} from 'lucide-react';
import { obtenerCitasPorDia } from '../../../services/citaService';

const InicioVeterinario = () => {
  const navigate = useNavigate();
  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [correoVeterinario] = useState(localStorage.getItem('usuarioCorreo') || 'doctor@huesitos.com');

  useEffect(() => {
    let isMounted = true;
    const cargarAgendaDelDia = async () => {
      try {
        setLoading(true);
        const hoyStr = new Date().toISOString().split('T')[0];
        const data = await obtenerCitasPorDia(hoyStr);
        
        if (isMounted) {
          const misCitas = data.filter(cita => 
            cita.veterinario?.correo?.toLowerCase() === correoVeterinario.toLowerCase()
          );
          misCitas.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
          setCitasHoy(misCitas);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al cargar resumen del día:", error);
        if (isMounted) setLoading(false);
      }
    };

    if (correoVeterinario) {
      cargarAgendaDelDia();
    }
  }, [correoVeterinario]);

  // Cálculos dinámicos
  const totalPacientes = citasHoy.length;
  const enSalaDeEspera = citasHoy.filter(c => c.estado === 'EN_ESPERA').length;
  const completadas = citasHoy.filter(c => c.estado === 'COMPLETADA').length;
  const proximasCitas = citasHoy.filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA');

  // Lógica Dinámica para el Banner
  const horaActual = new Date().getHours();
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 18 ? 'Buenas tardes' : 'Buenas noches';
  const nombreDoctor = correoVeterinario.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* BANNER PRINCIPAL INNOVADOR Y CLÍNICO */}
      <div className="relative bg-slate-900 text-white p-8 sm:p-10 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
        {/* Efectos de luces y fondo de alta tecnología */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="space-y-5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black tracking-widest uppercase border border-emerald-500/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Guardia Activa
              </span>
              <span className="text-slate-400 text-sm font-semibold flex items-center gap-1.5 bg-slate-800/50 py-1.5 px-4 rounded-full border border-slate-700/50">
                <CalendarDays size={16} className="text-indigo-400" />
                {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {saludo}, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
                Dr. {nombreDoctor}
              </span> 🩺
            </h1>

            <p className="text-slate-300 text-base leading-relaxed font-medium max-w-xl">
              Su inteligencia clínica salva vidas. Supervise diagnósticos, optimice sus tiempos y brinde el mejor cuidado a cada paciente desde su monitor avanzado.
            </p>
          </div>

          {/* Monitor Lateral Integrado */}
          <div className="hidden lg:flex shrink-0">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md text-center min-w-[180px] shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <HeartPulse size={48} className="text-rose-500 mx-auto mb-3 drop-shadow-md" strokeWidth={1.5} />
              <p className="text-4xl font-black text-white drop-shadow-sm">{totalPacientes}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Pacientes Asignados</p>
            </div>
          </div>

        </div>
      </div>

      {/* METRICAS Y BOTONES DE ACCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div 
          onClick={() => navigate('/veterinario/agenda')}
          className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:border-indigo-400 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarDays size={26} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mi Agenda Hoy</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">
                {loading ? '...' : `${totalPacientes} Citas`}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
        </div>

        <div 
          onClick={() => navigate('/veterinario/agenda')}
          className={`bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300 cursor-pointer ${enSalaDeEspera > 0 ? 'border-amber-200 bg-amber-50/10 hover:border-amber-400' : 'border-slate-200/60 hover:border-indigo-400'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${enSalaDeEspera > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
              <Clock size={26} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">En Sala de Espera</p>
              <p className={`text-2xl font-black mt-0.5 ${enSalaDeEspera > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {loading ? '...' : `${enSalaDeEspera} En Espera`}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
        </div>

        <div 
          onClick={() => navigate('/veterinario/pacientes')}
          className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center justify-between group hover:border-emerald-400 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck size={26} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Atendidos Hoy</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">
                {loading ? '...' : `${completadas} Listos`}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </div>

      </div>

      {/* BLOQUE INFERIOR DIVIDIDO EN DOS SECCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA Y CENTRAL: EN SALA DE ESPERA Y PRÓXIMOS (OCUPA 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col min-h-[350px]">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 shrink-0">
            <Activity className="text-indigo-500" size={20} /> Flujo de Pacientes para Hoy
          </h2>

          <div className="flex-1 overflow-y-auto pt-4 space-y-3 custom-scrollbar">
            {loading ? (
              <p className="text-sm font-semibold text-indigo-500 animate-pulse text-center py-10">Cargando la cola médica...</p>
            ) : totalPacientes === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <PawPrint size={40} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">No tiene citas asignadas para hoy</p>
              </div>
            ) : (
              <>
                {/* 1. MUESTRA PRIMERO A LOS QUE YA LLEGARON Y ESTÁN ESPERANDO */}
                {citasHoy.filter(c => c.estado === 'EN_ESPERA').map(cita => {
                  const hora = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={cita.id} className="flex justify-between items-center bg-amber-50/60 border border-amber-200/70 p-4 rounded-2xl shadow-sm animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                          {hora}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">
                            {cita.mascota?.nombre} <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-1.5 py-0.5 rounded-full uppercase ml-1">{cita.mascota?.especie}</span>
                          </p>
                          <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">Motivo: {cita.motivo}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/veterinario/agenda')}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 transition-all shrink-0"
                      >
                        Atender Ahora
                      </button>
                    </div>
                  );
                })}

                {/* 2. MUESTRA LUEGO LOS PROGRAMADOS QUE AÚN NO LLEGAN */}
                {proximasCitas.map(cita => {
                  const hora = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={cita.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                          {hora}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-700 truncate">
                            {cita.mascota?.nombre} <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded-full uppercase ml-1">{cita.mascota?.especie}</span>
                          </p>
                          <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">{cita.servicio?.nombre}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-lg uppercase tracking-wide shrink-0">
                        {cita.estado}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RECOMENDACIONES Y RECORDATORIOS CLÍNICOS (OCUPA 1/3) */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <AlertCircle className="text-indigo-500" size={18} /> Recordatorios Médicos
            </h3>
            
            <div className="space-y-3 mt-4 text-xs font-semibold text-slate-600 leading-relaxed">
              <div className="flex gap-2 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <p>Recuerde registrar el peso y temperatura de la mascota en cada consulta para mantener curvas clínicas precisas.</p>
              </div>
              <div className="flex gap-2 p-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl">
                <HeartPulse size={16} className="shrink-0 mt-0.5" />
                <p>Al recetar medicamentos controlados, asegúrese de completar correctamente el campo de dosis en el módulo de recetas.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soporte Técnico</p>
            <p className="text-xs font-bold text-slate-600 mt-1">Cualquier inconveniente con la carga de historiales, comuníquese con el Área TI.</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InicioVeterinario;