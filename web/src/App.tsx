import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Inicio } from './pages/Inicio';
import { Resultados } from './pages/Resultados';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const handleLogin = (newToken: string, newUser: { id: string; username: string }) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-dark-bg">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/resultados" element={<Resultados />} />
            <Route path="/varredura" element={<PlaceholderPage title="Varredura" />} />
            <Route path="/criticos" element={<PlaceholderPage title="Críticos" />} />
            <Route path="/logs" element={<PlaceholderPage title="Logs" />} />
            <Route path="/configuracoes" element={<PlaceholderPage title="Configurações" />} />
            <Route path="/enviar" element={<PlaceholderPage title="Enviar Scanner" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Placeholder para páginas ainda não implementadas
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <div className="card">
        <p className="text-gray-400">Esta página está em desenvolvimento.</p>
      </div>
    </div>
  );
};

export default App;
