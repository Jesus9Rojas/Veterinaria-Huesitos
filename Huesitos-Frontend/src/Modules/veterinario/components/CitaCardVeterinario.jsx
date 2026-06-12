import { PawPrint, User, Stethoscope, CheckCircle2, PlayCircle, AlertCircle } from 'lucide-react';

const CitaCardVeterinario = ({ cita, onAtender, onFinalizar }) => {
  const horaFormat = new Date(cita.fechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const nombreDueño = cita.mascota?.dueño?.nombreCompleto || cita.mascota?.dueno?.nombreCompleto || 'Desconocido';

  // Lógica de colores según estado
  const isEnEspera = cita.estado === 'EN_ESPERA';
  const isCompletada = cita.estado === 'COMPLETADA';
  const isPendiente = cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA';

  return (
    <div className={`relative flex flex-col md:flex-row gap-4 p-5 rounded-3xl border transition-all duration-300 ${
      isEnEspera ? 'bg-amber-50/40 border-amber-200 shadow-md shadow-amber-500/10' : 
      isCompletada ? 'bg-slate-50 border-slate-200 opacity-75 grayscale-[50%]' : 
      'bg-white border-slate-200 hover:shadow-md'
    }`}>
      
      {/* HORA Y ESTADO LATERAL */}
      <div className="md:w-32 flex flex-col justify-center shrink-0 border-b md:border-b-0 md:border-r border-slate-200/60 pb-4 md:pb-0 md:pr-4 text-center md:text-left">
        <span className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-1">
          {isEnEspera && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
          {horaFormat}
        </span>
        <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border mx-auto md:mx-0 ${
          isEnEspera ? 'bg-amber-100 text-amber-700 border-amber-200' :
          isCompletada ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
          'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {cita.estado.replace('_', ' ')}
        </span>
      </div>

      {/* INFORMACIÓN DEL PACIENTE */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <PawPrint size={12}/> Paciente
          </p>
          <p className="text-lg font-black text-slate-800 leading-none">
            {cita.mascota?.nombre} 
            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full ml-2 align-middle">
              {cita.mascota?.especie}
            </span>
          </p>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 pt-1">
            <User size={12}/> {nombreDueño}
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Stethoscope size={12}/> Motivo Clínico
          </p>
          <p className="text-sm font-bold text-slate-700 leading-snug">
            {cita.servicio?.nombre}
          </p>
          <p className="text-xs text-slate-500 line-clamp-2" title={cita.motivo}>
            {cita.motivo}
          </p>
        </div>
      </div>

      {/* ACCIONES DEL MÉDICO */}
      <div className="shrink-0 md:w-48 flex flex-col justify-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200/60">
        {isEnEspera && (
          <>
            <button 
              onClick={() => onAtender(cita)}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <PlayCircle size={18}/> Iniciar Consulta
            </button>
            <button 
              onClick={() => onFinalizar(cita)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18}/> Finalizar
            </button>
          </>
        )}

        {isPendiente && (
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
            <AlertCircle size={18} className="mx-auto text-slate-400 mb-1" />
            <p className="text-[10px] font-black text-slate-500 uppercase">Esperando Recepción</p>
          </div>
        )}

        {isCompletada && (
          <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition-all">
            Ver Resumen
          </button>
        )}
      </div>
    </div>
  );
};

export default CitaCardVeterinario;