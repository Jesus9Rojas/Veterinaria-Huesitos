import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, ArrowLeft, Activity, ClipboardList, Receipt, Syringe, FileCode, User, Smartphone 
} from 'lucide-react';

import { obtenerMascotaPorId } from '../../../services/mascotaService';
import { 
  listarConsultasPorMascota, registrarConsultaMedica,
  listarRecetasPorMascota, registrarReceta,
  listarVacunasPorMascota, registrarVacuna,
  listarDesparasitacionesPorMascota, registrarDesparasitacion,
  listarArchivosPorMascota, registrarArchivoClinico
} from '../../../services/historialService';

import TabConsultas from '../components/TabConsultas';
import TabRecetas from '../components/TabRecetas';
import TabProfilaxis from '../components/TabProfilaxis';
import TabArchivos from '../components/TabArchivos';

const HistorialClinicoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mascota, setMascota] = useState(null);
  const [tab, setTab] = useState('CONSULTAS');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Estados de datos clínicos
  const [consultas, setConsultas] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [desparasitaciones, setDesparasitaciones] = useState([]);
  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const cargarTodoElHistorial = async () => {
      try {
        setLoading(true);
        const [pet, cons, rec, vac, desp, arch] = await Promise.all([
          obtenerMascotaPorId(id),
          listarConsultasPorMascota(id),
          listarRecetasPorMascota(id),
          listarVacunasPorMascota(id),
          listarDesparasitacionesPorMascota(id),
          listarArchivosPorMascota(id)
        ]);

        if (isMounted) {
          setMascota(pet);
          setConsultas(cons.sort((a,b) => b.id - a.id));
          setRecetas(rec.sort((a,b) => b.id - a.id));
          setVacunas(vac.sort((a,b) => b.id - a.id));
          setDesparasitaciones(desp.sort((a,b) => b.id - a.id));
          setArchivos(arch.sort((a,b) => b.id - a.id));
          setLoading(false);
        }
      } catch (error) {
        console.error("Error cargando historial médico:", error);
        if (isMounted) setLoading(false);
      }
    };

    cargarTodoElHistorial();
    return () => { isMounted = false; };
  }, [id, refresh]);

  // --- MÉTODOS DE REGISTRO EN BASE DE DATOS ---
  const handleGuardarConsulta = async (data) => {
    try {
      await registrarConsultaMedica({ ...data, mascota: { id: parseInt(id) } });
      setRefresh(prev => prev + 1);
    } catch (error) { 
      console.error("Error al registrar consulta:", error);
      alert("Error al registrar consulta."); 
    }
  };

  const handleGuardarReceta = async (data) => {
    try {
      await registrarReceta({ ...data, mascota: { id: parseInt(id) } });
      setRefresh(prev => prev + 1);
    } catch (error) { 
      console.error("Error al emitir receta:", error);
      alert("Error al emitir receta."); 
    }
  };

  const handleGuardarVacuna = async (data) => {
    try {
      await registrarVacuna({ ...data, mascota: { id: parseInt(id) }, fechaAplicacion: new Date().toISOString().split('T')[0] });
      setRefresh(prev => prev + 1);
    } catch (error) { 
      console.error("Error al guardar vacuna:", error);
      alert("Error al guardar vacuna."); 
    }
  };

  const handleGuardarDesparasitacion = async (data) => {
    try {
      await registrarDesparasitacion({ ...data, mascota: { id: parseInt(id) }, fechaAplicacion: new Date().toISOString().split('T')[0] });
      setRefresh(prev => prev + 1);
    } catch (error) { 
      console.error("Error al guardar desparasitación:", error);
      alert("Error al guardar desparasitación."); 
    }
  };

  const handleGuardarArchivo = async (data) => {
    try {
      await registrarArchivoClinico({ ...data, mascota: { id: parseInt(id) }, fechaSubida: new Date().toISOString().split('T')[0] });
      setRefresh(prev => prev + 1);
    } catch (error) { 
      console.error("Error al registrar archivo:", error);
      alert("Error al registrar archivo."); 
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-indigo-500 font-semibold animate-pulse gap-3">
        <Activity className="animate-spin" size={36} />
        <p>Extrayendo registro e historial de la mascota...</p>
      </div>
    );
  }

  const nombreDueño = mascota?.dueño?.nombreCompleto || mascota?.dueno?.nombreCompleto || 'Desconocido';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* CABECERA CON ACCESO DIRECTO AL RETORNO */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 shrink-0">
        <button onClick={() => navigate('/veterinario/pacientes')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20}/>
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <HeartPulse className="text-rose-500" /> Historial Clínico Completo
        </h1>
      </div>

      {/* MINIPANEL DE LA MASCOTA */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-black text-2xl shrink-0 border">
            {mascota?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 leading-none">
              {mascota?.nombre} <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border">{mascota?.especie}</span>
            </h2>
            <p className="text-sm font-semibold text-slate-400 mt-1.5 truncate">Raza: {mascota?.raza || 'Mixta'} | Sexo: {mascota?.sexo}</p>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border flex flex-col sm:flex-row gap-4 text-xs font-bold text-slate-600 w-full md:w-auto">
          <p className="flex items-center gap-1.5"><User size={14} className="text-slate-400"/> Tutor: {nombreDueño}</p>
          <p className="flex items-center gap-1.5"><Smartphone size={14} className="text-slate-400"/> Teléfono: {mascota?.dueño?.telefono || mascota?.dueno?.telefono}</p>
        </div>
      </div>

      {/* NAVEGACIÓN POR PESTAÑAS MÉDICAS */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-1 border-slate-200">
        <button onClick={() => setTab('CONSULTAS')} className={`flex items-center gap-2 px-4 py-3 font-bold transition-all border-b-2 text-sm ${tab === 'CONSULTAS' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <ClipboardList size={16}/> Consultas
        </button>
        <button onClick={() => setTab('RECETAS')} className={`flex items-center gap-2 px-4 py-3 font-bold transition-all border-b-2 text-sm ${tab === 'RECETAS' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Receipt size={16}/> Recetas
        </button>
        <button onClick={() => setTab('PROFILAXIS')} className={`flex items-center gap-2 px-4 py-3 font-bold transition-all border-b-2 text-sm ${tab === 'PROFILAXIS' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Syringe size={16}/> Vacunas y Antiparasitarios
        </button>
        <button onClick={() => setTab('ARCHIVOS')} className={`flex items-center gap-2 px-4 py-3 font-bold transition-all border-b-2 text-sm ${tab === 'ARCHIVOS' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <FileCode size={16}/> Exámenes y Archivos
        </button>
      </div>

      {/* RENDERIZADO DINÁMICO DE SUBCOMPONENTES DE LA CARPETA COMPONENTS */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm min-h-[300px]">
        {tab === 'CONSULTAS' && <TabConsultas consultas={consultas} onGuardar={handleGuardarConsulta} />}
        {tab === 'RECETAS' && <TabRecetas recetas={recetas} onGuardar={handleGuardarReceta} />}
        {tab === 'PROFILAXIS' && <TabProfilaxis vacunas={vacunas} desparasitaciones={desparasitaciones} onGuardarVacuna={handleGuardarVacuna} onGuardarDesparasitacion={handleGuardarDesparasitacion} />}
        {tab === 'ARCHIVOS' && <TabArchivos archivos={archivos} onGuardar={handleGuardarArchivo} />}
      </div>

    </div>
  );
};

export default HistorialClinicoPage;