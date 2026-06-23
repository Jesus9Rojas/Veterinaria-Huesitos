import { useState, useEffect } from 'react';
import { Clock, User, CalendarDays, Search, Activity, ChevronRight, Info } from 'lucide-react';
import { obtenerListaUsuarios } from '../../../services/usuarioService';
import { listarHorariosPorUsuario } from '../../../services/horarioService';

const HorariosMedicosPage = () => {
  const [veterinarios, setVeterinarios] = useState([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [vetSeleccionado, setVetSeleccionado] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchVets = async () => {
      try {
        const data = await obtenerListaUsuarios();
        if (isMounted) {
          setVeterinarios(data.filter(u => u.rol === 'VETERINARIO'));
        }
      } catch (error) {
        console.error("Error cargando veterinarios:", error);
      } finally {
        if (isMounted) setLoadingVets(false);
      }
    };
    fetchVets();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchHorarios = async () => {
      if (!vetSeleccionado) return;
      setLoadingHorarios(true);
      try {
        const data = await listarHorariosPorUsuario(vetSeleccionado.id);
        if (isMounted) setHorarios(data);
      } catch (error) {
        console.error("Error cargando horarios:", error);
        if (isMounted) setHorarios([]);
      } finally {
        if (isMounted) setLoadingHorarios(false);
      }
    };
    fetchHorarios();
    return () => { isMounted = false; };
  }, [vetSeleccionado]);

  const getNombre = (v) => v.nombreVisible || v.personal?.nombreCompleto || v.nombreCompleto || v.correo;

  const vetsFiltrados = veterinarios.filter(v => {
    const nombre = getNombre(v);
    return nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
           v.correo.toLowerCase().includes(busqueda.toLowerCase());
  });

  const ordenDias = { 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7 };
  const diasTraducidos = { 'MONDAY': 'Lunes', 'TUESDAY': 'Martes', 'WEDNESDAY': 'Miércoles', 'THURSDAY': 'Jueves', 'FRIDAY': 'Viernes', 'SATURDAY': 'Sábado', 'SUNDAY': 'Domingo' };

  const horariosOrdenados = [...horarios].sort((a, b) => ordenDias[a.diaSemana] - ordenDias[b.diaSemana]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Clock className="text-sky-500" /> Consulta de Horarios Médicos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Verifica la disponibilidad y turnos de los especialistas de la clínica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: LISTA DE MÉDICOS */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input 
                type="text" placeholder="Buscar especialista..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar p-3 space-y-2">
            {loadingVets ? (
              <div className="flex justify-center py-10"><Activity className="animate-spin text-sky-500" size={24}/></div>
            ) : vetsFiltrados.length === 0 ? (
              <p className="text-center text-sm font-bold text-slate-400 py-10">No se encontraron médicos.</p>
            ) : (
              vetsFiltrados.map(vet => (
                <button
                  key={vet.id}
                  onClick={() => setVetSeleccionado(vet)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group
                    ${vetSeleccionado?.id === vet.id 
                      ? 'bg-sky-50 border-sky-200 shadow-sm' 
                      : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${vetSeleccionado?.id === vet.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <User size={18}/>
                    </div>
                    <div className="truncate">
                      <p className={`text-sm font-black truncate ${vetSeleccionado?.id === vet.id ? 'text-sky-700' : 'text-slate-700'}`}>
                        Dr. {getNombre(vet)}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">{vet.correo}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className={vetSeleccionado?.id === vet.id ? 'text-sky-500' : 'text-slate-300'}/>
                </button>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: HORARIO DEL MÉDICO SELECCIONADO */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col h-[600px] overflow-hidden">
          {!vetSeleccionado ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
              <CalendarDays size={64} strokeWidth={1} className="mb-4 text-slate-300"/>
              <p className="text-lg font-black text-slate-600">Ningún médico seleccionado</p>
              <p className="text-sm">Selecciona un especialista de la lista para ver su horario de atención.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Dr. {getNombre(vetSeleccionado)}</h2>
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mt-1">Horario Oficial de Atención</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full border border-sky-100 flex items-center justify-center text-sky-500 shadow-sm">
                  <Clock size={24}/>
                </div>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
                {loadingHorarios ? (
                  <div className="flex justify-center py-20"><Activity className="animate-spin text-sky-500" size={32}/></div>
                ) : horariosOrdenados.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                    <Info size={32} className="mx-auto text-amber-400 mb-3"/>
                    <p className="text-sm font-bold text-slate-600">Este médico aún no tiene un horario registrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {horariosOrdenados.map(horario => (
                      <div key={horario.id} className={`p-5 rounded-2xl border transition-all ${horario.activo ? 'bg-white border-slate-200 shadow-sm hover:border-sky-300' : 'bg-slate-100 border-slate-200 opacity-60 grayscale'}`}>
                        <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                          <span className="font-black text-slate-700 uppercase tracking-wide">
                            {diasTraducidos[horario.diaSemana]}
                          </span>
                          {horario.activo ? (
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Labora</span>
                          ) : (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">No Labora</span>
                          )}
                        </div>
                        
                        {horario.activo ? (
                          <div className="flex items-center justify-center gap-3 bg-slate-50 py-3 rounded-xl border border-slate-100">
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Entrada</p>
                              <p className="text-lg font-black text-slate-800">{horario.horaEntrada.slice(0,5)}</p>
                            </div>
                            <div className="w-8 h-px bg-slate-300"></div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Salida</p>
                              <p className="text-lg font-black text-slate-800">{horario.horaSalida.slice(0,5)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-center text-sm font-bold text-slate-400 py-4">Día de Descanso</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HorariosMedicosPage;