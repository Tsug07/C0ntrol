'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface Rotina {
  id: string;
  nome: string;
  descricao: string;
  frequencia: 'diaria' | 'semanal' | 'mensal' | 'trimestral';
  proximaExecucao: string;
  ultimaExecucao: string;
  status: 'ativa' | 'pausada' | 'concluida';
}

const rotinasExemplo: Rotina[] = [
  {
    id: '1',
    nome: 'Verificar CNDs Vencendo',
    descricao: 'Verificar todas as CNDs que vencem nos próximos 30 dias',
    frequencia: 'diaria',
    proximaExecucao: '2025-12-16',
    ultimaExecucao: '2025-12-15',
    status: 'ativa',
  },
  {
    id: '2',
    nome: 'Relatório Mensal de CNDs',
    descricao: 'Gerar relatório consolidado de todas as CNDs do mês',
    frequencia: 'mensal',
    proximaExecucao: '2026-01-01',
    ultimaExecucao: '2025-12-01',
    status: 'ativa',
  },
  {
    id: '3',
    nome: 'Backup de Dados',
    descricao: 'Realizar backup dos dados do sistema',
    frequencia: 'semanal',
    proximaExecucao: '2025-12-22',
    ultimaExecucao: '2025-12-15',
    status: 'pausada',
  },
];

export default function RotinaPage() {
  const [rotinas, setRotinas] = useState<Rotina[]>(rotinasExemplo);

  const getFrequenciaLabel = (freq: Rotina['frequencia']) => {
    switch (freq) {
      case 'diaria': return 'Diária';
      case 'semanal': return 'Semanal';
      case 'mensal': return 'Mensal';
      case 'trimestral': return 'Trimestral';
    }
  };

  const getStatusColor = (status: Rotina['status']) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800 border-green-200';
      case 'pausada': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'concluida': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Rotina['status']) => {
    switch (status) {
      case 'ativa': return '▶️';
      case 'pausada': return '⏸️';
      case 'concluida': return '✅';
    }
  };

  const toggleStatus = (id: string) => {
    setRotinas(rotinas.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: r.status === 'ativa' ? 'pausada' : 'ativa'
        };
      }
      return r;
    }));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚙️ Rotinas e Automações
          </h1>
          <p className="text-gray-600">
            Gerencie tarefas automatizadas e rotinas do sistema
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <Button variant="primary">
            ➕ Nova Rotina
          </Button>
          <Button variant="outline">
            📊 Ver Histórico
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card hover={false} className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {rotinas.filter(r => r.status === 'ativa').length}
              </div>
              <div>
                <p className="text-sm text-gray-600">Rotinas Ativas</p>
                <p className="text-xl font-bold text-green-700">Executando</p>
              </div>
            </div>
          </Card>

          <Card hover={false} className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {rotinas.filter(r => r.status === 'pausada').length}
              </div>
              <div>
                <p className="text-sm text-gray-600">Rotinas Pausadas</p>
                <p className="text-xl font-bold text-yellow-700">Em Espera</p>
              </div>
            </div>
          </Card>

          <Card hover={false} className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {rotinas.length}
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Rotinas</p>
                <p className="text-xl font-bold text-blue-700">Cadastradas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Rotinas List */}
        <div className="space-y-4">
          {rotinas.map((rotina) => (
            <Card key={rotina.id} hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{getStatusIcon(rotina.status)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{rotina.nome}</h3>
                    <p className="text-gray-600 text-sm">{rotina.descricao}</p>
                    <div className="flex gap-3 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(rotina.status)}`}>
                        {rotina.status.charAt(0).toUpperCase() + rotina.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        {getFrequenciaLabel(rotina.frequencia)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Próxima execução</p>
                    <p className="font-medium text-gray-900">
                      {new Date(rotina.proximaExecucao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Última execução</p>
                    <p className="font-medium text-gray-600">
                      {new Date(rotina.ultimaExecucao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(rotina.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        rotina.status === 'ativa'
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={rotina.status === 'ativa' ? 'Pausar' : 'Ativar'}
                    >
                      {rotina.status === 'ativa' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card hover={false} className="mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚧</div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Em Desenvolvimento</h3>
              <p className="text-blue-700 text-sm">
                O módulo de Rotinas está em desenvolvimento. Em breve você poderá criar automações
                personalizadas para verificar vencimentos, gerar relatórios automáticos e muito mais.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
