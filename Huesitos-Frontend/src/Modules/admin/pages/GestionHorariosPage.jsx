import { useState, useEffect } from 'react';
import { CalendarDays, Clock, User, Save, Trash2, Activity, CalendarClock, AlertCircle, Check, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { listarHorariosPorUsuario, crearHorario, eliminarHorario } from '../../../services/horarioService';

const Toast = Swal.mixin({ toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });

const GestionHorariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [busquedaPersonal, setBusquedaPersonal] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');

  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [form, setForm] = useState({
    horaEntrada: '',
    horaSalida: ''
  });

  const diasSemana = [
    { value: 'MONDAY', label: 'Lunes', corto: 'Lun' },
    { value: 'TUESDAY', label: 'Martes', corto: 'Mar' },
    { value: 'WEDNESDAY', label: 'Miércoles', corto: 'Mié' },
    { value: 'THURSDAY', label: 'Jueves', corto: 'Jue' },
    { value: 'FRIDAY', label: 'Viernes', corto: 'Vie' },
    { value: 'SATURDAY', label: 'Sábado', corto: 'Sáb' },
    { value: 'SUNDAY', label: 'Domingo', corto: 'Dom' }
  ];

  useEffect(() => {
    let isMounted = true;
    const cargarUsuarios = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
        const res = await axios.get('http://localhost:8080/api/usuarios', { headers });
        if (isMounted) {
          const personalClinica = res.data.filter(u => u.activo === true && u.rol !== 'CLIENTE');
          setUsuarios(personalClinica);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        Toast.fire({ icon: 'error', title: 'Error al cargar la lista del personal' });
      }
    };
    cargarUsuarios();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const cargarHorariosUsuario = async () => {
      if (!usuarioSeleccionado) {
        setHorarios([]);
        return;
      }
      setLoadingHorarios(true);
      try {
        const data = await listarHorariosPorUsuario(usuarioSeleccionado);
        if (isMounted) setHorarios(data);
      } catch (error) {
        console.error("Error al cargar horarios:", error);
      } finally {
        if (isMounted) setLoadingHorarios(false);
      }
    };
    cargarHorariosUsuario();
    return () => { isMounted = false; };
  }, [usuarioSeleccionado]);

  const toggleDia = (diaValue) => {
    if (diasSeleccionados.includes(diaValue)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== diaValue));
    } else {
      setDiasSeleccionados([...diasSeleccionados, diaValue]);
    }
  };

  const handleGuardarHorario = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado) {
      return Toast.fire({ icon: 'warning', title: 'Selecciona un miembro del personal primero' });
    }
    if (diasSeleccionados.length === 0) {
      return Toast.fire({ icon: 'warning', title: 'Selecciona al menos un día para aplicar el horario' });
    }

    setProcesando(true);
    try {
      const promesasGuardado = diasSeleccionados.map(dia => {
        // AHORA PASAMOS EL USUARIO SELECCIONADO CORRECTAMENTE AL SERVICIO
        return crearHorario(usuarioSeleccionado, {
          diaSemana: dia,
          horaEntrada: form.horaEntrada,
          horaSalida: form.horaSalida
        });
      });

      await Promise.all(promesasGuardado);
      Toast.fire({ icon: 'success', title: `Se asignaron ${diasSeleccionados.length} turnos correctamente` });
      
      setDiasSeleccionados([]);
      setForm({ horaEntrada: '', horaSalida: '' });
      const dataActualizada = await listarHorariosPorUsuario(usuarioSeleccionado);
      setHorarios(dataActualizada);

    } catch (error) {
      console.error(error);
      Toast.fire({ icon: 'error', title: 'Error al guardar. Verifica la conexión con el servidor.' });
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminarHorario = async (id) => {
    Swal.fire({
      title: '¿Eliminar turno?',
      text: "El empleado ya no estará agendado para este bloque de horas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarHorario(id);
          setHorarios(horarios.filter(h => h.id !== id));
          Toast.fire({ icon: 'success', title: 'Turno eliminado' });
        } catch (error) {
          console.error(error);
          Toast.fire({ icon: 'error', title: 'Error al eliminar el turno' });
        }
      }
    });
  };

  const formatoHora = (horaArray) => {
    if (!horaArray) return '--:--';
    if (Array.isArray(horaArray)) {
      const hh = String(horaArray[0]).padStart(2, '0');
      const mm = String(horaArray[1] || 0).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    return horaArray;
  };

  const mapeoDias = {
    'MONDAY': { nombre: 'Lunes', orden: 1, col: 'bg-sky-50 text-sky-700 border-sky-200' },
    'TUESDAY': { nombre: 'Martes', orden: 2, col: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'WEDNESDAY': { nombre: 'Miércoles', orden: 3, col: 'bg-violet-50 text-violet-700 border-violet-200' },
    'THURSDAY': { nombre: 'Jueves', orden: 4, col: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
    'FRIDAY': { nombre: 'Viernes', orden: 5, col: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'SATURDAY': { nombre: 'Sábado', orden: 6, col: 'bg-amber-50 text-amber-700 border-amber-200' },
    'SUNDAY': { nombre: 'Domingo', orden: 7, col: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const horariosOrdenados = [...horarios].sort((a, b) => 
    (mapeoDias[a.diaSemana]?.orden || 0) - (mapeoDias[b.diaSemana]?.orden || 0)
  );

  const rolesUnicos = ['TODOS', ...new Set(usuarios.map(u => u.rol))];
  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusqueda = u.nombreVisible?.toLowerCase().includes(busquedaPersonal.toLowerCase());
    const matchRol = filtroRol === 'TODOS' || u.rol === filtroRol;
    return matchBusqueda && matchRol;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarClock className="text-indigo-500" /> Asignación de Turnos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configura la disponibilidad horaria del personal y médicos de manera interactiva.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
            <h2 className="font-black text-slate-700 mb-4 flex items-center gap-2 border-b pb-3">
              <User size={18} className="text-indigo-500"/> 1. Seleccionar Personal
            </h2>
            
            <div className="space-y-3 mb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre..." 
                  value={busquedaPersonal}
                  onChange={e => setBusquedaPersonal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="relative w-full">
                <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
                <select 
                  value={filtroRol} 
                  onChange={e => setFiltroRol(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  {rolesUnicos.map(rol => (
                    <option key={rol} value={rol}>{rol === 'TODOS' ? 'Todos los roles' : rol.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl custom-scrollbar bg-slate-50/50">
              {usuariosFiltrados.length === 0 ? (
                <p className="text-center text-xs text-slate-400 p-4 font-bold">No se encontraron empleados.</p>
              ) : (
                usuariosFiltrados.map(u => (
                  <div 
                    key={u.id} 
                    onClick={() => setUsuarioSeleccionado(u.id)}
                    className={`p-3 border-b border-slate-100 cursor-pointer transition-colors flex justify-between items-center ${
                      usuarioSeleccionado === u.id 
                      ? 'bg-indigo-50 border-l-4 border-l-indigo-500' 
                      : 'hover:bg-white'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className={`font-bold text-sm truncate ${usuarioSeleccionado === u.id ? 'text-indigo-800' : 'text-slate-700'}`}>
                        {u.nombreVisible}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                        {u.rol.replace('_', ' ')}
                      </p>
                    </div>
                    {usuarioSeleccionado === u.id && <Check size={16} className="text-indigo-500 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleGuardarHorario} className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 transition-opacity ${!usuarioSeleccionado ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <h2 className="font-black text-slate-700 mb-4 flex items-center gap-2 border-b pb-3">
              <Clock size={18} className="text-emerald-500"/> 2. Asignación Masiva
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Días a aplicar (Múltiple)</label>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map(d => (
                    <button
                      type="button"
                      key={d.value}
                      onClick={() => toggleDia(d.value)}
                      className={`flex-1 min-w-[60px] py-2 px-1 rounded-xl text-xs font-black transition-all border ${
                        diasSeleccionados.includes(d.value) 
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20 scale-105' 
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      {d.corto}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Hora Entrada</label>
                  <input required type="time" value={form.horaEntrada} onChange={e => setForm({...form, horaEntrada: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Hora Salida</label>
                  <input required type="time" value={form.horaSalida} onChange={e => setForm({...form, horaSalida: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <button type="submit" disabled={procesando} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg transition-all w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                {procesando ? <Activity className="animate-spin" size={18}/> : <Save size={18}/>}
                Guardar {diasSeleccionados.length > 0 ? diasSeleccionados.length : ''} Turno(s)
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8 min-h-[500px] flex flex-col">
          <h2 className="text-lg font-black text-slate-700 mb-6 flex items-center gap-2 border-b pb-4">
            <CalendarDays className="text-sky-500" /> Calendario Asignado
          </h2>

          {!usuarioSeleccionado ? (
            <div className="flex-1 flex flex-col justify-center items-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <User size={48} className="mb-3 text-slate-300" />
              <p className="font-bold text-center px-4">Selecciona a un empleado en la lista de la izquierda para ver sus horarios</p>
            </div>
          ) : loadingHorarios ? (
            <div className="flex-1 flex flex-col justify-center items-center text-indigo-500">
              <Activity className="animate-spin mb-3" size={32} />
              <p className="font-bold">Cargando turnos...</p>
            </div>
          ) : horariosOrdenados.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-amber-500 bg-amber-50 rounded-2xl border border-dashed border-amber-200 p-6 text-center">
              <AlertCircle size={48} className="mb-3 opacity-50" />
              <p className="font-black text-lg text-amber-700">Sin Turnos</p>
              <p className="font-medium text-amber-600 mt-1">Este empleado no tiene ningún horario configurado en el sistema.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {horariosOrdenados.map((h) => {
                const infoDia = mapeoDias[h.diaSemana] || { nombre: h.diaSemana, col: 'bg-slate-50 text-slate-700 border-slate-200' };
                
                return (
                  <div key={h.id} className={`p-4 rounded-2xl border ${infoDia.col} relative group transition-all hover:shadow-md`}>
                    
                    <button 
                      onClick={() => handleEliminarHorario(h.id)}
                      className="absolute top-3 right-3 p-1.5 bg-white text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      title="Eliminar este turno"
                    >
                      <Trash2 size={16} />
                    </button>

                    <p className="font-black text-lg uppercase tracking-wide mb-3 pr-8 flex items-center gap-2">
                      {infoDia.nombre} <Check className="opacity-50" size={16}/>
                    </p>
                    
                    <div className="space-y-2 bg-white/60 p-3 rounded-xl backdrop-blur-sm border border-white">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Entrada</span>
                        <span className="font-black text-sm">{formatoHora(h.horaEntrada)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                        <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Salida</span>
                        <span className="font-black text-sm">{formatoHora(h.horaSalida)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GestionHorariosPage;