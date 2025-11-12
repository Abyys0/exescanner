import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, FileSearch, Clock, TrendingUp } from 'lucide-react';
import { sessionsAPI, resultsAPI } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: 'border-neon-blue text-neon-blue',
    green: 'border-neon-green text-neon-green',
    red: 'border-neon-red text-neon-red',
    yellow: 'border-yellow-500 text-yellow-500'
  };

  return (
    <div className={`card card-hover border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <TrendingUp size={12} />
              {trend}
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const Inicio: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalAnalyzed: 0,
    suspects: 0,
    criticals: 0,
    activeSessions: 0,
    avgDuration: '0s'
  });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [sessionsRes, resultsRes, criticalRes] = await Promise.all([
          sessionsAPI.getAll(),
          resultsAPI.getAll({ page: 1, limit: 1000 }),
          resultsAPI.getCritical()
        ]);

        const sessions = sessionsRes.data;
        const results = resultsRes.data.results;
        const criticals = criticalRes.data;

        // Calculate metrics
        const activeSessions = sessions.filter((s: any) => s.status === 'running').length;
        const totalAnalyzed = results.length;
        const suspects = results.filter((r: any) => r.severity !== 'LOW').length;
        const criticalCount = criticals.length;

        // Calculate average duration
        const completedSessions = sessions.filter((s: any) => s.status === 'completed');
        const avgMs = completedSessions.length > 0
          ? completedSessions.reduce((sum: number, s: any) => {
              const duration = s.endTime 
                ? new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
                : 0;
              return sum + duration;
            }, 0) / completedSessions.length
          : 0;
        
        const avgDuration = avgMs > 0 
          ? `${Math.round(avgMs / 1000)}s`
          : '0s';

        setMetrics({
          totalAnalyzed,
          suspects,
          criticals: criticalCount,
          activeSessions,
          avgDuration
        });
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Painel de Controle</h1>
        <p className="text-gray-400">Visão geral do sistema de varredura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Arquivos Analisados"
          value={metrics.totalAnalyzed}
          icon={<FileSearch size={48} />}
          color="blue"
          trend="Total acumulado"
        />
        <MetricCard
          title="Arquivos Suspeitos"
          value={metrics.suspects}
          icon={<AlertTriangle size={48} />}
          color="yellow"
          trend={`${((metrics.suspects / metrics.totalAnalyzed) * 100).toFixed(1)}% do total`}
        />
        <MetricCard
          title="Detecções Críticas"
          value={metrics.criticals}
          icon={<AlertTriangle size={48} />}
          color="red"
          trend="Requer atenção imediata"
        />
        <MetricCard
          title="Varreduras Ativas"
          value={metrics.activeSessions}
          icon={<Activity size={48} />}
          color="green"
          trend={`Duração média: ${metrics.avgDuration}`}
        />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
        <p className="text-gray-400">
          Sistema operacional. Use a navegação à esquerda para acessar as páginas de monitoramento.
        </p>
      </div>
    </div>
  );
};
