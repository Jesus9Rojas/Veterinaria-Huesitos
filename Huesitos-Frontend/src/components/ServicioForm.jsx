import { useState } from "react";
import { PlusCircle, Stethoscope, Tag, Clock, FileText, ChevronDown } from 'lucide-react';

// Catálogo predefinido
const CATALOGO_PREDEFINIDO = [
  {
    categoria: "Consultas Médicas",
    servicios: [
      { nombre: "Consulta general", precio: 80.00 },
      { nombre: "Consulta general - Medicina felina", precio: 100.00 },
      { nombre: "Consulta de urgencia", precio: 120.00 },
      { nombre: "Consulta a domicilio", precio: 150.00 },
      { nombre: "Consulta de emergencia", precio: 160.00 },
    ]
  },
  {
    categoria: "Especialidades",
    servicios: [
      { nombre: "Consulta de Cardiología", precio: 250.00 },
      { nombre: "Consulta de Dermatología", precio: 250.00 },
      { nombre: "Consulta de Cirugía", precio: 250.00 },
      { nombre: "Consulta de Oncología", precio: 250.00 },
      { nombre: "Consulta de Endocrinología", precio: 250.00 },
      { nombre: "Consulta de Neurología", precio: 250.00 },
      { nombre: "Consulta de Nutrición", precio: 335.00 },
      { nombre: "Consulta de Medicina Física / Fisioterapia", precio: 175.00 },
      { nombre: "Consulta de Traumatología y Ortopedia", precio: 275.00 },
      { nombre: "Consulta de Oftalmología", precio: 300.00 },
    ]
  },
  {
    categoria: "Vacunas",
    servicios: [
      { nombre: "Vacuna Antirrábica", precio: 50.00 },
      { nombre: "Vacuna Quíntuple", precio: 100.00 },
      { nombre: "Vacuna Triple Felina", precio: 90.00 },
      { nombre: "Vacuna Leptospirosis", precio: 45.00 },
      { nombre: "Vacuna Puppy DP", precio: 60.00 },
      { nombre: "Vacuna Cuádruple", precio: 70.00 },
      { nombre: "Vacuna Leucemia Felina", precio: 90.00 },
    ]
  },
  {
    categoria: "Laboratorio e Imágenes",
    servicios: [
      { nombre: "Chequeo Preventivo Integral*", precio: 425.00 },
      { nombre: "Hemograma Completo", precio: 65.00 },
      { nombre: "Coprológico Completo", precio: 90.00 },
      { nombre: "Examen Completo de Orina", precio: 40.00 },
      { nombre: "Perfil Bioquímico Pre-Anestésico", precio: 320.00 },
      { nombre: "Perfil Bioquímico Diagnóstico", precio: 200.00 },
      { nombre: "Perfil Bioquímico Integral", precio: 270.00 },
    ]
  },
  {
    categoria: "Internamiento",
    servicios: [
      { nombre: "Internamiento de Día (incluye fluidoterapia)", precio: 120.00 },
      { nombre: "Internamiento Día Completo (incluye fluidoterapia)", precio: 200.00 },
      { nombre: "Internamiento de Día (incluye fluidoterapia) - Paciente infeccioso*", precio: 170.00 },
      { nombre: "Internamiento Día Completo (incluye fluidoterapia) - Paciente infeccioso*", precio: 250.00 },
    ]
  }
];

const ServicioForm = ({ onGuardar }) => {
  const estadoInicial = { nombre: "", descripcion: "", duracionMinutos: "", precio: "" };
  const [form, setForm] = useState(estadoInicial);

  const handleSelectChange = (e) => {
    const nombreSeleccionado = e.target.value;
    let precioEncontrado = "";
    for (const cat of CATALOGO_PREDEFINIDO) {
      const servicio = cat.servicios.find(s => s.nombre === nombreSeleccionado);
      if (servicio) {
        precioEncontrado = servicio.precio;
        break;
      }
    }
    setForm({ ...form, nombre: nombreSeleccionado, precio: precioEncontrado });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({ ...form, duracionMinutos: parseInt(form.duracionMinutos), precio: parseFloat(form.precio) });
    setForm(estadoInicial);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-3 mb-2 flex items-center gap-2">
        <Stethoscope className="text-sky-500" size={18} /> Registrar Nuevo Servicio
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <select name="nombre" value={form.nombre} onChange={handleSelectChange} required 
            className="w-full border border-slate-300 p-2.5 pl-4 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white appearance-none">
            <option value="">-- Selecciona un servicio --</option>
            {CATALOGO_PREDEFINIDO.map((categoria, idx) => (
              <optgroup key={idx} label={categoria.categoria}>
                {categoria.servicios.map((s, i) => <option key={i} value={s.nombre}>{s.nombre}</option>)}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={18} />
        </div>

        <div className="relative">
          <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
          <input type="number" step="0.01" name="precio" value={form.precio} placeholder="Precio (S/.)" onChange={handleChange} required 
            className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white" />
        </div>
      </div>

      <div className="relative">
        <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
        <textarea name="descripcion" value={form.descripcion} placeholder="Descripción detallada del servicio..." onChange={handleChange} required rows="2"
          className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white" />
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative w-1/3">
          <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
          <input type="number" name="duracionMinutos" value={form.duracionMinutos} placeholder="Minutos" onChange={handleChange} required 
            className="w-full pl-10 border border-slate-300 p-2.5 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50 focus:bg-white" />
        </div>
        
        <button type="submit" className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2">
          <PlusCircle size={18} /> Guardar Servicio
        </button>
      </div>
    </form>
  );
};

export default ServicioForm;