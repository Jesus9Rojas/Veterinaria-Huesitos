import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';

const TabRecetas = ({ recetas, onGuardar }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [indicaciones, setIndicaciones] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({ indicaciones });
    setIndicaciones('');
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
          <Receipt size={18} className="text-sky-500" /> Prescripciones y Recetas
        </h3>
        {!formOpen && (
          <button onClick={() => setFormOpen(true)} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-sky-500/10 transition-colors">
            <Plus size={14} /> Emitir Receta
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Medicamentos e Indicaciones de Dosis</label>
            <textarea required rows="4" value={indicaciones} onChange={e => setIndicaciones(e.target.value)} placeholder="Ej. Amoxicilina 250mg: Dar 1 tableta cada 12 horas por 7 días vía oral..." className="w-full border border-slate-300 p-3 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-sky-500"></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md">Guardar Receta</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {recetas.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-6 text-center">No hay recetas emitidas para esta mascota.</p>
        ) : (
          recetas.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b pb-2 border-slate-100">
                <span>CÓDIGO: #REC-{r.id.toString().padStart(4, '0')}</span>
                <span>{new Date(r.fechaCreacion || new Date()).toLocaleDateString('es-PE')}</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap font-medium pt-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">{r.indicaciones}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TabRecetas;