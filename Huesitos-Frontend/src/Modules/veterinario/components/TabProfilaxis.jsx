import { useState, useEffect } from 'react';
import { Syringe, ShieldAlert, Plus, HelpCircle } from 'lucide-react';
import axios from 'axios';

const TabProfilaxis = ({ vacunas, desparasitaciones, onGuardarVacuna, onGuardarDesparasitacion }) => {
  const [catalogoVacunas, setCatalogoVacunas] = useState([]);
  const [formV, setFormV] = useState({ vacunaId: '', dosis: 'Primera', proximaDosis: '' }); 
  const [formD, setFormD] = useState({ tipo: 'INTERNA', producto: '', proximaFecha: '' });

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/vacunas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCatalogoVacunas(response.data || []);
      } catch (error) {
        console.error("Error al cargar vacunas.", error);
      }
    };
    cargarCatalogo();
  }, []);

  const formatearFechaSegura = (fechaStr) => {
    if (!fechaStr) return 'Sin registro';
    const soloFecha = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const partes = soloFecha.split('-');
    if (partes.length !== 3) return fechaStr; 
    return `${partes[2]}/${partes[1]}/${partes[0]}`; 
  };

  const handleVacunaSubmit = (e) => {
    e.preventDefault();
    if (!formV.vacunaId) return alert("Por favor, seleccione una vacuna de la lista.");
    
    onGuardarVacuna({
      vacuna: { id: parseInt(formV.vacunaId) },
      dosis: formV.dosis,
      fechaProximaDosis: formV.proximaDosis
    });
    setFormV({ vacunaId: '', dosis: 'Primera', proximaDosis: '' });
  };

  const handleDesparasitacionSubmit = (e) => {
    e.preventDefault();
    onGuardarDesparasitacion({
        tipo: formD.tipo,
        producto: formD.producto,
        proximaFecha: formD.proximaFecha
    });
    setFormD({ tipo: 'INTERNA', producto: '', proximaFecha: '' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      
      {/* ========================================== */}
      {/* SECCIÓN 1: VACUNAS (Catálogo MySQL)        */}
      {/* ========================================== */}
      <div className="space-y-4 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b pb-3">
          <Syringe className="text-indigo-500" size={16} /> Registro de Vacunación
        </h3>
        
        <form onSubmit={handleVacunaSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1 flex items-center gap-1">
                Biológico <HelpCircle size={12} className="text-slate-400" title="Gestionado por el Administrador" />
              </label>
              <select 
                required 
                value={formV.vacunaId} 
                onChange={e => setFormV({...formV, vacunaId: e.target.value})} 
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Seleccione Vacuna --</option>
                {catalogoVacunas.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Tipo de Dosis</label>
              <select 
                required 
                value={formV.dosis} 
                onChange={e => setFormV({...formV, dosis: e.target.value})} 
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Primera">Primera Dosis</option>
                <option value="Segunda">Segunda Dosis</option>
                <option value="Tercera">Tercera Dosis</option>
                <option value="Refuerzo Anual">Refuerzo Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Próxima Revacunación</label>
            <input 
              required 
              type="date" 
              value={formV.proximaDosis} 
              onChange={e => setFormV({...formV, proximaDosis: e.target.value})} 
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <button type="submit" className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
            <Plus size={14}/> Inyectar Vacuna
          </button>
        </form>

        <div className="overflow-x-auto text-xs max-h-60 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b font-bold"><th className="pb-2">Vacuna / Dosis</th><th className="pb-2">Fecha App.</th><th className="pb-2 text-right">Próxima</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {vacunas.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold">
                    {v.vacuna?.nombre || 'Vacuna Eliminada'} <span className="font-normal text-slate-500 ml-1">({v.dosis})</span>
                  </td>
                  <td>{formatearFechaSegura(v.fechaAplicacion)}</td>
                  <td className="text-right text-indigo-600 font-bold">{formatearFechaSegura(v.fechaProximaDosis)}</td>
                </tr>
              ))}
              {vacunas.length === 0 && <tr><td colSpan="3" className="text-center py-6 text-slate-400 italic">El paciente no tiene vacunas registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* SECCIÓN 2: ANTIPARASITARIOS (Autocompletado)*/}
      {/* ========================================== */}
      <div className="space-y-4 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b pb-3">
          <ShieldAlert className="text-amber-500" size={16} /> Antiparasitarios
        </h3>

        <form onSubmit={handleDesparasitacionSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Tipo</label>
              <select value={formD.tipo} onChange={e => setFormD({...formD, tipo: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500">
                <option value="INTERNA">INTERNA (Gastro)</option>
                <option value="EXTERNA">EXTERNA (Piel)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Fármaco / Marca</label>
              {/* Autocompletado Inteligente: Permite elegir de la lista o escribir uno nuevo */}
              <input 
                required 
                list="lista-marcas" 
                type="text" 
                placeholder="Ej: NexGard, Drontal..." 
                value={formD.producto} 
                onChange={e => setFormD({...formD, producto: e.target.value})} 
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none text-slate-700 focus:ring-2 focus:ring-amber-500" 
              />
              <datalist id="lista-marcas">
                <option value="NexGard (Afoxolaner)" />
                <option value="Bravecto (Fluralaner)" />
                <option value="Simparica (Sarolaner)" />
                <option value="Drontal Plus" />
                <option value="Endogard" />
                <option value="Broadline" />
                <option value="Frontline Plus" />
              </datalist>
            </div>
          </div>
          
          <div>
            <label className="block font-bold text-slate-600 mb-1">Próxima Aplicación</label>
            <input required type="date" value={formD.proximaFecha} onChange={e => setFormD({...formD, proximaFecha: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg bg-white outline-none text-slate-700 focus:ring-2 focus:ring-amber-500" />
          </div>

          <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
            <Plus size={14}/> Aplicar Antiparasitario
          </button>
        </form>

        <div className="overflow-x-auto text-xs max-h-60 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b font-bold"><th className="pb-2">Producto Aplicado</th><th className="pb-2">Fecha App.</th><th className="pb-2 text-right">Próxima</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {desparasitaciones.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black mr-1 border ${d.tipo === 'INTERNA' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{d.tipo}</span> 
                    <strong>{d.producto}</strong>
                  </td>
                  <td>{formatearFechaSegura(d.fechaAplicacion)}</td>
                  <td className="text-right text-amber-600 font-bold">{formatearFechaSegura(d.proximaFecha)}</td>
                </tr>
              ))}
              {desparasitaciones.length === 0 && <tr><td colSpan="3" className="text-center py-6 text-slate-400 italic">Sin antiparasitarios registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TabProfilaxis;