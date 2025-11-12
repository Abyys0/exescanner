import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  FileSearch, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Upload,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const links = [
    { to: '/', icon: Home, label: 'Início' },
    { to: '/varredura', icon: Activity, label: 'Varredura' },
    { to: '/resultados', icon: FileSearch, label: 'Resultados' },
    { to: '/criticos', icon: AlertTriangle, label: 'Críticos' },
    { to: '/logs', icon: FileText, label: 'Logs' },
    { to: '/configuracoes', icon: Settings, label: 'Configurações' },
    { to: '/enviar', icon: Upload, label: 'Enviar Scanner' }
  ];

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-2xl font-bold text-neon-blue">ExeScanner</h1>
        <p className="text-sm text-gray-400 mt-1">Monitor de Varredura</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-dark-border">
        <button
          onClick={onLogout}
          className="sidebar-link w-full text-neon-red hover:text-neon-red hover:bg-dark-bg"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
