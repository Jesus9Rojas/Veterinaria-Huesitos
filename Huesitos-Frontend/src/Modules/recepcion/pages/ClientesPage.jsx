import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, Search, UserPlus, PawPrint, ChevronRight, X, Phone, 
  MapPin, Mail, Weight, CalendarDays, Activity, ShieldAlert, CheckCircle2, Lock, Plus 
} from 'lucide-react';
import { sileo } from 'sileo';
import { obtenerListaDuenos, crearNuevoDueno } from '../../../services/duenoService';
import { obtenerMascotasPorDueno, crearMascota } from '../../../services/mascotaService';

const ClientesPage = () => {
  const [duenos, setDuenos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [triggerRecarga, setTriggerRecarga] = useState(0); 

  const [modalDuenoOpen, setModalDuenoOpen] = useState(false);
  const [guardandoDueno, setGuardandoDueno] = useState(false);
  
  const [formDueno, setFormDueno] = useState({
    nombreCompleto: '', telefono: '', correo: '', direccion: '', contrasena: ''
  });

  const [modalMascotasOpen, setModalMascotasOpen] = useState(false);
  const [duenoSeleccionado, setDuenoSeleccionado] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [loadingMascotas, setLoadingMascotas] = useState(false);
  
  const [mostrandoFormMascota, setMostrandoFormMascota] = useState(false);
  const [guardandoMascota, setGuardandoMascota] = useState(false);
  
  const [formMascota, setFormMascota] = useState({
    nombre: '', especie: 'Perro', raza: '', sexo: 'Macho', fechaNacimiento: '', pesoActual: '', alertasMedicas: ''
  });

  useEffect(() => {
    let isMounted = true;
    const extraerDuenos = async () => {
      try {
        const data = await obtenerListaDuenos();
        if (isMounted) {
          data.sort((a, b) => b.id - a.id);
          setDuenos(data);
          setLoading(false); 
        }
      } catch (error) {
        console.error("Error al cargar dueños:", error);
        if (isMounted) setLoading(false);
      }
    };
    
    extraerDuenos();
    
    return () => { isMounted = false; };
  }, [triggerRecarga]);

  const duenosFiltrados = duenos.filter(d => 
    d.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) || 
    d.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.telefono?.includes(busqueda)
  );

  const handleGuardarDueno = async (e) => {
    e.preventDefault();
    setGuardandoDueno(true);
    try {
      const peticion = crearNuevoDueno(formDueno);

      sileo.promise(peticion, {
        loading: { title: 'Registrando cliente...' },
        success: { title: '¡Éxito!', description: 'El cliente fue registrado correctamente' },
        error: { title: 'Error', description: 'Es posible que el correo ya exista.' }
      });

      await peticion;
      setModalDuenoOpen(false);
      setFormDueno({ nombreCompleto: '', telefono: '', correo: '', direccion: '', contrasena: '' });
      
      setLoading(true);
      setTriggerRecarga(prev => prev + 1); 
    } catch (error) {
      console.error("Error al guardar dueño:", error);
    } finally {
      setGuardandoDueno(false);
    }
  };

  const abrirPanelMascotas = async (dueno) => {
    setDuenoSeleccionado(dueno);
    setMostrandoFormMascota(false);
    setModalMascotasOpen(true);
    setLoadingMascotas(true);
    try {
      const data = await obtenerMascotasPorDueno(dueno.id);
      setMascotas(data);
    } catch (error) {
      console.error("Error cargando mascotas:", error);
    } finally {
      setLoadingMascotas(false);
    }
  };

  const handleGuardarMascota = async (e) => {
    e.preventDefault();
    setGuardandoMascota(true);
    try {
      const payload = {
        nombre: formMascota.nombre,
        especie: formMascota.especie,
        raza: formMascota.raza,
        sexo: formMascota.sexo, 
        fechaNacimiento: formMascota.fechaNacimiento,
        pesoActual: parseFloat(formMascota.pesoActual),
        alertasMedicas: formMascota.alertasMedicas || "Ninguna",
        fotoUrl: "/uploads/defecto-mascota.png", 
        dueno: { id: duenoSeleccionado.id } 
      };

      const peticion = crearMascota(payload);

      sileo.promise(peticion, {
        loading: { title: 'Registrando mascota...' },
        success: { title: '¡Mascota registrada!', description: 'El paciente fue vinculado a su dueño.' },
        error: (err) => ({
          title: 'Error de Servidor',
          description: err.response?.data?.message || err.response?.data || err.message
        })
      });

      await peticion;
      
      const data = await obtenerMascotasPorDueno(duenoSeleccionado.id);
      setMascotas(data);
      
      setMostrandoFormMascota(false);
      setFormMascota({ nombre: '', especie: 'Perro', raza: '', sexo: 'Macho', fechaNacimiento: '', pesoActual: '', alertasMedicas: '' });
    } catch (error) {
      console.error("Error guardando mascota completo:", error);
    } finally {
      setGuardandoMascota(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA Y BUSCADOR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-blue-500" /> Admisión de Pacientes
          </h1>
          <p className="text-slate-500 text-sm mt-1">Busca y registra clientes y sus mascotas.</p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo o celular..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={() => setModalDuenoOpen(true)}
            className="shrink-0 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <UserPlus size={20} /> <span className="hidden sm:inline">Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-blue-500 font-semibold animate-pulse gap-3">
            <Activity className="animate-spin" size={32} />
            <p>Cargando cartera de clientes...</p>
          </div>
        ) : duenosFiltrados.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/50">
            <Users size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-500">No se encontraron clientes</p>
            <p className="text-sm">Registra un nuevo cliente para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Dirección</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {duenosFiltrados.map((dueno) => (
                  <tr key={dueno.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800 text-base">{dueno.nombreCompleto}</div>
                      <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5"><Phone size={14} className="text-blue-400"/>{dueno.telefono}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Mail size={14} className="text-blue-400"/>{dueno.correo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 font-medium flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400"/> {dueno.direccion}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => abrirPanelMascotas(dueno)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 font-bold rounded-xl transition-colors"
                      >
                        <PawPrint size={16} /> Ver Mascotas <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: REGISTRAR NUEVO DUEÑO */}
      {modalDuenoOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalDuenoOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <UserPlus className="text-blue-500" /> Registrar Cliente
              </h3>
              <button type="button" onClick={() => setModalDuenoOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleGuardarDueno} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo</label>
                <input required type="text" value={formDueno.nombreCompleto} onChange={e => setFormDueno({...formDueno, nombreCompleto: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Ej. Juan Pérez" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono (Celular)</label>
                  <input required type="text" value={formDueno.telefono} onChange={e => setFormDueno({...formDueno, telefono: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="999 888 777" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contraseña de Acceso</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input required type="text" value={formDueno.contrasena} onChange={e => setFormDueno({...formDueno, contrasena: e.target.value})} className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Contraseña inicial" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico</label>
                <input required type="email" value={formDueno.correo} onChange={e => setFormDueno({...formDueno, correo: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="ejemplo@correo.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Dirección Exacta</label>
                <input required type="text" value={formDueno.direccion} onChange={e => setFormDueno({...formDueno, direccion: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Calle, Número, Distrito" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalDuenoOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={guardandoDueno} className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
                  {guardandoDueno ? 'Guardando...' : <><CheckCircle2 size={18}/> Guardar Cliente</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: GESTIÓN DE MASCOTAS POR DUEÑO */}
      {modalMascotasOpen && duenoSeleccionado && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalMascotasOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-800 text-white">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <PawPrint className="text-sky-400" /> Mascotas de {duenoSeleccionado.nombreCompleto}
                </h3>
                <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-2">
                  <Phone size={14}/> {duenoSeleccionado.telefono} | <Mail size={14}/> {duenoSeleccionado.correo}
                </p>
              </div>
              <button type="button" onClick={() => setModalMascotasOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-700 p-2 rounded-xl"><X size={20}/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              
              {!mostrandoFormMascota ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-700">Pacientes Registrados ({mascotas.length})</h4>
                    <button 
                      onClick={() => setMostrandoFormMascota(true)}
                      className="shrink-0 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Plus size={16}/> Agregar Mascota
                    </button>
                  </div>

                  {loadingMascotas ? (
                    <div className="text-center py-10 text-emerald-500 animate-pulse font-bold">Cargando pacientes...</div>
                  ) : mascotas.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                      <PawPrint size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-semibold">Este cliente aún no tiene mascotas registradas.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mascotas.map(mascota => {
                        const edadCalculada = mascota.fechaNacimiento 
                          ? (new Date().getFullYear() - new Date(mascota.fechaNacimiento).getFullYear()) 
                          : 'N/A';
                        
                        return (
                          <div key={mascota.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-50"></div>
                            
                            <h5 className="text-xl font-black text-slate-800 mb-1">{mascota.nombre}</h5>
                            <p className="text-sm font-bold text-emerald-600 mb-4">{mascota.especie} - {mascota.raza}</p>
                            
                            <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                              {mascota.sexo && (
                                <p className="flex items-center gap-1.5"><Activity size={14} className="text-slate-400"/> {mascota.sexo}</p>
                              )}
                              <p className="flex items-center gap-1.5"><CalendarDays size={14} className="text-slate-400"/> {edadCalculada} años</p>
                              <p className="flex items-center gap-1.5"><Weight size={14} className="text-slate-400"/> {mascota.pesoActual} kg</p>
                            </div>
                            
                            {mascota.alertasMedicas && mascota.alertasMedicas !== "Ninguna" && (
                              <div className="mt-4 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-start gap-2 border border-red-100">
                                <ShieldAlert size={14} className="shrink-0 mt-0.5"/>
                                <p>Alertas: {mascota.alertasMedicas}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleGuardarMascota} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                    <PawPrint className="text-emerald-500" size={20}/>
                    <h4 className="font-black text-slate-800">Registrar Nuevo Paciente</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Nombre de la Mascota</label>
                      <input required type="text" value={formMascota.nombre} onChange={e => setFormMascota({...formMascota, nombre: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Especie</label>
                      <select value={formMascota.especie} onChange={e => setFormMascota({...formMascota, especie: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="Perro">Perro</option>
                        <option value="Gato">Gato</option>
                        <option value="Ave">Ave</option>
                        <option value="Roedor">Roedor</option>
                        <option value="Peces">Peces</option>
                        <option value="Reptiles">Reptiles</option>
                        <option value="Mamifero">Mamifero</option>
                        <option value="Exótico">Exótico / Otros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Raza</label>
                      <input required type="text" value={formMascota.raza} onChange={e => setFormMascota({...formMascota, raza: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. Golden, Siamés, Mestizo..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Sexo</label>
                      <select value={formMascota.sexo} onChange={e => setFormMascota({...formMascota, sexo: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Nacimiento (Aprox)</label>
                      <input required type="date" value={formMascota.fechaNacimiento} onChange={e => setFormMascota({...formMascota, fechaNacimiento: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-slate-600 mb-1">Peso Inicial (Kg)</label>
                      <input required type="number" step="0.1" min="0.1" value={formMascota.pesoActual} onChange={e => setFormMascota({...formMascota, pesoActual: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. 12.5" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">Alertas Médicas (Alergias, Condiciones)</label>
                      <input type="text" value={formMascota.alertasMedicas} onChange={e => setFormMascota({...formMascota, alertasMedicas: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej. Alérgico a penicilina (Dejar en blanco si ninguna)" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setMostrandoFormMascota(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Volver a la lista</button>
                    <button type="submit" disabled={guardandoMascota} className="shrink-0 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2 active:scale-95">
                      {guardandoMascota ? 'Registrando...' : <><CheckCircle2 size={18}/> Registrar Paciente</>}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default ClientesPage;