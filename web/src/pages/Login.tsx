import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface LoginProps {
  onLogin: (token: string, user: { id: string; username: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      onLogin(response.token, response.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="card max-w-md w-full neon-glow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neon-blue mb-2">ExeScanner</h1>
          <p className="text-gray-400">Monitor de Varredura em Tempo Real</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-neon-red bg-opacity-10 border border-neon-red text-neon-red px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input w-full"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? <LoadingSpinner size={24} /> : 'Entrar'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            Credenciais padrão: admin / admin
          </p>
        </form>
      </div>
    </div>
  );
};
