import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  CalendarDays, History, Activity, Clock, CheckCircle2, 
  Stethoscope, Syringe, PawPrint, AlertCircle, BarChart3,
  Printer, X, FileText, Bug, ShieldCheck 
} from 'lucide-react';

const MisCitasCliente = () => {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tabActivo, setTabActivo] = useState('citas'); 
  const [modalCarnet, setModalCarnet] = useState(false);

  const idUsuario = localStorage.getItem('usuarioId');
  const nombreTutor = localStorage.getItem('usuarioNombre') || 'Cliente';

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    let isMounted = true;

    const cargarMisCitas = async () => {
      if (!idUsuario) return;
      try {
        const resDueno = await axios.get(`http://localhost:8080/api/usuarios/${idUsuario}/dueño`, getConfig());
        const duenoId = resDueno.data.id;

        const resCitas = await axios.get(`http://localhost:8080/api/citas/dueno/${duenoId}`, getConfig());
        if (isMounted) {
          setCitas(resCitas.data || []);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarMisCitas();
    return () => { isMounted = false; };
  }, [idUsuario]);

  const citasActivas = citas.filter(c => 
    c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA' || c.estado === 'EN_ESPERA'
  );

  const historialClinico = citas.filter(c => c.estado === 'COMPLETADA');

  const getVetName = (v) => {
    if (!v) return 'Médico Clínico (Por asignar)';
    if (v.personal && v.personal.nombreCompleto) return v.personal.nombreCompleto;
    if (v.nombreCompleto) return v.nombreCompleto;
    if (v.nombreVisible) return v.nombreVisible;
    return 'Médico Clínico';
  };

  const formatearFechaSimple = (fecha) => {
    if (!fecha) return 'No registrado';
    const soloFecha = typeof fecha === 'string' ? fecha.split('T')[0] : new Date(fecha).toISOString().split('T')[0];
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`;
  };

  const registrosPorMascota = {};
  
  historialClinico.forEach(cita => {
    const nombreMascota = cita.mascota?.nombre || 'Desconocido';
    
    if (!registrosPorMascota[nombreMascota]) {
      registrosPorMascota[nombreMascota] = {
        mascota: cita.mascota,
        vacunas: [],
        desparasitaciones: []
      };
    }

    let encontroRegistro = false;

    if (cita.itemsCobro && cita.itemsCobro.length > 0) {
      cita.itemsCobro.forEach(item => {
        const nombreItem = item.nombreItem ? item.nombreItem.toLowerCase() : '';
        if (item.tipoItem === 'VACUNA' || nombreItem.includes('vacun')) {
          registrosPorMascota[nombreMascota].vacunas.push({
            fecha: cita.fechaHora, nombre: item.nombreItem, doctor: cita.veterinario
          });
          encontroRegistro = true;
        } else if (item.tipoItem === 'ANTIPARASITARIO' || nombreItem.includes('parasit') || nombreItem.includes('desparasit')) {
          registrosPorMascota[nombreMascota].desparasitaciones.push({
            fecha: cita.fechaHora, nombre: item.nombreItem, doctor: cita.veterinario
          });
          encontroRegistro = true;
        }
      });
    }

    if (!encontroRegistro && cita.servicio?.nombre) {
      const nombreServicio = cita.servicio.nombre.toLowerCase();
      if (nombreServicio.includes('vacun')) {
        registrosPorMascota[nombreMascota].vacunas.push({
          fecha: cita.fechaHora, nombre: cita.servicio.nombre, doctor: cita.veterinario
        });
      } else if (nombreServicio.includes('parasit') || nombreServicio.includes('desparasit')) {
        registrosPorMascota[nombreMascota].desparasitaciones.push({
          fecha: cita.fechaHora, nombre: cita.servicio.nombre, doctor: cita.veterinario
        });
      }
    }
  });

  const mascotasConRegistros = Object.entries(registrosPorMascota)
    .filter(([, datos]) => datos.vacunas.length > 0 || datos.desparasitaciones.length > 0)
    .reduce((acc, [nombre, datos]) => { acc[nombre] = datos; return acc; }, {});

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "PENDIENTE": return <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">PROGRAMADA</span>;
      case "CONFIRMADA": return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">CONFIRMADA</span>;
      case "EN_ESPERA": return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">EN ESPERA</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">{estado}</span>;
    }
  };

  return (
    <>
      <style type="text/css">
        {`
          @media print {
            @page { size: landscape; margin: 15mm; } 
            html, body { 
              background: white !important; 
              height: auto !important; 
              overflow: visible !important; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            #root { display: none !important; } 
            
            .modal-impresion-wrapper {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
            }
            
            .modal-impresion-content {
              box-shadow: none !important;
              border: none !important;
              max-height: none !important;
              overflow: visible !important;
              width: 100% !important;
              max-width: 100% !important;
              border-radius: 0 !important;
              background: white !important;
            }
            
            .no-imprimir { display: none !important; }
            .salto-pagina { page-break-before: always; }
          }
        `}
      </style>

      <div className="space-y-6 animate-in fade-in duration-500 pb-10 print:hidden">
        
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <CalendarDays className="text-blue-500" size={28}/> Mis Reservas
            </h1>
            <p className="text-slate-500 text-sm mt-1">Revisa tus próximas atenciones y el historial de tus mascotas.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
            <button 
              onClick={() => setTabActivo('citas')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tabActivo === 'citas' ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clock size={16}/> Próximas Citas
            </button>
            <button 
              onClick={() => setTabActivo('historial')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tabActivo === 'historial' ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <History size={16}/> Historial Clínico
            </button>
          </div>
        </div>

        {!cargando && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600"><Clock size={20}/></div>
              <div><p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Citas Activas</p><p className="text-xl font-black text-slate-700">{citasActivas.length}</p></div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><CheckCircle2 size={20}/></div>
              <div><p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Atenciones Recibidas</p><p className="text-xl font-black text-slate-700">{historialClinico.length}</p></div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><BarChart3 size={20}/></div>
              <div><p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Operaciones</p><p className="text-xl font-black text-slate-700">{citas.length}</p></div>
            </div>
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center py-20"><Activity className="animate-spin text-blue-500" size={40} /></div>
        ) : tabActivo === 'citas' ? (
          
          <div className="space-y-4">
            {citasActivas.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center">
                <CalendarDays size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-700">No tienes citas programadas</h3>
                <p className="text-slate-500 mt-2">Utiliza el botón de "Nueva Cita" del encabezado superior para agendar turnos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {citasActivas.map(cita => (
                  <div key={cita.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition-all relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha Programada</p>
                        <p className="text-lg font-black text-slate-800">
                          {new Date(cita.fechaHora).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-blue-600 font-black flex items-center gap-1.5 mt-0.5">
                          <Clock size={14}/> {new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {getEstadoBadge(cita.estado)}
                    </div>
                    
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-slate-100 shrink-0">
                          <PawPrint size={20} strokeWidth={1.5}/>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{cita.mascota?.nombre}</p>
                          <p className="text-xs font-semibold text-slate-500 capitalize">Paciente</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-200/60">
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Stethoscope size={14} className="text-blue-500"/> {cita.servicio?.nombre}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500"/> 
                          Dr/a. {getVetName(cita.veterinario)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-start gap-2 text-xs font-medium text-slate-400 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5"/>
                      <p>Si deseas reprogramar o cancelar, por favor comunícate con recepción.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : (

          <div className="space-y-4">
            <div className="flex justify-end mb-4">
               <button 
                 onClick={() => setModalCarnet(true)}
                 className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
               >
                 <FileText size={18}/> Ver Carnet Clínico
               </button>
            </div>

            {historialClinico.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center">
                <History size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-700">Historial Médico Vacío</h3>
                <p className="text-slate-500 mt-2">Aún no hay registros de atenciones completadas para tus mascotas.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs uppercase tracking-widest font-black">
                        <th className="px-6 py-4">Fecha de Atención</th>
                        <th className="px-6 py-4">Paciente</th>
                        <th className="px-6 py-4">Procedimiento Principal</th>
                        <th className="px-6 py-4">Médico Tratante</th>
                        <th className="px-6 py-4 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {historialClinico.map(cita => {
                        const tieneInsumosExtra = cita.itemsCobro && cita.itemsCobro.length > 0;
                        const esVacunaServicio = cita.servicio?.nombre?.toLowerCase().includes('vacun');
                        
                        return (
                          <tr key={cita.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800">{new Date(cita.fechaHora).toLocaleDateString('es-PE')}</p>
                              <p className="text-xs text-slate-500">{new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <PawPrint size={14} className="text-slate-400"/>
                                <span className="font-bold text-slate-700">{cita.mascota?.nombre}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {esVacunaServicio ? (
                                  <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg"><Syringe size={16}/></span>
                                ) : (
                                  <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Stethoscope size={16}/></span>
                                )}
                                <div>
                                  <p className="font-bold text-slate-800 flex items-center flex-wrap gap-2 break-words">
                                    {cita.servicio?.nombre}
                                    {tieneInsumosExtra && <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">+ Insumos Adicionales</span>}
                                  </p>
                                  <p className="text-xs text-slate-500 max-w-[250px] break-words" title={cita.motivo}>{cita.motivo}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-600 break-words">
                                Dr/a. {getVetName(cita.veterinario)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black tracking-wide border border-emerald-100">
                                <CheckCircle2 size={12}/> FINALIZADO
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {modalCarnet && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 modal-impresion-wrapper">
          
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm no-imprimir" onClick={() => setModalCarnet(false)}></div>
          
          <div className="relative bg-slate-100 rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh] modal-impresion-content">
            
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 no-imprimir">
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><Syringe className="text-emerald-500" size={24}/> Carnet Clínico Oficial</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-sky-500 text-white hover:bg-sky-600 border border-sky-600 px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-sky-500/20 hover:-translate-y-0.5">
                  <Printer size={18}/> Imprimir Carnet
                </button>
                <button onClick={() => setModalCarnet(false)} className="text-slate-400 hover:text-rose-500 bg-white p-2 rounded-lg border border-slate-200 shadow-sm transition-colors"><X size={20}/></button>
              </div>
            </div>
            
            <div id="carnet-impresion" className="p-6 overflow-y-auto custom-scrollbar flex-1 print:overflow-visible print:bg-white print:p-4">
              
              {Object.keys(mascotasConRegistros).length === 0 ? (
                 <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 no-imprimir">
                    <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-xl font-black text-slate-700">Sin Registros Clínicos</p>
                    <p className="text-slate-500 mt-2">No se encontraron vacunas ni desparasitaciones aplicadas en tu historial.</p>
                 </div>
              ) : (
                <div className="space-y-10 print:space-y-0">
                  {Object.entries(mascotasConRegistros).map(([nombreMascota, datos], index) => (
                    
                    <div key={nombreMascota} className={`bg-white border-2 border-slate-200 rounded-[2rem] p-6 shadow-sm print:border-none print:shadow-none print:p-2 print:m-0 ${index > 0 ? 'salto-pagina mt-8 print:mt-0' : ''}`}>
                      
                      <div className="flex justify-between items-start border-b-4 border-sky-500 pb-4 mb-6 print:pb-3 print:mb-4">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                             <PawPrint size={32} className="text-sky-600"/>
                           </div>
                           <div>
                             <h1 className="text-3xl font-black text-sky-600 tracking-tighter">Vet.Huesitos</h1>
                             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Clínica Veterinaria</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <h2 className="text-2xl font-black text-slate-800 uppercase">Carnet de Salud</h2>
                           <p className="text-sky-600 font-bold">Vacunación y Desparasitación</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-6 print:gap-4 print:mb-4">
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 print:p-3">
                           <h3 className="font-black text-lg text-slate-800 mb-3 border-b border-slate-200 pb-2 flex items-center gap-2"><PawPrint size={18} className="text-sky-500"/> Paciente</h3>
                           <div className="space-y-1.5 text-sm">
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Nombre:</span> <span className="font-black text-slate-800 text-base">{nombreMascota}</span></p>
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Especie:</span> <span className="font-semibold text-slate-700 capitalize">{datos.mascota?.especie}</span></p>
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Raza:</span> <span className="font-semibold text-slate-700 capitalize">{datos.mascota?.raza || 'Común / Mestizo'}</span></p>
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Sexo:</span> <span className="font-semibold text-slate-700 capitalize">{datos.mascota?.sexo || 'N/A'}</span></p>
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Nacimiento:</span> <span className="font-semibold text-slate-700">{formatearFechaSimple(datos.mascota?.fechaNacimiento)}</span></p>
                           </div>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 print:p-3">
                           <h3 className="font-black text-lg text-slate-800 mb-3 border-b border-slate-200 pb-2 flex items-center gap-2"><Stethoscope size={18} className="text-emerald-500"/> Clínica</h3>
                           <div className="space-y-1.5 text-sm">
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Tutor:</span> <span className="font-black text-slate-800 text-base">{nombreTutor}</span></p>
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Clínica:</span> <span className="font-semibold text-slate-700">Vet.Huesitos</span></p>
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Teléfono:</span> <span className="font-semibold text-slate-700">(01) 628-2000</span></p>
                             <p><span className="font-bold text-slate-400 w-24 inline-block uppercase tracking-wider text-[10px]">Emergencias:</span> <span className="font-bold text-red-600">+51 994 142 421</span></p>
                           </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 print:gap-4">
                        
                        <div>
                          <div className="bg-sky-500 text-white font-black text-center py-2 rounded-t-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                            <Syringe size={16}/> Registro de Vacunación
                          </div>
                          <table className="w-full text-left text-sm border-x border-b border-slate-200 rounded-b-xl overflow-hidden table-fixed">
                            <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider">
                              <tr>
                                <th className="px-3 py-2 border-b border-slate-200 w-1/4">Fecha</th>
                                <th className="px-3 py-2 border-b border-slate-200 w-1/2">Vacuna Aplicada</th>
                                <th className="px-3 py-2 border-b border-slate-200 w-1/4">Médico</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {datos.vacunas.length === 0 ? (
                                <tr><td colSpan="3" className="px-4 py-4 text-center text-slate-400 font-semibold">Sin vacunas registradas</td></tr>
                              ) : (
                                datos.vacunas.map((v, i) => (
                                  <tr key={`v-${i}`}>
                                    <td className="px-3 py-2.5 font-semibold text-slate-700">{new Date(v.fecha).toLocaleDateString('es-PE')}</td>
                                    <td className="px-3 py-2.5 font-black text-sky-700 break-words leading-tight">{v.nombre}</td>
                                    <td className="px-3 py-2.5 text-[11px] font-bold text-slate-500 break-words leading-tight">Dr/a. {getVetName(v.doctor)}</td>
                                  </tr>
                                ))
                              )}
                              {[...Array(Math.max(0, 5 - datos.vacunas.length))].map((_, i) => (
                                <tr key={`empty-v-${i}`}><td className="px-3 py-4 print:py-3"></td><td className="px-3 py-4 print:py-3"></td><td className="px-3 py-4 print:py-3"></td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <div className="bg-emerald-500 text-white font-black text-center py-2 rounded-t-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                            <Bug size={16}/> Desparasitación
                          </div>
                          <table className="w-full text-left text-sm border-x border-b border-slate-200 rounded-b-xl overflow-hidden table-fixed">
                            <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider">
                              <tr>
                                <th className="px-3 py-2 border-b border-slate-200 w-1/4">Fecha</th>
                                <th className="px-3 py-2 border-b border-slate-200 w-1/2">Antiparasitario</th>
                                <th className="px-3 py-2 border-b border-slate-200 w-1/4">Médico</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {datos.desparasitaciones.length === 0 ? (
                                <tr><td colSpan="3" className="px-4 py-4 text-center text-slate-400 font-semibold">Sin desparasitaciones</td></tr>
                              ) : (
                                datos.desparasitaciones.map((d, i) => (
                                  <tr key={`d-${i}`}>
                                    <td className="px-3 py-2.5 font-semibold text-slate-700">{new Date(d.fecha).toLocaleDateString('es-PE')}</td>
                                    <td className="px-3 py-2.5 font-black text-emerald-700 break-words leading-tight">{d.nombre}</td>
                                    <td className="px-3 py-2.5 text-[11px] font-bold text-slate-500 break-words leading-tight">Dr/a. {getVetName(d.doctor)}</td>
                                  </tr>
                                ))
                              )}
                              {[...Array(Math.max(0, 5 - datos.desparasitaciones.length))].map((_, i) => (
                                <tr key={`empty-d-${i}`}><td className="px-3 py-4 print:py-3"></td><td className="px-3 py-4 print:py-3"></td><td className="px-3 py-4 print:py-3"></td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t-2 border-dashed border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden print:block">
                        <p>Documento Clínico Informativo • Clínica Veterinaria Huesitos</p>
                        <p>Emitido el: {new Date().toLocaleDateString('es-PE')} a las {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute:'2-digit'})}</p>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MisCitasCliente;