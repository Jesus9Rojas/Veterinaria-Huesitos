import { PawPrint, User, Smartphone, ChevronRight } from 'lucide-react';

const PacienteCard = ({ paciente, onVerPerfil }) => {
  // Manejo de nombres por si la base de datos usa "dueño" o "dueno"
  const nombreDueno = paciente.dueño?.nombreCompleto || paciente.dueno?.nombreCompleto || 'Sin dueño asignado';
  const telefonoDueno = paciente.dueño?.telefono || paciente.dueno?.telefono || 'No registrado';
  
  // Extraemos la primera letra del nombre para el Avatar si no hay foto
  const inicialMascota = paciente.nombre ? paciente.nombre.charAt(0).toUpperCase() : 'M';

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 group flex flex-col h-full">
      
      {/* CABECERA DE LA TARJETA: FOTO Y NOMBRE */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 border border-indigo-100 flex items-center justify-center font-black text-2xl shrink-0 overflow-hidden shadow-inner">
          {paciente.fotoUrl && paciente.fotoUrl !== "/uploads/defecto-mascota.png" ? (
            <img src={paciente.fotoUrl} alt={paciente.nombre} className="w-full h-full object-cover" />
          ) : (
            inicialMascota
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-slate-800 truncate" title={paciente.nombre}>
            {paciente.nombre}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
              {paciente.especie}
            </span>
            <span className="text-xs font-semibold text-slate-400 truncate">
              {paciente.raza || 'Raza Mixta'}
            </span>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DEL DUEÑO (CONTACTO) */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-auto space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto Responsable</p>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 truncate">
          <User size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">{nombreDueno}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 truncate">
          <Smartphone size={14} className="text-slate-400 shrink-0" />
          <span>{telefonoDueno}</span>
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN */}
      <button 
        onClick={() => onVerPerfil(paciente)}
        className="w-full mt-4 py-3 bg-white border-2 border-indigo-50 hover:bg-indigo-50 hover:border-indigo-100 text-indigo-600 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:text-white"
      >
        <PawPrint size={16} /> Ver Perfil Médico <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default PacienteCard;