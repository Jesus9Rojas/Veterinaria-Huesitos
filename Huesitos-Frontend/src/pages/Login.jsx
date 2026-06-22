import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/Logo Huesitos.png';
import { sileo } from 'sileo';

const BG_IMAGE_URL = null; 

const VetLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); 
  
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 

    try {
      const response = await fetch('http://localhost:8080/api/autenticacion/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          correo: email, 
          contrasena: password 
        }),
      });

      if (response.ok) {
        const data = await response.json(); 
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuarioCorreo', data.correo);
        localStorage.setItem('usuarioRol', data.rol);
        localStorage.setItem('usuarioId', data.id || data.usuarioId);
        localStorage.setItem('usuarioNombre', data.nombreCompleto || data.nombre || 'Usuario');
        localStorage.setItem('usuarioFoto', data.fotoPerfilUrl || '/uploads/defecto-usuario.png');

        sileo.success({ title: '¡Bienvenido!', description: 'Iniciando sesión...' });

        if (data.rol === 'ADMINISTRADOR') {
          navigate('/admin');
        } else if (data.rol === 'CLIENTE') {
          navigate('/');
        } else if (data.rol === 'VETERINARIO') {
          navigate('/veterinario');
        } else if (data.rol === 'RECEPCIONISTA') {
          navigate('/recepcion');
        } else if (data.rol === 'AUXILIAR_VETERINARIO') {
          navigate('/auxiliar');
        } else {
          navigate('/');  
        }
      } else {
        const errorText = await response.text();
        setErrorMsg(errorText || 'Credenciales incorrectas');
        sileo.error({ title: 'Acceso Denegado', description: errorText || 'Verifica tu correo y contraseña' });
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorMsg('Error de conexión con el servidor.');
      sileo.error({ title: 'Error de Red', description: 'No hay conexión con el servidor' });
    }
  };

  const colors = {
    blue900: '#042C53',
    blue800: '#0C447C',
    blue600: '#185FA5',
    blue400: '#378ADD',
    blue200: '#85B7EB',
    blue100: '#B5D4F4',
    blue50:  '#E6F1FB',
    red100:  '#F7C1C1',
    red600:  '#A32D2D',
    red50:   '#FCEBEB',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '840px',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        position: 'relative', 
      }}>

        {/* PANEL IZQUIERDO */}
        <div style={{
          width: '52%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: "space-between",
          overflow: 'hidden',
          minHeight: '580px',
          ...(BG_IMAGE_URL
            ? { backgroundImage: `url(${BG_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: `linear-gradient(135deg, ${colors.blue600} 0%, ${colors.blue900} 100%)` }
          ),
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, rgba(4,44,83,0.55) 0%, rgba(4,44,83,0.82) 50%, rgba(4,44,83,0.97) 100%)`, zIndex: 1 }} />

          <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem 2rem 0' }}>
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-400/30">
             <img src={logo} alt="Logo de la clínica" />
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, padding: '0 2rem 2.5rem', marginBottom: '8rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(55,138,221,0.18)', border: '1px solid rgba(133,183,235,0.3)',
              borderRadius: '999px', padding: '5px 14px', marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '14px' }}>🛡️</span>
              <span style={{ fontSize: '11px', color: colors.blue200, fontWeight: 500, letterSpacing: '0.04em' }}>Medicina veterinaria de vanguardia</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '10px' }}>
              Excelencia médica para <span style={{ color: colors.blue200 }}>quienes más amas</span>
            </h2>
            <p style={{ fontSize: '13px', color: colors.blue100, lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '280px' }}>
              Las consultas médicas nos ayudan a monitorear la salud de tu mascota con tecnología de vanguardia y especialistas certificados.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { icon: '🔬', label: 'Laboratorio 24h' },
                { icon: '🩺', label: 'Especialistas' },
                { icon: '📞', label: 'Emergencias 24/7' },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)',
                  borderRadius: '999px', padding: '5px 12px', fontSize: '12px', color: colors.blue50,
                }}>
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={{
          width: '48%', background: '#fff', padding: '2.5rem 2rem', display: 'flex',
          flexDirection: 'column', justifyContent: 'center', position: 'relative'
        }}>
          
          <button 
            onClick={() => navigate('/')} 
            style={{
              position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
              color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            ← Volver
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-cyan-300 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-400/30">
             <img src={logo} alt="Logo de la clínica" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Huesitos</div>
              <div style={{ fontSize: '11px', color: colors.blue600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clínica Veterinaria</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>Iniciar sesión</h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Bienvenido de nuevo a Huesitos</p>
          </div>

          {errorMsg && (
            <div style={{ background: colors.red50, color: colors.red600, padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '1rem', border: `1px solid ${colors.red100}` }}>
              {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>✉</span>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required
                style={{
                  width: '100%', padding: '0 11px 0 35px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0',
                  background: '#f8fafc', fontSize: '13px', color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>🔒</span>
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{
                  width: '100%', padding: '0 38px 0 35px', height: '42px', borderRadius: '10px', border: '1px solid #e2e8f0',
                  background: '#f8fafc', fontSize: '13px', color: '#0f172a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <button
                type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', padding: 0 }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
            <a href="#" style={{ fontSize: '12px', color: colors.blue600, textDecoration: 'none', fontWeight: 500 }}>¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="button" onClick={handleSubmit}
            style={{
              width: '100%', height: '44px', background: colors.blue600, color: colors.blue50, border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
             Ingresar
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1rem 0' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '1rem' }}>
            ¿Nuevo aquí? <Link to="/registro" style={{ color: colors.blue600, textDecoration: 'none', fontWeight: 600 }}>Crea una cuenta</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default VetLogin;