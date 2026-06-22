import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CalendarPlus, Heart, Stethoscope, Clock, CheckCircle2, Plus, ArrowLeft, Loader2, User, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const ModalReservaCliente = ({ cerrarModal }) => {
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);

  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);

  const [idUsuario] = useState(() => localStorage.getItem('usuarioId'));
  const [idDueño, setIdDueño] = useState(null); 

  const [seleccion, setSeleccion] = useState({
    mascotaId: '', servicioId: '', veterinarioId: '', fecha: '', hora: '', motivo: '' 
  });

  const [nuevaMascota, setNuevaMascota] = useState({ 
    nombre: '', especie: 'PERRO', raza: '', sexo: 'MACHO', pesoActual: '', fechaNacimiento: '', alertasMedicas: '' 
  });
  
  const [modoCrearMascota, setModoCrearMascota] = useState(false);

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    let isMounted = true;
    
    const cargarDatos = async () => {
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

        if (isMounted) {
          setMascotas(resMascotas?.data || []);
          if (resMascotas?.data.length === 0) setModoCrearMascota(true);
        }

        const resServicios = await axios.get('http://localhost:8080/api/servicios', getConfig());
        if (isMounted) setServicios(resServicios.data || []);

        const resVets = await axios.get('http://localhost:8080/api/usuarios/veterinarios', getConfig());
        if (isMounted) setVeterinarios(resVets.data || []);
      } catch (error) {
        console.error("Error al sincronizar datos:", error);
      }
    };

    cargarDatos();
    return () => { isMounted = false; };
  }, [idUsuario]);

  const handleCrearMascota = async (e) => {
    e.preventDefault();
    if (!idDueño) {
      Swal.fire('Error', 'No se detectó tu perfil de cliente.', 'error');
      return;
    }

    setCargando(true);
    try {
      const payload = {
        nombre: nuevaMascota.nombre,
        especie: nuevaMascota.especie,
        raza: nuevaMascota.raza || 'Común',
        sexo: nuevaMascota.sexo,
        fechaNacimiento: nuevaMascota.fechaNacimiento,
        pesoActual: parseFloat(nuevaMascota.pesoActual) || 0.0,
        alertasMedicas: nuevaMascota.alertasMedicas || '',
        fotoUrl: '/uploads/defecto-mascota.png', 
        dueño: { id: parseInt(idDueño) } 
      };
      
      const res = await axios.post('http://localhost:8080/api/mascotas', payload, getConfig());
      
      setMascotas([...mascotas, res.data]);
      setSeleccion({ ...seleccion, mascotaId: res.data.id });
      setModoCrearMascota(false);
      setPaso(2); 
      Swal.fire({ icon: 'success', title: '¡Mascota registrada!', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      console.error("Error al registrar mascota:", error); 
      const mensajeBackend = typeof error.response?.data === 'string' ? error.response.data : 'Verifica los campos.';
      Swal.fire('Error del Servidor', mensajeBackend, 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleFinalizarCita = async () => {
    setCargando(true);
    try {
      // EMPAQUETADO INTELIGENTE:
      const payload = {
        fechaHora: `${seleccion.fecha}T${seleccion.hora}:00`,
        motivo: seleccion.motivo || 'Consulta programada desde el panel del cliente',
        estado: 'PENDIENTE',
        mascota: { id: parseInt(seleccion.mascotaId) },
        servicio: { id: parseInt(seleccion.servicioId) }
      };

      // Si el cliente eligió un doctor específico, lo agregamos. 
      // Si eligió "Cualquiera" (string vacío), tu Java lo recibirá como null automáticamente.
      if (seleccion.veterinarioId) {
        payload.veterinario = { id: parseInt(seleccion.veterinarioId) };
      }

      await axios.post('http://localhost:8080/api/citas', payload, getConfig());

      Swal.fire({
        icon: 'success',
        title: '¡Cita Reservada Exitosamente!',
        text: seleccion.veterinarioId 
          ? 'Hemos agendado tu turno. Si hay algún cruce, la clínica se comunicará contigo.' 
          : 'Tu cita está registrada. Recepción le asignará el especialista disponible más pronto.',
        confirmButtonColor: '#185FA5'
      }).then(() => cerrarModal());

    } catch (error) {
      console.error(error); 
      const mensajeBackend = typeof error.response?.data === 'string' ? error.response.data : 'El especialista está ocupado o hay un problema.';
      Swal.fire({ icon: 'error', title: 'No se pudo reservar', text: mensajeBackend });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={cerrarModal}></div>
      <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarPlus className="text-blue-600" size={22} /> 
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Agendar Cita Médica</h3>
          </div>
          <button onClick={cerrarModal} className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-1 rounded-lg border border-slate-200 shadow-sm"><X size={20} /></button>
        </div>

        {/* INDICADOR DE PASOS */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 shrink-0">
          <span className={paso === 1 ? 'text-blue-600 font-black' : ''}>1. Mascota</span>
          <span className={paso === 2 ? 'text-blue-600 font-black' : ''}>2. Servicio</span>
          <span className={paso === 3 ? 'text-blue-600 font-black' : ''}>3. Horario</span>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">

          {paso === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {!modoCrearMascota ? (
                <>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Heart size={14}/> ¿A quién atenderemos?</label>
                    <button onClick={() => setModoCrearMascota(true)} disabled={!idDueño} className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"><Plus size={14}/> Nueva mascota</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mascotas.map(m => (
                      <div key={m.id} onClick={() => setSeleccion({ ...seleccion, mascotaId: m.id })} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${seleccion.mascotaId === m.id ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <p className="font-black text-slate-800 text-base">{m.nombre}</p>
                        <p className="text-xs font-semibold text-slate-400 capitalize">{m.especie.toLowerCase()} • {m.raza || 'Raza común'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button disabled={!seleccion.mascotaId} onClick={() => setPaso(2)} className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 hover:bg-blue-700 transition-colors">Siguiente Paso</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleCrearMascota} className="space-y-4">
                  <h4 className="font-black text-slate-800 text-lg">Datos de la Mascota</h4>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Nombre *</label>
                    <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={nuevaMascota.nombre} onChange={e => setNuevaMascota({...nuevaMascota, nombre: e.target.value})} placeholder="Ej: Yaco" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Especie *</label>
                      <select className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={nuevaMascota.especie} onChange={e => setNuevaMascota({...nuevaMascota, especie: e.target.value})}>
                        <option value="PERRO">Perro</option><option value="GATO">Gato</option><option value="AVE">Ave / Exótico</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Sexo *</label>
                      <select className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={nuevaMascota.sexo} onChange={e => setNuevaMascota({...nuevaMascota, sexo: e.target.value})}>
                        <option value="MACHO">Macho</option><option value="HEMBRA">Hembra</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Fecha Nacimiento *</label>
                      <input required type="date" max={new Date().toISOString().split("T")[0]} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={nuevaMascota.fechaNacimiento} onChange={e => setNuevaMascota({...nuevaMascota, fechaNacimiento: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Peso Actual (Kg) *</label>
                      <input required type="number" step="0.1" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={nuevaMascota.pesoActual} onChange={e => setNuevaMascota({...nuevaMascota, pesoActual: e.target.value})} placeholder="Ej: 5.5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Raza / Variedad</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={nuevaMascota.raza} onChange={e => setNuevaMascota({...nuevaMascota, raza: e.target.value})} placeholder="Ej: Mestizo (Opcional)" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Alertas Médicas (Opcional)</label>
                    <textarea rows="2" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 resize-none" value={nuevaMascota.alertasMedicas} onChange={e => setNuevaMascota({...nuevaMascota, alertasMedicas: e.target.value})} placeholder="Ej: Alérgico a algo..." />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    {mascotas.length > 0 && <button type="button" onClick={() => setModoCrearMascota(false)} className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-slate-700"><ArrowLeft size={14}/> Volver</button>}
                    <button type="submit" disabled={cargando} className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-colors">
                      {cargando ? <Loader2 className="animate-spin" size={16}/> : 'Guardar y Continuar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Stethoscope size={14}/> ¿Qué servicio requiere?</label>
              <div className="space-y-2">
                {servicios.map(s => (
                  <div key={s.id} onClick={() => setSeleccion({ ...seleccion, servicioId: s.id })} className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${seleccion.servicioId === s.id ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div><p className="font-black text-slate-800 text-sm">{s.nombre}</p></div>
                    <span className="font-bold text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">S/ {s.precio?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setPaso(1)} className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl flex items-center gap-1 hover:bg-slate-200"><ArrowLeft size={16}/> Atrás</button>
                <button disabled={!seleccion.servicioId} onClick={() => setPaso(3)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-colors">Siguiente</button>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><User size={14}/> Especialista Médico</label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={seleccion.veterinarioId} onChange={e => setSeleccion({ ...seleccion, veterinarioId: e.target.value })}>
                  {/* CAMBIO MAESTRO: ESTA OPCIÓN AHORA ES LA POR DEFECTO Y MANDA UN ID VACÍO */}
                  <option value="">Cualquier especialista disponible</option>
                  {veterinarios.map(v => <option key={v.id} value={v.id}>{v.nombreVisible}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Clock size={14}/> Fecha</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={seleccion.fecha} onChange={e => setSeleccion({ ...seleccion, fecha: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Clock size={14}/> Hora</label>
                  <input type="time" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500" value={seleccion.hora} onChange={e => setSeleccion({ ...seleccion, hora: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><FileText size={14}/> Motivo de Consulta (Opcional)</label>
                <textarea rows="2" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none text-sm font-semibold resize-none focus:ring-2 focus:ring-blue-500" value={seleccion.motivo} onChange={e => setSeleccion({ ...seleccion, motivo: e.target.value })} placeholder="Ej: Chequeo de rutina, mi perrito no quiere comer..." />
              </div>
              
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={() => setPaso(2)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl flex items-center gap-1"><ArrowLeft size={16}/> Atrás</button>
                {/* YA NO ES OBLIGATORIO EL VETERINARIO PARA CONTINUAR */}
                <button disabled={!seleccion.fecha || !seleccion.hora || cargando} onClick={handleFinalizarCita} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl flex items-center gap-2 shadow-md disabled:opacity-50 transition-colors">
                  {cargando ? <Loader2 className="animate-spin" size={16}/> : <><CheckCircle2 size={16}/> Confirmar Reserva</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalReservaCliente;