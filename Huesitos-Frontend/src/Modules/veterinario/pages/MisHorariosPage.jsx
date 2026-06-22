import { useState, useEffect } from 'react';
import { Clock, Calendar, Activity, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import { listarHorariosPorUsuario } from '../../../services/horarioService';

const MisHorariosPage = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [usuarioId] = useState(() => {
    let id = localStorage.getItem('usuarioId') || localStorage.getItem('id');
    
    if (!id) {
      try {
        const userObj = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (userObj && userObj.id) id = userObj.id;
      } catch (error) {
        console.debug("No se pudo parsear el objeto de usuario.", error);
      }
    }
    
    if (!id) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          id = payload.id || payload.usuarioId;
        }
      } catch (error) {
        console.debug("No se pudo decodificar el token.", error);
      }
    }
    
    return id;
  });

  const [usuarioNombre] = useState(localStorage.getItem('usuarioNombre') || localStorage.getItem('nombre') || 'Doctor(a)');

  useEffect(() => {
    let isMounted = true;
    
    const fetchHorarios = async () => {
      try {
        setLoading(true);
        if (usuarioId) {
          const data = await listarHorariosPorUsuario(usuarioId);
          if (isMounted) setHorarios(data);
        } else {
          console.error("No se pudo obtener el ID del usuario.");
        }
      } catch (error) {
        console.error("Error al cargar horarios desde el backend:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHorarios();
    
    return () => { isMounted = false; };
  }, [usuarioId]);

  const diasSemana = {
    'MONDAY': { nombre: 'Lunes', orden: 1 },
    'TUESDAY': { nombre: 'Martes', orden: 2 },
    'WEDNESDAY': { nombre: 'Miércoles', orden: 3 },
    'THURSDAY': { nombre: 'Jueves', orden: 4 },
    'FRIDAY': { nombre: 'Viernes', orden: 5 },
    'SATURDAY': { nombre: 'Sábado', orden: 6 },
    'SUNDAY': { nombre: 'Domingo', orden: 7 }
  };

  const horariosOrdenados = [...horarios]
    .filter(h => diasSemana[h.diaSemana] !== undefined)
    .sort((a, b) => diasSemana[a.diaSemana].orden - diasSemana[b.diaSemana].orden);

  const formatHora = (horaString) => {
    if (!horaString) return '--:--';
    let date = new Date(`2000-01-01T${horaString}`);
    if (isNaN(date.getTime())) {
        if (Array.isArray(horaString)){
           date = new Date();
           date.setHours(horaString[0] || 0, horaString[1] || 0, 0);
        } else {
           return horaString; 
        }
    }
    return date.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* BANNER SUPERIOR */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <CalendarDays className="text-sky-500" size={32} /> Cuadro de Turnos
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto md:mx-0">
            Horarios asignados por la administración clínica. Durante estos bloques vigentes, el módulo de recepción mantendrá activa la asignación automatizada de citas para sus pacientes.
          </p>
        </div>

        <div className="relative z-10 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-center shrink-0 min-w-[200px] shadow-lg">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Personal Médico</p>
          <p className="text-base font-black tracking-tight text-sky-400 capitalize">{usuarioNombre}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-6 md:p-8 min-h-[400px]">
        
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Clock className="text-sky-500" size={20}/>
          <h2 className="text-lg font-black text-slate-800">Mi Disponibilidad Semanal</h2>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 text-sky-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={36} />
            <p className="text-sm font-bold">Sincronizando grilla horaria...</p>
          </div>
        ) : !usuarioId ? (
          <div className="flex flex-col justify-center items-center h-48 text-rose-500 bg-rose-50 rounded-3xl border border-rose-200 p-6 text-center">
            <AlertCircle size={40} className="mb-2" />
            <p className="text-base font-black">Problema de Sesión</p>
            <p className="text-xs max-w-md mt-1 font-medium text-rose-600">
              El sistema no pudo identificar su ID de usuario. Por favor, <strong>Cierre sesión e inicie nuevamente</strong> para actualizar sus credenciales.
            </p>
          </div>
        ) : horariosOrdenados.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-slate-400 bg-slate-50 rounded-3xl border border-slate-200/50 border-dashed p-6">
            <Calendar size={48} className="mb-4 text-slate-300" />
            <p className="text-xl font-black text-slate-600">Sin Horarios Configurados</p>
            <p className="text-xs mt-1 max-w-sm text-center font-medium">Usted no registra turnos activos para esta semana. Solicite al Administrador la asignación de su carga horaria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {horariosOrdenados.map((horario) => {
              const infoDia = diasSemana[horario.diaSemana];
              
              return (
                <div key={horario.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-sky-300 group flex flex-col h-full">
                  
                  {/* Cabecera de la Tarjeta */}
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <span className="text-lg font-black text-slate-800 uppercase tracking-wide group-hover:text-sky-600 transition-colors">
                      {infoDia.nombre}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-sky-500" />
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta (Horas) */}
                  <div className="space-y-3 p-1 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={14}/> Entrada
                      </span>
                      <span className="text-sm font-black text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {formatHora(horario.horaEntrada)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={14}/> Salida
                      </span>
                      <span className="text-sm font-black text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {formatHora(horario.horaSalida)}
                      </span>
                    </div>
                  </div>

                  {/* Pie de la Tarjeta */}
                  <div className="mt-5 text-center pt-4 border-t border-slate-50">
                    <span className="inline-block px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      Turno Vigente
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default MisHorariosPage;