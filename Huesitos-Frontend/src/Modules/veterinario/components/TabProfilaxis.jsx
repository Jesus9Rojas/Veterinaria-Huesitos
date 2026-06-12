import { useState } from 'react';
import { Syringe, ShieldAlert, Plus } from 'lucide-react';

const TabProfilaxis = ({ vacunas, desparasitaciones, onGuardarVacuna, onGuardarDesparasitacion }) => {
  // Añadimos el campo "dosis" y ajustamos la estructura para que encaje con HistorialVacunacion
  const [formV, setFormV] = useState({ vacuna: { id: 1 }, dosis: 'Primera', proximaDosis: '' }); 
  const [formD, setFormD] = useState({ tipo: 'INTERNA', producto: '', fechaProximaAplicacion: '' })
  // Nota: Para "vacuna.id", idealmente aquí se haría un GET a /api/vacunas para mostrar un select con el catálogo, 
  // pero para no complicar el formulario, enviaremos temporalmente el ID 1 o puedes modificarlo si tu backend recibe nombres.

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      
      {/* SECCIÓN VACUNAS */}
      <div className="space-y-4 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b pb-3">
          <Syringe className="text-indigo-500" size={16} /> Registro de Vacunación
        </h3>
        
        <form onSubmit={(e) => { e.preventDefault(); onGuardarVacuna(formV); setFormV({ vacuna: { id: 1 }, dosis: 'Primera', proximaDosis: '' }); }} className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <input required type="number" placeholder="ID Vacuna (Catálogo)" value={formV.vacuna.id} onChange={e => setFormV({...formV, vacuna: { id: parseInt(e.target.value) }})} className="p-2 border rounded-lg bg-white outline-none" />
          <input required type="text" placeholder="Dosis (Ej. Primera, Anual)" value={formV.dosis} onChange={e => setFormV({...formV, dosis: e.target.value})} className="p-2 border rounded-lg bg-white outline-none" />
          <input required type="date" value={formV.proximaDosis} onChange={e => setFormV({...formV, proximaDosis: e.target.value})} className="p-2 border rounded-lg bg-white outline-none" title="Próxima Dosis" />
          <button type="submit" className="sm:col-span-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"><Plus size={12}/> Inyectar Vacuna</button>
        </form>

        <div className="overflow-x-auto text-xs max-h-60 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b font-bold"><th className="pb-2">Vacuna / Dosis</th><th className="pb-2">Fecha</th><th className="pb-2 text-right">Próxima</th></tr>
            </thead>
            <tbody className="divide-y font-medium text-slate-700">
              {vacunas.map(v => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-2.5 font-bold">
                    {v.vacuna?.nombre || 'Vacuna Clínica'} <span className="font-normal text-slate-500 ml-1">({v.dosis})</span>
                  </td>
                  <td>{new Date(v.fechaAplicacion).toLocaleDateString('es-PE')}</td>
                  <td className="text-right text-indigo-600 font-bold">{new Date(v.proximaDosis).toLocaleDateString('es-PE')}</td>
                </tr>
              ))}
              {vacunas.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-slate-400 italic">Sin vacunas históricas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN DESPARASITACIÓN (Esta parte estaba perfecta, no se tocó) */}
      <div className="space-y-4 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b pb-3">
          <ShieldAlert className="text-amber-500" size={16} /> Antiparasitarios
        </h3>

        <form onSubmit={(e) => { e.preventDefault(); onGuardarDesparasitacion(formD); setFormD({ tipo: 'INTERNA', producto: '', proximaFecha: '' }); }} className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <select value={formD.tipo} onChange={e => setFormD({...formD, tipo: e.target.value})} className="p-2 border rounded-lg bg-white outline-none font-bold">
            <option value="INTERNA">INTERNA</option>
            <option value="EXTERNA">EXTERNA</option>
          </select>
          <input required type="text" placeholder="Fármaco / Marca" value={formD.producto} onChange={e => setFormD({...formD, producto: e.target.value})} className="p-2 border rounded-lg bg-white outline-none" />
          <input required type="date" value={formD.proximaFecha} onChange={e => setFormD({...formD, proximaFecha: e.target.value})} className="p-2 border rounded-lg bg-white outline-none" title="Próxima Desparasitación" />
          <button type="submit" className="sm:col-span-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"><Plus size={12}/> Aplicar Antiparasitario</button>
        </form>

        <div className="overflow-x-auto text-xs max-h-60 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b font-bold"><th className="pb-2">Tipo / Producto</th><th className="pb-2">Fecha</th><th className="pb-2 text-right">Próxima</th></tr>
            </thead>
            <tbody className="divide-y font-medium text-slate-700">
              {desparasitaciones.map(d => (
                <tr key={d.id} className="hover:bg-slate-50"><td className="py-2.5"><span className={`px-1.5 py-0.5 rounded text-[9px] font-black mr-1 ${d.tipo === 'INTERNA' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>{d.tipo}</span> <strong>{d.producto}</strong></td><td>{new Date(d.fechaAplicacion).toLocaleDateString('es-PE')}</td><td className="text-right text-amber-600 font-bold">{new Date(d.proximaFecha).toLocaleDateString('es-PE')}</td></tr>
              ))}
              {desparasitaciones.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-slate-400 italic">Sin antiparasitarios cargados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TabProfilaxis;