import React, { useState } from 'react';

export function App() {
  const [points, setPoints] = useState(150); // Simulación inicial
  const [logs, setLogs] = useState([
    { id: 1, action: 'Reciclaje Botella PET', date: '2024-05-20', points: +10 },
    { id: 2, action: 'Canje de Cupón', date: '2024-05-19', points: -50 },
  ]);

  const handleRecycle = () => {
    setPoints(points + 10);
    setLogs([{ id: Date.now(), action: 'Nuevo Reciclaje (Simulado)', date: new Date().toLocaleDateString(), points: 10 }, ...logs]);
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: '#2d3436', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>♻️ Eco-UCE Dashboard</h2>
        <span>Usuario: Santiago Almeida</span>
      </nav>

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

          {/* Columna Izquierda: Perfil y Puntos */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Mi Perfil</h3>
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <div style={{ fontSize: '4rem' }}>👤</div>
              <p style={{ fontSize: '1.2rem', color: '#636e72' }}>Puntos Acumulados</p>
              <h1 style={{ fontSize: '3rem', color: '#27ae60', margin: 0 }}>{points}</h1>
            </div>
            <button
              onClick={handleRecycle}
              style={{ width: '100%', padding: '1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Registrar Reciclaje
            </button>
          </div>

          {/* Columna Derecha: Historial y Microservicios */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Estado de Microservicios */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4>Estado de Infraestructura</h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ padding: '5px 10px', borderRadius: '20px', backgroundColor: '#e1f5fe', color: '#01579b', fontSize: '0.8rem' }}>Gateway: OK</span>
                <span style={{ padding: '5px 10px', borderRadius: '20px', backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '0.8rem' }}>Auth: OK</span>
                <span style={{ padding: '5px 10px', borderRadius: '20px', backgroundColor: '#fff3e0', color: '#ef6c00', fontSize: '0.8rem' }}>Kafka: Activo</span>
              </div>
            </div>

            {/* Historial */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', flex: 1 }}>
              <h4>Actividad Reciente</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: '10px' }}>Actividad</th>
                    <th>Fecha</th>
                    <th>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '10px' }}>{log.action}</td>
                      <td>{log.date}</td>
                      <td style={{ color: log.points > 0 ? '#27ae60' : '#e74c3c' }}>{log.points > 0 ? `+${log.points}` : log.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;