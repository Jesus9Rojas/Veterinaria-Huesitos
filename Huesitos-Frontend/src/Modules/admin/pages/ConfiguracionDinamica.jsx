import { useState, useEffect } from 'react';
import { Save, Settings, Mail, Clock, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';
import { sileo } from 'sileo';

const ConfiguracionDinamica = () => {
  const [config, setConfig] = useState({
    correoElectronico: '', direccionFisica: '', telefonoRegular: '', celularEmergencias: '',
    horarioSemana: '', horarioDomingo: '', moneda: 'PEN', impuestoIgv: 18
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/configuracion-negocio");
        if (response.data) setConfig(response.data);
      } catch (error) {
        console.error("Error cargando configuración:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarConfiguracion();
  }, []);

  const handleChange = (e) => setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const peticion = axios.put("http://localhost:8080/api/configuracion-negocio", config, { headers: { Authorization: `Bearer ${token}` } });
      
      sileo.promise(peticion, {
         loading: { title: 'Guardando configuración...' },
         success: { title: '¡Éxito!', description: 'Configuración guardada (Visible en Web)' },
         error: { title: 'Error', description: 'No se pudo actualizar la configuración' }
      });

      await peticion;
    } catch (error) {
      console.error("Error guardando:", error);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="flex flex-col justify-center items-center h-64 text-indigo-500 font-semibold animate-pulse gap-3"><Activity className="animate-spin" size={32} /><p>Cargando configuración...</p></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><Settings className="text-indigo-500" /> Configuración Global</h1><p className="text-slate-500 text-sm mt-1">Administra la información pública de la veterinaria.</p></div>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 space-y-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4"><Mail className="text-sky-500" size={20}/> Operaciones y Contacto</h2>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico</label><input type="email" name="correoElectronico" value={config.correoElectronico} onChange={handleChange} required className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Dirección Física</label><input type="text" name="direccionFisica" value={config.direccionFisica} onChange={handleChange} required className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Teléfono Regular</label><input type="text" name="telefonoRegular" value={config.telefonoRegular} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Celular (24/7)</label><input type="text" name="celularEmergencias" value={config.celularEmergencias} onChange={handleChange} className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 space-y-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4"><Clock className="text-emerald-500" size={20}/> Horarios de Atención</h2>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Horario Semana</label><input type="text" name="horarioSemana" value={config.horarioSemana} onChange={handleChange} required className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. Lunes a Sábado: 8:00 AM - 8:00 PM" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Horario Domingo</label><input type="text" name="horarioDomingo" value={config.horarioDomingo} onChange={handleChange} required className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. Domingos y Feriados: 9:00 AM - 2:00 PM" /></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 space-y-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4"><DollarSign className="text-amber-500" size={20}/> Configuración Financiera</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Moneda Local</label><input type="text" name="moneda" value={config.moneda} onChange={handleChange} required className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase" maxLength="3" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Impuesto / IGV (%)</label><input type="number" step="0.1" name="impuestoIgv" value={config.impuestoIgv} onChange={handleChange} required className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4"><button type="submit" disabled={guardando} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white px-9 py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"><Save size={20}/> {guardando ? 'Guardando...' : 'Guardar Cambios Globales'}</button></div>
      </form>
    </div>
  );
};

export default ConfiguracionDinamica;