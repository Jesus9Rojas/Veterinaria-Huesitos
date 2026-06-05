import { Edit2, ShieldAlert, ShieldCheck } from 'lucide-react';

const ServicioTable = ({ servicios, onEditar, onEstado }) => {
  if (servicios.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200">
        No hay servicios registrados aún.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Servicio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Duración</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="hover:bg-sky-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-slate-900">{servicio.nombre}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[250px]">{servicio.descripcion}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-black text-slate-900">S/. {servicio.precio.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-600">{servicio.duracionMinutos} min</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${servicio.activo ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                    {servicio.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2 justify-center">
                  <button 
                    onClick={() => onEditar(servicio)} 
                    className="bg-white hover:bg-sky-50 text-sky-600 p-2 rounded-lg transition-all border border-slate-200 hover:border-sky-200 shadow-sm"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onEstado(servicio.id, !servicio.activo)} 
                    className={`p-2 rounded-lg transition-all border shadow-sm ${servicio.activo ? "bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border-slate-200 hover:border-red-200" : "bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 border-slate-200 hover:border-emerald-200"}`}
                    title={servicio.activo ? "Desactivar" : "Activar"}
                  >
                    {servicio.activo ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicioTable;