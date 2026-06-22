import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';

const TabRecetas = ({ recetas, consultas, onGuardar }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ consultaMedicaId: '', medicamentos: '', indicaciones: '' });

  const formatearFechaSegura = (fechaStr) => {
    if (!fechaStr) return '';
    const soloFecha = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const partes = soloFecha.split('-');
    if (partes.length !== 3) return fechaStr;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({ 
      consultaMedicaId: form.consultaMedicaId, 
      medicamentos: form.medicamentos, 
      indicaciones: form.indicaciones 
    });
    setForm({ consultaMedicaId: '', medicamentos: '', indicaciones: '' });
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
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Vincular a Consulta Médica</label>
            <select required value={form.consultaMedicaId} onChange={e => setForm({...form, consultaMedicaId: e.target.value})} className="w-full border border-slate-300 p-3 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-sky-500 font-medium text-slate-700">
              <option value="">Seleccione a qué consulta pertenece esta receta...</option>
              {consultas.map(c => (
                <option key={c.id} value={c.id}>Consulta #{c.id} - {c.motivoConsulta}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lista de Medicamentos</label>
              <textarea required rows="3" value={form.medicamentos} onChange={e => setForm({...form, medicamentos: e.target.value})} placeholder="Ej. Amoxicilina 250mg, Meloxicam..." className="w-full border border-slate-300 p-3 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-sky-500"></textarea>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Indicaciones de Dosis</label>
              <textarea required rows="3" value={form.indicaciones} onChange={e => setForm({...form, indicaciones: e.target.value})} placeholder="Ej. Dar 1 tableta cada 12 horas por 7 días vía oral..." className="w-full border border-slate-300 p-3 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-sky-500"></textarea>
            </div>
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
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b pb-2 border-slate-100">
                <span className="text-sky-600">CÓDIGO RECETA: #REC-{r.id.toString().padStart(4, '0')}</span>
                <span>Emisión: {formatearFechaSegura(r.fechaEmision)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                <p className="font-black text-slate-700 mb-1">Medicamentos:</p>
                <p className="text-slate-600 whitespace-pre-wrap">{r.medicamentos}</p>
                <p className="font-black text-slate-700 mt-3 mb-1">Indicaciones:</p>
                <p className="text-slate-600 whitespace-pre-wrap">{r.indicaciones}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TabRecetas;