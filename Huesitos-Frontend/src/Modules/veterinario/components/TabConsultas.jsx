import { useState } from 'react';
import { Stethoscope, Plus, ClipboardList } from 'lucide-react';
import { sileo } from 'sileo';

const TabConsultas = ({ consultas, onGuardar }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ 
    motivoConsulta: '', sintomas: '', diagnostico: '', tratamiento: '', observaciones: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        motivoConsulta: form.motivoConsulta,
        sintomas: form.sintomas,
        diagnostico: form.diagnostico,
        tratamiento: form.tratamiento,
        observaciones: form.observaciones
      };

      // Llamamos a la función onGuardar del padre envolviéndola en Sileo
      sileo.promise(Promise.resolve(onGuardar(payload)), {
        loading: { title: 'Guardando consulta...' },
        success: { title: '¡Éxito!', description: 'La consulta médica ha sido anexada al historial.' },
        error: { title: 'Error', description: 'No se pudo guardar la consulta.' }
      });

      setForm({ motivoConsulta: '', sintomas: '', diagnostico: '', tratamiento: '', observaciones: '' });
      setFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
          <ClipboardList size={18} className="text-indigo-500" /> Historial de Consultas Médicas
        </h3>
        {!formOpen && (
          <button onClick={() => setFormOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-colors">
            <Plus size={14} /> Nueva Consulta
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Motivo de Consulta (Máx 250 carac.)</label>
              <input required type="text" maxLength={250} value={form.motivoConsulta} onChange={e => setForm({...form, motivoConsulta: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Observaciones / Notas Extra</label>
              <input type="text" maxLength={500} value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500" placeholder="Opcional..." />
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Síntomas / Exploración</label>
            <textarea required rows="2" value={form.sintomas} onChange={e => setForm({...form, sintomas: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Diagnóstico</label>
              <textarea required rows="2" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Tratamiento Clínico</label>
              <textarea required rows="2" value={form.tratamiento} onChange={e => setForm({...form, tratamiento: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md">Registrar Consulta</button>
          </div>
        </form>
      )}

      {/* Línea de tiempo de consultas */}
      <div className="space-y-4">
        {consultas.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-6 text-center">No se registran consultas previas para este paciente.</p>
        ) : (
          consultas.map((c) => {
            const fechaDoc = c.fecha ? new Date(c.fecha).toLocaleDateString('es-PE') : 'Fecha no registrada';
            return (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                  <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Stethoscope size={16} className="text-indigo-500"/> {c.motivoConsulta}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Cod: #{c.id} | {fechaDoc}</span>
                </div>
                <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  <p><strong className="text-slate-700">Síntomas:</strong> {c.sintomas}</p>
                  <p className="text-indigo-700"><strong className="text-slate-700">Diagnóstico:</strong> {c.diagnostico}</p>
                  <p className="text-emerald-700"><strong className="text-slate-700">Tratamiento:</strong> {c.tratamiento}</p>
                  {c.observaciones && <p className="text-slate-500"><strong className="text-slate-600">Observaciones:</strong> {c.observaciones}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TabConsultas;