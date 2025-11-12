import React, { useEffect, useState } from 'react';
import { resultsAPI } from '../services/api';
import { Result } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const Resultados: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const loadResults = async () => {
    setLoading(true);
    try {
      const response = await resultsAPI.getAll({ 
        page, 
        limit: 20,
        severity: severityFilter || undefined
      });
      setResults(response.data.results);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [page, severityFilter]);

  const handleAcknowledge = async (id: string) => {
    try {
      await resultsAPI.acknowledge(id);
      loadResults();
      setSelectedResult(null);
    } catch (error) {
      console.error('Erro ao marcar como revisado:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      LOW: 'badge-low',
      MEDIUM: 'badge-medium',
      HIGH: 'badge-high',
      CRITICAL: 'badge-critical'
    }[severity] || 'badge-low';

    return <span className={`badge ${classes}`}>{severity}</span>;
  };

  if (loading && results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resultados da Varredura</h1>
          <p className="text-gray-400">Todos os arquivos detectados pelo scanner</p>
        </div>
        
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="input"
        >
          <option value="">Todas as Severidades</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-bg border-b border-dark-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Arquivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Severidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {results.map((result) => (
                <tr
                  key={result.id}
                  onClick={() => setSelectedResult(result)}
                  className="table-row"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-100">{result.fileName}</div>
                    <div className="text-xs text-gray-500 truncate max-w-md">{result.filePath}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{result.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSeverityBadge(result.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.reviewed ? (
                      <span className="flex items-center gap-1 text-neon-green text-sm">
                        <CheckCircle size={16} /> Revisado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-500 text-sm">
                        <AlertTriangle size={16} /> Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(result.timestamp).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum resultado encontrado
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border">
            <p className="text-sm text-gray-400">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        title="Detalhes da Detecção"
      >
        {selectedResult && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Arquivo</label>
              <p className="font-medium">{selectedResult.fileName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Caminho Completo</label>
              <p className="text-sm break-all">{selectedResult.filePath}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Tipo</label>
                <p>{selectedResult.type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Severidade</label>
                <div className="mt-1">{getSeverityBadge(selectedResult.severity)}</div>
              </div>
            </div>
            {selectedResult.hash && (
              <div>
                <label className="text-sm text-gray-400">Hash SHA256</label>
                <p className="text-xs font-mono break-all">{selectedResult.hash}</p>
              </div>
            )}
            {selectedResult.details && (
              <div>
                <label className="text-sm text-gray-400">Detalhes</label>
                <pre className="text-xs bg-dark-bg p-3 rounded mt-1 overflow-auto max-h-40">
                  {JSON.stringify(selectedResult.details, null, 2)}
                </pre>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              {!selectedResult.reviewed && (
                <button
                  onClick={() => handleAcknowledge(selectedResult.id)}
                  className="btn btn-primary"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Marcar como Revisado
                </button>
              )}
              <button
                onClick={() => setSelectedResult(null)}
                className="btn btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
