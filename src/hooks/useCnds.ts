'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CND {
  id: string;
  'Cliente - Código': string;
  'Cliente - Nome': string;
  'Cliente - CNPJ': string;
  'CND': string;
  'Vencimento': string;
  'Mês Referência': string;
  status: 'Válida' | 'Vencida' | 'A Vencer';
  'Observação': string;
  'Pendência': string;
  'Responsável': string;
  'Prazo': string;
}

// Conversão do formato do banco para o formato do app
const fromDbFormat = (dbCnd: any): CND => ({
  id: dbCnd.id,
  'Cliente - Código': dbCnd.cliente_codigo || '',
  'Cliente - Nome': dbCnd.cliente_nome || '',
  'Cliente - CNPJ': dbCnd.cliente_cnpj || '',
  'CND': dbCnd.cnd || '',
  'Vencimento': dbCnd.vencimento || '',
  'Mês Referência': dbCnd.mes_referencia || '',
  status: dbCnd.status,
  'Observação': dbCnd.observacao || '',
  'Pendência': dbCnd.pendencia || '',
  'Responsável': dbCnd.responsavel || '',
  'Prazo': dbCnd.prazo || ''
});

// Conversão do formato do app para o formato do banco
const toDbFormat = (cnd: CND) => ({
  id: cnd.id,
  cliente_codigo: cnd['Cliente - Código'],
  cliente_nome: cnd['Cliente - Nome'],
  cliente_cnpj: cnd['Cliente - CNPJ'],
  cnd: cnd['CND'],
  vencimento: cnd['Vencimento'],
  mes_referencia: cnd['Mês Referência'],
  status: cnd.status,
  observacao: cnd['Observação'],
  pendencia: cnd['Pendência'],
  responsavel: cnd['Responsável'],
  prazo: cnd['Prazo'] || null
});

export function useCnds() {
  const [cnds, setCnds] = useState<CND[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar CNDs
  const fetchCnds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cnds');

      if (!response.ok) {
        throw new Error('Erro ao carregar CNDs');
      }

      const data = await response.json();
      setCnds(data.map(fromDbFormat));
    } catch (err: any) {
      console.error('Erro ao carregar CNDs:', err);
      setError(err.message);
      // Fallback para localStorage
      const localData = localStorage.getItem('cnds');
      if (localData) {
        setCnds(JSON.parse(localData));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar uma CND
  const addCnd = async (cnd: CND) => {
    try {
      const response = await fetch('/api/cnds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toDbFormat(cnd))
      });

      if (!response.ok) throw new Error('Erro ao adicionar CND');

      setCnds(prev => {
        const updated = [...prev, cnd];
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao adicionar CND:', err);
      // Fallback para localStorage
      setCnds(prev => {
        const updated = [...prev, cnd];
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true, offline: true };
    }
  };

  // Adicionar múltiplas CNDs
  const addManyCnds = async (newCnds: CND[]) => {
    try {
      const response = await fetch('/api/cnds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCnds.map(toDbFormat))
      });

      if (!response.ok) throw new Error('Erro ao adicionar CNDs');

      setCnds(prev => {
        const updated = [...prev, ...newCnds];
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao adicionar CNDs:', err);
      // Fallback para localStorage
      setCnds(prev => {
        const updated = [...prev, ...newCnds];
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true, offline: true };
    }
  };

  // Atualizar CND
  const updateCnd = async (cnd: CND) => {
    try {
      const response = await fetch(`/api/cnds/${cnd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toDbFormat(cnd))
      });

      if (!response.ok) throw new Error('Erro ao atualizar CND');

      setCnds(prev => {
        const updated = prev.map(c => c.id === cnd.id ? cnd : c);
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao atualizar CND:', err);
      // Fallback para localStorage
      setCnds(prev => {
        const updated = prev.map(c => c.id === cnd.id ? cnd : c);
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true, offline: true };
    }
  };

  // Excluir CND
  const deleteCnd = async (id: string) => {
    try {
      const response = await fetch(`/api/cnds/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao excluir CND');

      setCnds(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao excluir CND:', err);
      // Fallback para localStorage
      setCnds(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true, offline: true };
    }
  };

  // Excluir CNDs por mês
  const deleteCndsByMonth = async (mes: string) => {
    try {
      const response = await fetch(`/api/cnds?mes=${encodeURIComponent(mes)}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao excluir CNDs do mês');

      setCnds(prev => {
        const updated = prev.filter(c => c['Mês Referência'] !== mes);
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao excluir CNDs do mês:', err);
      // Fallback para localStorage
      setCnds(prev => {
        const updated = prev.filter(c => c['Mês Referência'] !== mes);
        localStorage.setItem('cnds', JSON.stringify(updated));
        return updated;
      });
      return { success: true, offline: true };
    }
  };

  // Limpar todas as CNDs
  const clearAllCnds = async () => {
    try {
      const response = await fetch('/api/cnds', {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao limpar CNDs');

      setCnds([]);
      localStorage.removeItem('cnds');
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao limpar CNDs:', err);
      // Fallback para localStorage
      setCnds([]);
      localStorage.removeItem('cnds');
      return { success: true, offline: true };
    }
  };

  useEffect(() => {
    fetchCnds();
  }, [fetchCnds]);

  return {
    cnds,
    loading,
    error,
    addCnd,
    addManyCnds,
    updateCnd,
    deleteCnd,
    deleteCndsByMonth,
    clearAllCnds,
    refetch: fetchCnds
  };
}
