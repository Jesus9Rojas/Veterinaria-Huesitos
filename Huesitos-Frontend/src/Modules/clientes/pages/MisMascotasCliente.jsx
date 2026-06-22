import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Plus, Heart, Activity, X, AlertCircle, ShieldCheck, Info, PawPrint, Calendar, User, ActivitySquare } from 'lucide-react';
import Swal from 'sweetalert2';

const MisMascotasCliente = () => {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [idUsuario] = useState(() => localStorage.getItem('usuarioId'));
  const [idDueño, setIdDueño] = useState(null); 

  const [modalAbierto, setModalAbierto] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

  const [form, setForm] = useState({ 
    nombre: '', especie: 'PERRO', raza: '', sexo: 'MACHO', pesoActual: '', fechaNacimiento: '', alertasMedicas: '' 
  });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    let isMounted = true;

    const inicializarDatos = async () => {
      if (!idUsuario) return;
      try {
        const resDueno = await axios.get(`http://localhost:8080/api/usuarios/${idUsuario}/dueño`, getConfig());
        const duenoId = resDueno.data.id;
        
        if (isMounted) setIdDueño(duenoId);

        let resMascotas;
        try {
          resMascotas = await axios.get(`http://localhost:8080/api/mascotas/dueno/${duenoId}`, getConfig());
        } catch (error) {
          console.warn("Intentando ruta alternativa para mascotas...", error.message);
          resMascotas = await axios.get(`http://localhost:8080/api/mascotas/dueño/${duenoId}`, getConfig());
        }

        if (isMounted) setMascotas(resMascotas?.data || []);

      } catch (error) {
        console.error("Error al cargar datos del cliente:", error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    inicializarDatos();
    return () => { isMounted = false; };
  }, [idUsuario]);

  // =========================================================================
  // FUNCIÓN ANTI-DESFASE PARA LA FECHA (Evita que reste un día por la zona horaria)
  // =========================================================================
  const formatearFechaSimple = (fecha) => {
    if (!fecha) return 'No registrado';
    const soloFecha = typeof fecha === 'string' ? fecha.split('T')[0] : new Date(fecha).toISOString().split('T')[0];
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`;
  };

  // Cálculo de edad blindado contra zonas horarias
  const calcularEdad = (fecha) => {
    if(!fecha) return 'Desconocida';
    const soloFecha = typeof fecha === 'string' ? fecha.split('T')[0] : new Date(fecha).toISOString().split('T')[0];
    const [year, month, day] = soloFecha.split('-');
    const nac = new Date(year, month - 1, day);
    const hoy = new Date();
    
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!idDueño) {
        Swal.fire('Error', 'No se pudo validar tu cuenta. Recarga la página.', 'error');
        return;
    }

    try {
      const payload = {
        nombre: form.nombre,
        especie: form.especie,
        raza: form.raza || 'Común',
        sexo: form.sexo,
        fechaNacimiento: form.fechaNacimiento,
        pesoActual: parseFloat(form.pesoActual) || 0.0,
        alertasMedicas: form.alertasMedicas || '',
        dueno: { id: parseInt(idDueño) }  
      };

      const res = await axios.post('http://localhost:8080/api/mascotas', payload, getConfig());
      
      Swal.fire({ icon: 'success', title: 'Mascota Registrada', showConfirmButton: false, timer: 1500 });
      setMascotas([...mascotas, res.data]);
      setModalAbierto(false);
      setForm({ nombre: '', especie: 'PERRO', raza: '', sexo: 'MACHO', pesoActual: '', fechaNacimiento: '', alertasMedicas: '' });
      
    } catch (error) {
      console.error(error);
      const mensajeBackend = typeof error.response?.data === 'string' 
          ? error.response.data 
          : error.response?.data?.message || 'Verifica los campos.';
      Swal.fire('No se pudo guardar', mensajeBackend, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><Heart className="text-rose-500" size={28}/> Mis Engreídos</h1>
          <p className="text-slate-500 text-sm mt-1">Registra y gestiona la información clínica de tus compañeros.</p>
        </div>
        <button 
          onClick={() => setModalAbierto(true)} 
          disabled={!idDueño} 
          className="w-full sm:w-auto bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Plus size={18}/> Agregar Mascota
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-20"><Activity className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3">
            {mascotas.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center">
                <Heart size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-700">Aún no tienes mascotas registradas</h3>
                <p className="text-slate-500 mt-2 mb-6">Agrega a tu primer engreído para empezar a gestionar sus citas de control.</p>
                <button onClick={() => setModalAbierto(true)} className="bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md">Registrar mi mascota</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mascotas.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setMascotaSeleccionada(m)}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all cursor-pointer w-full"
                  >
                    {m.alertasMedicas && <div className="absolute top-4 right-4 text-rose-500" title="Alertas médicas"><AlertCircle size={20} /></div>}
                    
                    <div className="w-24 h-24 bg-gradient-to-tr from-sky-50 to-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4 border-4 border-white shadow-sm group-hover:scale-105 transition-transform">
                      <PawPrint size={40} strokeWidth={1.5} />
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-800">{m.nombre}</h3>
                    <p className="text-sm font-semibold text-slate-400 capitalize">{m.especie.toLowerCase()} • {m.raza || 'Raza común'}</p>
                    
                    <div className="w-full flex justify-between px-4 py-3 bg-slate-50 rounded-2xl mt-4 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                      <div className="text-center"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Edad</p><p className="font-bold text-slate-700">{calcularEdad(m.fechaNacimiento)} años</p></div>
                      <div className="w-px bg-slate-200 group-hover:bg-blue-200 transition-colors"></div>
                      <div className="text-center"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Peso</p><p className="font-bold text-slate-700">{m.pesoActual || 0} kg</p></div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 space-y-6 shadow-sm">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="text-blue-500" size={18}/> Recomendaciones
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100 flex gap-3">
                <Info className="text-sky-500 shrink-0" size={16}/>
                <div>
                  <p className="font-black text-sky-900 mb-0.5">Control de Vacunas</p>
                  <p className="text-slate-600 leading-relaxed">Recuerda que los refuerzos anuales protegen a tus engreídos de enfermedades críticas.</p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={16}/>
                <div>
                  <p className="font-black text-amber-900 mb-0.5">Atención 24 Horas</p>
                  <p className="text-slate-600 leading-relaxed">Ante cualquier emergencia o signo de alerta médico, puedes acudir a sede directo sin cita previa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETALLES DE MASCOTA (CON FECHAS CORREGIDAS)                         */}
      {/* ========================================================================= */}
      {mascotaSeleccionada && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMascotaSeleccionada(null)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><PawPrint className="text-blue-500" size={24}/> Ficha del Paciente</h3>
              <button onClick={() => setMascotaSeleccionada(null)} className="text-slate-400 hover:text-rose-500 bg-white p-1 rounded-lg border border-slate-200 shadow-sm transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-blue-500 border-2 border-sky-100 shrink-0">
                  <PawPrint size={36} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-800 tracking-tight">{mascotaSeleccionada.nombre}</h4>
                  <p className="text-sm font-semibold text-slate-500 capitalize">{mascotaSeleccionada.especie.toLowerCase()} • {mascotaSeleccionada.raza || 'Común'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 mb-1"><User size={12}/> Sexo</p>
                  <p className="font-bold text-slate-700 capitalize">{mascotaSeleccionada.sexo.toLowerCase()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 mb-1"><Calendar size={12}/> Edad</p>
                  <p className="font-bold text-slate-700">{calcularEdad(mascotaSeleccionada.fechaNacimiento)} años</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 mb-1"><ActivitySquare size={12}/> Peso Actual</p>
                  <p className="font-bold text-slate-700">{mascotaSeleccionada.pesoActual || '0.0'} kg</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 mb-1"><Calendar size={12}/> Nacimiento</p>
                  <p className="font-bold text-slate-700">{formatearFechaSimple(mascotaSeleccionada.fechaNacimiento)}</p>
                </div>
              </div>

              {mascotaSeleccionada.alertasMedicas && (
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                  <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-1.5 mb-2"><AlertCircle size={14}/> Alertas Médicas</p>
                  <p className="text-sm font-semibold text-rose-800">{mascotaSeleccionada.alertasMedicas}</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL AGREGAR MASCOTA */}
      {modalAbierto && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalAbierto(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><Heart className="text-rose-500" size={20}/> Nueva Mascota</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-rose-500 bg-white p-1 rounded-lg border border-slate-200 shadow-sm transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="form-mascota" onSubmit={handleGuardar} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Nombre *</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} placeholder="Ej: Pelusa" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Especie *</label>
                    <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" value={form.especie} onChange={e=>setForm({...form, especie: e.target.value})}><option value="PERRO">Perro</option><option value="GATO">Gato</option><option value="AVE">Ave / Exótico</option></select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Sexo *</label>
                    <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" value={form.sexo} onChange={e=>setForm({...form, sexo: e.target.value})}><option value="MACHO">Macho</option><option value="HEMBRA">Hembra</option></select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Fecha Nacimiento *</label>
                    <input required type="date" max={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" value={form.fechaNacimiento} onChange={e=>setForm({...form, fechaNacimiento: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Peso Actual (kg) *</label>
                    <input type="number" step="0.1" required className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" value={form.pesoActual} onChange={e=>setForm({...form, pesoActual: e.target.value})} placeholder="Ej: 5.5"/>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Raza / Variedad</label>
                  <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" value={form.raza} onChange={e=>setForm({...form, raza: e.target.value})} placeholder="Ej: Mestizo"/>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Alertas Médicas (Opcional)</label>
                  <textarea rows="2" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none resize-none focus:ring-2 focus:ring-blue-500" value={form.alertasMedicas} onChange={e=>setForm({...form, alertasMedicas: e.target.value})} placeholder="Ej: Alérgico a..."/>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <button disabled={!idDueño || cargando} form="form-mascota" type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50">Guardar Mascota</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MisMascotasCliente;