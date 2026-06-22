import { useState } from 'react';
import { FileCode, Plus, ExternalLink } from 'lucide-react';
import { sileo } from 'sileo';

const TabArchivos = ({ archivos, onGuardar }) => {
  const [form, setForm] = useState({ nombre: '', tipoArchivo: 'LABORATORIO', urlArchivo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Aquí envolvemos la llamada onGuardar (que viene del componente padre) en una promesa
    try {
      sileo.promise(Promise.resolve(onGuardar(form)), {
        loading: { title: 'Vinculando documento...' },
        success: { title: '¡Éxito!', description: 'El documento fue enlazado al historial del paciente.' },
        error: { title: 'Error', description: 'No se pudo vincular el documento.' }
      });
      setForm({ nombre: '', tipoArchivo: 'LABORATORIO', urlArchivo: '' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Plus size={14}/> Vincular Examen Externo (Laboratorio / Rayos X)
        </h4>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Nombre descriptivo del examen</label>
            <input required type="text" placeholder="Ej. Hemograma Completo Digital" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full p-2.5 border bg-white rounded-xl outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Categoría Médica</label>
            <select value={form.tipoArchivo} onChange={e => setForm({...form, tipoArchivo: e.target.value})} className="w-full p-2.5 border bg-white rounded-xl outline-none font-bold focus:ring-2 focus:ring-slate-500">
              <option value="LABORATORIO">ANÁLISIS LABORATORIO</option>
              <option value="IMAGENOLOGIA">ECOGRAFÍA / RAYOS X</option>
              <option value="OTROS">OTROS DOCUMENTOS</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">URL de Documento / Visor</label>
            <input required type="text" placeholder="http://..." value={form.urlArchivo} onChange={e => setForm({...form, urlArchivo: e.target.value})} className="w-full p-2.5 border bg-white rounded-xl outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <button type="submit" className="sm:col-span-3 py-3 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"><FileCode size={16}/> Enlazar Documento Clínico</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archivos.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-6 text-center md:col-span-2">No se registran archivos adjuntos para este paciente.</p>
        ) : (
          archivos.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="min-w-0 flex-1 pr-3">
                <span className="inline-block px-2 py-0.5 rounded text-[8px] font-black bg-slate-100 border text-slate-500 tracking-wider uppercase mb-1">{a.tipoArchivo}</span>
                <p className="text-sm font-black text-slate-700 truncate">{a.nombre}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Subido: {new Date(a.fechaSubida || new Date()).toLocaleDateString('es-PE')}</p>
              </div>
              <a href={a.urlArchivo} target="_blank" rel="noreferrer" className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors shrink-0">
                <ExternalLink size={16}/>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TabArchivos;