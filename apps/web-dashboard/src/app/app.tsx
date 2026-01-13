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
      const resUser = await fetch(`${API_BASE}/perfil?email=${email}`);
      const dataUser = await resUser.json();
      setPoints(dataUser.puntos || 0);
      setUserName(dataUser.nombre || 'Usuario UCE');

      const resRewards = await fetch(`${API_BASE}/rewards`);
      const dataRewards = await resRewards.json();
      setRecompensas(Array.isArray(dataRewards) ? dataRewards : []);

      if (role === 'admin') {
        const resRanking = await fetch(`${API_BASE}/usuarios/todos`);
        const dataRank = await resRanking.json();
        setRanking(Array.isArray(dataRank) ? dataRank : []);

        const resReport = await fetch(`${API_BASE}/reportes/mensual`);
        const dataReport = await resReport.json();
        setReporte(dataReport);
      }
    } catch (e) { console.error("Error cargando datos", e); }
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
      if (data.token || data.status === 'Success' || data.email) {
        const finalRole = data.role || formData.role;
        setUserEmail(formData.email);
        setUserRole(finalRole);
        setToken(data.token || 'dummy');
        setIsLoggedIn(true);
        fetchData(formData.email, finalRole);
      } else { alert(data.message || "Error en credenciales"); }
    } catch (error) { alert("Error de conexión"); }
  };

  const handleRecycle = async () => {
    try {
      const res = await fetch(`${API_BASE}/sumar?puntos=10&email=${userEmail}`);
      const data = await res.json();

      // CAMBIO AQUÍ: Si hay puntos o status Success, es válido
      if (data.status === 'Success' || data.puntos !== undefined) {
        alert("¡Botella Registrada! +10 puntos");
        fetchData(userEmail, userRole!);
      } else {
        alert("Error: " + (data.message || "No se pudo actualizar"));
      }
    } catch (e) {
      alert("Error de conexión con el servidor");
    }
  };

  const handleExportCSV = () => {
    window.open(`${API_BASE}/reportes/exportar`, '_blank');
  };

  const handleRedeem = async (rewardId: string, costo: number) => {
    if (points < costo) return alert("Puntos insuficientes");
    alert(`¡Canje exitoso! Se han descontado ${costo} puntos.`);
    fetchData(userEmail, userRole!);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl p-10">
          <h1 className="text-2xl font-black text-center mb-6 text-green-600">UCE RECICLA</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <input className="w-full p-4 bg-gray-50 rounded-xl border" placeholder="Nombre" onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
            )}
            <input className="w-full p-4 bg-gray-50 rounded-xl border" placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            <input className="w-full p-4 bg-gray-50 rounded-xl border" type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} required />
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'estudiante' })} className={`flex-1 py-2 rounded-lg font-bold ${formData.role === 'estudiante' ? 'bg-white shadow' : ''}`}>Estudiante</button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'admin' })} className={`flex-1 py-2 rounded-lg font-bold ${formData.role === 'admin' ? 'bg-white shadow' : ''}`}>Admin</button>
            </div>
            <button className="w-full bg-green-600 text-white p-4 rounded-xl font-bold"> {isRegistering ? 'Crear Cuenta' : 'Entrar'} </button>
          </form>
          <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-4 text-sm text-gray-500"> {isRegistering ? 'Volver' : 'Crear cuenta nueva'} </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h2 className="font-black text-xl mb-10 flex items-center gap-2"><Recycle /> UCE</h2>
        <div className="bg-gray-800 p-4 rounded-xl mb-6">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Usuario</p>
          <p className="text-sm font-bold truncate">{userName}</p>
          <p className="text-[10px] text-green-400 font-bold uppercase">{userRole}</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="mt-auto flex items-center gap-2 text-red-400 font-bold"><LogOut size={18} /> Salir</button>
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black text-gray-800">Panel de {userRole === 'admin' ? 'Control' : 'Reciclaje'}</h1>
            {userRole === 'admin' && (
              <button onClick={handleExportCSV} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                <FileText size={20} /> EXPORTAR CSV
              </button>
            )}
          </div>

          {userRole === 'estudiante' ? (
            <div className="grid gap-6">
              <div className="bg-green-600 text-white p-10 rounded-3xl shadow-lg">
                <h3 className="text-4xl font-black mb-2">{points} PUNTOS</h3>
                <p className="mb-6 opacity-80">UCE - Campus Central</p>
                <button onClick={handleRecycle} className="bg-white text-green-600 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform">
                  + REGISTRAR BOTELLA
                </button>
              </div>

              <div className="bg-white p-8 rounded-3xl border">
                <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Trophy className="text-yellow-500" /> Recompensas</h3>
                <div className="grid grid-cols-2 gap-6">
                  {recompensas.map(r => (
                    <div key={r.id} className="p-6 bg-gray-50 rounded-2xl border flex flex-col justify-between">
                      <div>
                        <p className="font-black text-gray-800">{r.nombre}</p>
                        <p className="text-green-600 font-bold">{r.costo} pts</p>
                      </div>
                      <button
                        disabled={points < r.costo}
                        onClick={() => handleRedeem(r.id, r.costo)}
                        className={`mt-4 py-3 rounded-xl font-black text-sm transition-all ${points >= r.costo ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      >
                        {points >= r.costo ? 'CANJEAR AHORA' : `FALTAN ${r.costo - points} PTS`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border">
                  <p className="text-gray-400 text-xs font-bold uppercase">Total Botellas</p>
                  <p className="text-3xl font-black text-blue-600">{reporte.totalBotellas}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border">
                  <p className="text-gray-400 text-xs font-bold uppercase">Ahorro CO2</p>
                  <p className="text-3xl font-black text-green-600">{reporte.ahorroCO2}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border">
                  <p className="text-gray-400 text-xs font-bold uppercase">Top Estudiante</p>
                  <p className="text-lg font-black">{reporte.estudianteTop}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr><th className="p-4 text-left">Estudiante</th><th className="p-4 text-center">Puntos</th></tr>
                  </thead>
                  <tbody>
                    {ranking.map((u, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4 font-bold">{u.nombre}</td>
                        <td className="p-4 text-center text-blue-600 font-bold">{u.puntos}</td>
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