import React, { useState, useEffect } from 'react';
import { Recycle, Trophy, LogOut, FileText, Coins, Gift } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'estudiante' | 'admin' | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [token, setToken] = useState('');
  const [points, setPoints] = useState(0);
  const [recompensas, setRecompensas] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [reporte, setReporte] = useState<any>({ totalBotellas: 0, ahorroCO2: '0kg', estudianteTop: '---' });
  const [formData, setFormData] = useState({ email: '', password: '', nombre: '', role: 'estudiante' });

  const fetchData = async (email: string, role: string) => {
    try {
      // Cargar Perfil del Usuario
      const resUser = await fetch(`${API_BASE}/perfil?email=${email}`);
      const dataUser = await resUser.json();
      setPoints(dataUser.puntos || 0);
      setUserName(dataUser.nombre || 'Usuario UCE');

      // Carga Catálogo de Recompensas
      const resRewards = await fetch(`${API_BASE}/rewards`);
      const dataRewards = await resRewards.json();
      setRecompensas(Array.isArray(dataRewards) ? dataRewards : []);

      // Carga Ranking y Reporte Dinámico
      if (role === 'admin') {
        const resRanking = await fetch(`${API_BASE}/usuarios/todos`);
        const dataRank = await resRanking.json();
        // Ordenar ranking de mayor a menor puntos
        const sortedRank = Array.isArray(dataRank) ? dataRank.sort((a: any, b: any) => b.puntos - a.puntos) : [];
        setRanking(sortedRank);

        const resReport = await fetch(`${API_BASE}/reportes/mensual`);
        const dataReport = await resReport.json();
        setReporte(dataReport);
      }
    } catch (e) {
      console.error("Error cargando datos dinámicos", e);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.status === 'Success' || data.token) {
        const emailToUse = data.email || formData.email;
        const roleToUse = data.role || formData.role;

        setUserEmail(emailToUse);
        setUserRole(roleToUse as any);
        setToken(data.token || 'dummy_token');
        setIsLoggedIn(true);

        fetchData(emailToUse, roleToUse);
      } else {
        alert(data.message || "Error en la operación");
      }
    } catch (error) {
      alert("Error de conexión con el API Gateway");
    }
  };

  const handleRecycle = async () => {
    try {
      const res = await fetch(`${API_BASE}/sumar?puntos=10&email=${userEmail}`);
      const data = await res.json();

      if (data.status === 'Success') {
        alert("¡Botella Registrada! +10 puntos");
        fetchData(userEmail, userRole!);
      } else {
        alert("Error: " + (data.message || "No se pudo actualizar"));
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const handleExportCSV = () => {
    const url = `${API_BASE}/reportes/exportar?t=${new Date().getTime()}`;
    window.open(url, '_blank');
  };

  const handleRedeem = async (rewardId: string, costo: number) => {
    if (points < costo) return alert("Puntos insuficientes");

    try {
      const res = await fetch(`${API_BASE}/sumar?puntos=${-costo}&email=${userEmail}`);
      const data = await res.json();

      if (data.status === 'Success') {
        alert(`¡Canje exitoso! Se han descontado ${costo} puntos.`);
        fetchData(userEmail, userRole!);
      } else {
        alert("Error en el canje");
      }
    } catch (e) {
      alert("Error al procesar canje");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl p-10">
          <h1 className="text-2xl font-black text-center mb-6 text-green-600 italic">UCE RECICLA</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <input className="w-full p-4 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nombre Completo" onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
            )}
            <input className="w-full p-4 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none" placeholder="Email Institucional" type="email" onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            <input className="w-full p-4 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none" type="password" placeholder="Contraseña" onChange={e => setFormData({ ...formData, password: e.target.value })} required />

            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'estudiante' })} className={`flex-1 py-2 rounded-lg font-bold transition-all ${formData.role === 'estudiante' ? 'bg-white shadow text-green-600' : 'text-gray-400'}`}>Estudiante</button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'admin' })} className={`flex-1 py-2 rounded-lg font-bold transition-all ${formData.role === 'admin' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}>Admin</button>
            </div>

            <button className="w-full bg-green-600 text-white p-4 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all">
              {isRegistering ? 'REGISTRARSE' : 'INICIAR SESIÓN'}
            </button>
          </form>
          <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-gray-600">
            {isRegistering ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10 text-green-500">
          <Recycle size={32} />
          <span className="font-black text-2xl tracking-tighter text-white">UCE</span>
        </div>

        <div className="bg-gray-800 p-4 rounded-2xl mb-6 border border-gray-700">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Usuario Activo</p>
          <p className="text-sm font-bold truncate text-white">{userName}</p>
          <p className={`text-[10px] font-black uppercase mt-1 ${userRole === 'admin' ? 'text-blue-400' : 'text-green-400'}`}>
            Perfil: {userRole}
          </p>
        </div>

        <nav className="space-y-2">
          <div className="p-3 bg-green-600/10 text-green-500 rounded-xl flex items-center gap-3 font-bold text-sm">
            <Coins size={18} /> Mi Billetera
          </div>
        </nav>

        <button onClick={() => window.location.reload()} className="mt-auto flex items-center gap-2 text-gray-500 hover:text-red-400 font-bold transition-colors">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                {userRole === 'admin' ? 'Dashboard Administrativo' : '¡Hola de nuevo! 👋'}
              </h1>
              <p className="text-gray-500 font-medium">Sistema de Gestión de Reciclaje UCE 2026</p>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={handleExportCSV}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-xl shadow-blue-200"
              >
                <FileText size={20} /> DESCARGAR REPORTES
              </button>
            )}
          </div>

          {userRole === 'estudiante' ? (
            <div className="grid gap-8">
              {/* Tarjeta de Puntos */}
              <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-green-200 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-5xl font-black mb-2">{points} PUNTOS</h3>
                  <p className="mb-8 font-bold opacity-80 uppercase tracking-widest text-sm">Créditos Disponibles para Canje</p>
                  <button
                    onClick={handleRecycle}
                    className="bg-white text-green-700 px-10 py-5 rounded-2xl font-black hover:scale-105 transition-transform shadow-lg"
                  >
                    + DEPOSITAR BOTELLA
                  </button>
                </div>
                <Recycle size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
              </div>

              {/* Sección Recompensas */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="font-black text-xl mb-8 flex items-center gap-2">
                  <Trophy className="text-yellow-500" /> Catálogo de Beneficios
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {recompensas.map(r => (
                    <div key={r.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col justify-between hover:border-green-200 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm"><Gift className="text-green-600" /></div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">{r.costo} PTS</span>
                      </div>
                      <div>
                        <p className="font-black text-gray-800 text-lg">{r.nombre}</p>
                        <p className="text-gray-500 text-xs mt-1">Válido en puntos de venta autorizados UCE.</p>
                      </div>
                      <button
                        disabled={points < r.costo}
                        onClick={() => handleRedeem(r.id, r.costo)}
                        className={`mt-6 py-4 rounded-2xl font-black text-sm transition-all ${points >= r.costo
                          ? 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        {points >= r.costo ? 'CANJEAR AHORA' : `TE FALTAN ${r.costo - points} PTS`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* VISTA ADMIN */
            <div className="grid gap-8">
              {/* Tarjetas de Reporte */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-gray-400 text-xs font-black uppercase mb-2">Reciclaje Total</p>
                  <p className="text-4xl font-black text-blue-600">{reporte.totalBotellas}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 italic">Unidades procesadas</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-gray-400 text-xs font-black uppercase mb-2">Impacto Ambiental</p>
                  <p className="text-4xl font-black text-green-600">{reporte.ahorroCO2}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 italic">Ahorro de emisiones</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-gray-400 text-xs font-black uppercase mb-2">Líder del Mes</p>
                  <p className="text-xl font-black text-gray-800 truncate">{reporte.estudianteTop}</p>
                  <p className="text-[10px] font-bold text-yellow-500 mt-2 uppercase">Máximo Colaborador</p>
                </div>
              </div>

              {/* Tabla de Ranking */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-black text-gray-800 uppercase text-sm tracking-widest">Ranking General de Estudiantes</h3>
                  <span className="text-[10px] bg-gray-200 px-2 py-1 rounded-md font-bold text-gray-500">ACTUALIZADO EN TIEMPO REAL</span>
                </div>
                <table className="w-full">
                  <thead className="bg-white border-b">
                    <tr>
                      <th className="p-5 text-left text-xs font-black text-gray-400 uppercase">Posición</th>
                      <th className="p-5 text-left text-xs font-black text-gray-400 uppercase">Estudiante</th>
                      <th className="p-5 text-center text-xs font-black text-gray-400 uppercase">Puntaje Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((u, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <td className="p-5">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="p-5">
                          <div>
                            <p className="font-bold text-gray-800">{u.nombre}</p>
                            <p className="text-[10px] text-gray-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-sm">
                            {u.puntos} pts
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;