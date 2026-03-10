'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCnds, CND } from '@/hooks/useCnds';
import * as XLSX from 'xlsx';

// Mapeamento de nomes de colunas do Excel para exibição bonita
const columnDisplayNames: Record<string, string> = {
  'Cliente - Código': 'Código',
  'Cliente - Nome': 'Cliente',
  'Cliente - CNPJ': 'CNPJ',
  'CND': 'Tipo de CND',
  'Vencimento': 'Vencimento',
  'Observação': 'Observação',
  'Pendência': 'Pendência',
  'Responsável': 'Responsável',
  'Prazo': 'Prazo'
};

type ModalType = 'success' | 'error' | 'warning' | 'confirm' | 'input';

interface ModalConfig {
  show: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  inputValue?: string;
  inputPlaceholder?: string;
  onInputChange?: (value: string) => void;
}

export default function CNDsPage() {
  // Hook do Supabase para CNDs
  const {
    cnds,
    loading: loadingCnds,
    addCnd,
    addManyCnds,
    updateCnd,
    deleteCnd,
    deleteCndsByMonth,
    clearAllCnds
  } = useCnds();

  const [showUpload, setShowUpload] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('Todos');
  const [filtroTipoCND, setFiltroTipoCND] = useState<string>('Todos');
  const [filtroMes, setFiltroMes] = useState<string>('Todos');
  const [filtroPendencia, setFiltroPendencia] = useState<string>('Todos');
  const [busca, setBusca] = useState<string>('');
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [itensPorPagina] = useState<number>(10);
  const [cndSelecionada, setCndSelecionada] = useState<CND | null>(null);
  const [showModalVer, setShowModalVer] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [cndEditando, setCndEditando] = useState<CND | null>(null);
  const [showModalAdicionar, setShowModalAdicionar] = useState(false);
  const [novaCnd, setNovaCnd] = useState<Omit<CND, 'id' | 'status'>>({
    'Cliente - Código': '',
    'Cliente - Nome': '',
    'Cliente - CNPJ': '',
    'CND': '',
    'Vencimento': '',
    'Mês Referência': new Date().toISOString().slice(0, 7),
    'Observação': '',
    'Pendência': '',
    'Responsável': '',
    'Prazo': ''
  });
  const [modal, setModal] = useState<ModalConfig>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  const calcularStatus = (vencimento: string): 'Válida' | 'Vencida' | 'A Vencer' => {
    const hoje = new Date();
    const dataVencimento = new Date(vencimento);
    const diasRestantes = Math.floor((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return 'Vencida';
    } else if (diasRestantes <= 20) {
      return 'A Vencer';
    } else {
      return 'Válida';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const mesAtual = new Date().toISOString().slice(0, 7);
      let mesReferencia = mesAtual;

      const processarArquivo = async () => {
        if (!mesReferencia) {
          setModal({
            show: true,
            type: 'error',
            title: 'Erro',
            message: 'Mês de referência é obrigatório!',
            confirmText: 'OK',
            onConfirm: () => {
              setModal({ show: false, type: 'success', title: '', message: '' });
            }
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Helper para converter qualquer formato de data para YYYY-MM-DD
            const parseDate = (raw: any): string => {
              if (!raw) return '';
              if (typeof raw === 'number') {
                // Excel serial number
                const excelEpoch = new Date(1899, 11, 30);
                const d = new Date(excelEpoch.getTime() + raw * 86400000);
                return d.toISOString().split('T')[0];
              }
              if (raw instanceof Date) {
                return raw.toISOString().split('T')[0];
              }
              if (typeof raw === 'string') {
                // DD/MM/YYYY -> YYYY-MM-DD
                const brMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (brMatch) {
                  return `${brMatch[3]}-${brMatch[2].padStart(2, '0')}-${brMatch[1].padStart(2, '0')}`;
                }
                // Já está YYYY-MM-DD
                if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
                // Tentar parse genérico
                const d = new Date(raw);
                if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
              }
              return '';
            };

            const cndsImportadas: CND[] = jsonData.map((row: any, index: number) => {
              const timestamp = Date.now();
              // Suporta ambos os formatos de coluna (antigo e novo)
              const vencimentoRaw = row['Certificado - Data de expiração (completa)'] || row['Vencimento'];
              const vencimento = parseDate(vencimentoRaw);
              const prazo = parseDate(row['Prazo']);
              const cnpjRaw = row['Cliente - CNPJ'];
              const cnpj = cnpjRaw != null ? String(cnpjRaw).trim() : '';
              const cndNome = row['Certificado - Nome'] || row['CND'] || '';

              return {
                id: `${timestamp}-${index}`,
                'Cliente - Código': String(row['Cliente - Código'] || '').trim(),
                'Cliente - Nome': String(row['Cliente - Nome'] || '').trim(),
                'Cliente - CNPJ': cnpj,
                'CND': String(cndNome).trim(),
                'Vencimento': vencimento,
                'Mês Referência': mesReferencia,
                status: calcularStatus(vencimento),
                'Observação': String(row['Observação'] || row['Observacao'] || '').trim(),
                'Pendência': String(row['Pendência'] || row['Pendencia'] || '').trim(),
                'Responsável': String(row['Responsável'] || row['Responsavel'] || '').trim(),
                'Prazo': prazo
              };
            });

            // Enviar em lotes de 100
            for (let i = 0; i < cndsImportadas.length; i += 100) {
              const batch = cndsImportadas.slice(i, i + 100);
              await addManyCnds(batch);
            }
            setShowUpload(false);
            setModal({ show: false, type: 'success', title: '', message: '' });
          } catch (error) {
            console.error('Erro ao ler arquivo:', error);
            setModal({
              show: true,
              type: 'error',
              title: 'Erro ao Processar',
              message: 'Não foi possível processar o arquivo Excel. Verifique se o formato está correto.',
              confirmText: 'OK',
              onConfirm: () => {
                setModal({ show: false, type: 'success', title: '', message: '' });
              }
            });
          }
        };
        reader.readAsArrayBuffer(file);
      };

      setModal({
        show: true,
        type: 'input',
        title: 'Mês de Referência',
        message: 'Digite o mês de referência deste relatório:',
        inputValue: mesAtual,
        inputPlaceholder: 'YYYY-MM',
        confirmText: 'Importar',
        cancelText: 'Cancelar',
        onConfirm: processarArquivo,
        onCancel: () => {
          setModal({ show: false, type: 'success', title: '', message: '' });
        },
        onInputChange: (value) => {
          mesReferencia = value;
          setModal(prev => ({ ...prev, inputValue: value }));
        }
      });
    }
  };

  const getStatusColor = (status: CND['status']) => {
    switch (status) {
      case 'Válida':
        return 'bg-green-500';
      case 'A Vencer':
        return 'bg-yellow-500';
      case 'Vencida':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Obter tipos únicos de CND
  const tiposCND = Array.from(new Set(cnds.map(cnd => cnd['CND']))).filter(Boolean);

  // Obter meses únicos de referência
  const mesesReferencia = Array.from(new Set(cnds.map(cnd => cnd['Mês Referência']))).filter(Boolean).sort().reverse();

  // CNDs filtradas apenas por mês (para os cards de estatísticas)
  const cndsDoMes = filtroMes === 'Todos'
    ? cnds
    : cnds.filter(cnd => cnd['Mês Referência'] === filtroMes);

  // Filtrar CNDs
  const cndsFiltradas = cnds.filter(cnd => {
    const passaFiltroStatus = filtroStatus === 'Todos' || cnd.status === filtroStatus;
    const passaFiltroTipo = filtroTipoCND === 'Todos' || cnd['CND'] === filtroTipoCND;
    const passaFiltroMes = filtroMes === 'Todos' || cnd['Mês Referência'] === filtroMes;

    // Filtro de pendência
    const temPendencia = cnd['Pendência'] && cnd['Pendência'].trim() !== '';
    const passaFiltroPendencia = filtroPendencia === 'Todos' ||
      (filtroPendencia === 'Com Pendência' && temPendencia) ||
      (filtroPendencia === 'Sem Pendência' && !temPendencia);

    // Filtro de busca por nome ou código
    const passaBusca = busca === '' ||
      cnd['Cliente - Nome'].toLowerCase().includes(busca.toLowerCase()) ||
      cnd['Cliente - Código'].toLowerCase().includes(busca.toLowerCase());

    return passaFiltroStatus && passaFiltroTipo && passaFiltroMes && passaFiltroPendencia && passaBusca;
  });

  // Paginação
  const totalPaginas = Math.ceil(cndsFiltradas.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const cndsExibidas = cndsFiltradas.slice(indiceInicio, indiceFim);

  // Resetar para primeira página quando filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, filtroTipoCND, filtroMes, filtroPendencia, busca]);

  // Ações
  const handleVer = (cnd: CND) => {
    setCndSelecionada(cnd);
    setShowModalVer(true);
  };

  const handleEditar = (cnd: CND) => {
    setCndEditando({...cnd});
    setShowModalEditar(true);
  };

  const handleSalvarEdicao = async () => {
    if (cndEditando) {
      const cndAtualizada = {
        ...cndEditando,
        status: calcularStatus(cndEditando['Vencimento'])
      };
      await updateCnd(cndAtualizada);
      setShowModalEditar(false);
      setCndEditando(null);
    }
  };

  const handleAdicionarManualmente = async () => {
    if (!novaCnd['Cliente - Nome'] || !novaCnd['CND'] || !novaCnd['Vencimento']) {
      setModal({
        show: true,
        type: 'error',
        title: 'Campos Obrigatórios',
        message: 'Por favor, preencha os campos: Nome do Cliente, Tipo de CND e Vencimento.',
        confirmText: 'OK',
        onConfirm: () => {
          setModal({ show: false, type: 'success', title: '', message: '' });
        }
      });
      return;
    }

    const novaCndCompleta: CND = {
      ...novaCnd,
      id: `manual-${Date.now()}`,
      status: calcularStatus(novaCnd['Vencimento'])
    };

    await addCnd(novaCndCompleta);
    setShowModalAdicionar(false);
    setNovaCnd({
      'Cliente - Código': '',
      'Cliente - Nome': '',
      'Cliente - CNPJ': '',
      'CND': '',
      'Vencimento': '',
      'Mês Referência': new Date().toISOString().slice(0, 7),
      'Observação': '',
      'Pendência': '',
      'Responsável': '',
      'Prazo': ''
    });

    setModal({
      show: true,
      type: 'success',
      title: 'CND Adicionada',
      message: 'A CND foi adicionada com sucesso!',
      confirmText: 'OK',
      onConfirm: () => {
        setModal({ show: false, type: 'success', title: '', message: '' });
      }
    });
  };

  const handleExcluir = (cnd: CND) => {
    setModal({
      show: true,
      type: 'confirm',
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a CND de ${cnd['Cliente - Nome']}?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        await deleteCnd(cnd.id);
        setModal({ show: false, type: 'success', title: '', message: '' });
      },
      onCancel: () => {
        setModal({ show: false, type: 'success', title: '', message: '' });
      }
    });
  };

  const handleLimparTodosDados = () => {
    setModal({
      show: true,
      type: 'warning',
      title: 'Atenção',
      message: 'Isso irá excluir TODOS os dados salvos. Esta ação não pode ser desfeita!',
      confirmText: 'Sim, excluir tudo',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        await clearAllCnds();
        setFiltroStatus('Todos');
        setFiltroTipoCND('Todos');
        setFiltroMes('Todos');
        setModal({ show: false, type: 'success', title: '', message: '' });
      },
      onCancel: () => {
        setModal({ show: false, type: 'success', title: '', message: '' });
      }
    });
  };

  const handleExportarExcel = () => {
    if (cndsFiltradas.length === 0) {
      setModal({
        show: true,
        type: 'warning',
        title: 'Nenhum Dado',
        message: 'Não há CNDs para exportar com os filtros atuais.',
        confirmText: 'OK',
        onConfirm: () => {
          setModal({ show: false, type: 'success', title: '', message: '' });
        }
      });
      return;
    }

    try {
      // Preparar dados para exportação
      const dadosExportacao = cndsFiltradas.map(cnd => ({
        'Cliente - Código': cnd['Cliente - Código'],
        'Cliente - Nome': cnd['Cliente - Nome'],
        'Cliente - CNPJ': cnd['Cliente - CNPJ'],
        'CND': cnd['CND'],
        'Vencimento': cnd['Vencimento'],
        'Observação': cnd['Observação'],
        'Pendência': cnd['Pendência'],
        'Responsável': cnd['Responsável'],
        'Prazo': cnd['Prazo'],
        'Mês Referência': cnd['Mês Referência'],
        'Status': cnd.status
      }));

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'CNDs');

      // Gerar nome do arquivo com data atual
      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `CNDs_Export_${dataAtual}.xlsx`;

      // Baixar arquivo
      XLSX.writeFile(wb, nomeArquivo);

      setModal({
        show: true,
        type: 'success',
        title: 'Exportação Concluída',
        message: `Arquivo ${nomeArquivo} exportado com sucesso!`,
        confirmText: 'OK',
        onConfirm: () => {
          setModal({ show: false, type: 'success', title: '', message: '' });
        }
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setModal({
        show: true,
        type: 'error',
        title: 'Erro na Exportação',
        message: 'Não foi possível exportar o arquivo. Tente novamente.',
        confirmText: 'OK',
        onConfirm: () => {
          setModal({ show: false, type: 'success', title: '', message: '' });
        }
      });
    }
  };

  const handleLimparMesEspecifico = () => {
    if (mesesReferencia.length === 0) {
      setModal({
        show: true,
        type: 'error',
        title: 'Sem Dados',
        message: 'Não há meses para remover!',
        confirmText: 'OK',
        onConfirm: () => {
          setModal({ show: false, type: 'success', title: '', message: '' });
        }
      });
      return;
    }

    let mesParaRemover = mesesReferencia[0];

    const removerMes = async () => {
      if (mesParaRemover && mesesReferencia.includes(mesParaRemover)) {
        await deleteCndsByMonth(mesParaRemover);
        setModal({ show: false, type: 'success', title: '', message: '' });
      } else {
        setModal({
          show: true,
          type: 'error',
          title: 'Mês Inválido',
          message: 'O mês digitado não existe na lista de meses disponíveis!',
          confirmText: 'OK',
          onConfirm: () => {
            setModal({ show: false, type: 'success', title: '', message: '' });
          }
        });
      }
    };

    setModal({
      show: true,
      type: 'input',
      title: 'Remover Mês',
      message: `Digite o mês que deseja remover (formato: YYYY-MM):\n\nMeses disponíveis:\n${mesesReferencia.join(', ')}`,
      inputValue: mesesReferencia[0],
      inputPlaceholder: 'YYYY-MM',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      onConfirm: removerMes,
      onCancel: () => {
        setModal({ show: false, type: 'success', title: '', message: '' });
      },
      onInputChange: (value) => {
        mesParaRemover = value;
        setModal(prev => ({ ...prev, inputValue: value }));
      }
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📋 Gerenciamento de CNDs
          </h1>
          <p className="text-gray-600">
            Controle de Certidões Negativas de Débitos com upload de planilhas Excel
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <Button variant="primary" onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? 'Cancelar Upload' : '📤 Importar Excel'}
          </Button>
          <Button variant="secondary" onClick={() => setShowModalAdicionar(true)}>
            ➕ Adicionar Manualmente
          </Button>
          <Button variant="outline" onClick={handleExportarExcel}>
            📊 Exportar Excel
          </Button>
          {cnds.length > 0 && (
            <>
              <Button variant="outline" onClick={handleLimparMesEspecifico}>
                🗑️ Remover Mês
              </Button>
              <Button variant="outline" onClick={handleLimparTodosDados}>
                ⚠️ Limpar Todos os Dados
              </Button>
            </>
          )}
        </div>

        {/* Upload Section */}
        {showUpload && (
          <Card className="mb-6 bg-gray-50">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload de Planilha Excel
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Arraste e solte o arquivo ou clique para selecionar
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                  Selecionar Arquivo
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formatos aceitos: .xlsx, .xls
              </p>
            </div>
          </Card>
        )}

        {/* Stats */}
        {cnds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card hover={false} className="bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {cndsDoMes.filter((c) => c.status === 'Válida').length}
                </div>
                <div>
                  <p className="text-sm text-gray-600">CNDs Válidas</p>
                  <p className="text-2xl font-bold text-green-700">
                    {cndsDoMes.length > 0 ? Math.round((cndsDoMes.filter((c) => c.status === 'Válida').length / cndsDoMes.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>

            <Card hover={false} className="bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {cndsDoMes.filter((c) => c.status === 'A Vencer').length}
                </div>
                <div>
                  <p className="text-sm text-gray-600">A Vencer</p>
                  <p className="text-2xl font-bold text-yellow-700">Atenção</p>
                </div>
              </div>
            </Card>

            <Card hover={false} className="bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {cndsDoMes.filter((c) => c.status === 'Vencida').length}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vencidas</p>
                  <p className="text-2xl font-bold text-red-700">Urgente</p>
                </div>
              </div>
            </Card>

            <Card hover={false} className="bg-orange-50 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {cndsDoMes.filter((c) => c['Pendência'] && c['Pendência'].trim() !== '').length}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Com Pendência</p>
                  <p className="text-2xl font-bold text-orange-700">Acompanhar</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Busca e Filtros */}
        {cnds.length > 0 && (
          <Card hover={false} className="mb-6">
            {/* Barra de Busca */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou código da empresa..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {busca && (
                  <button
                    onClick={() => setBusca('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Filtros:</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Mês:</label>
                <select
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Todos">Todos</option>
                  {mesesReferencia.map(mes => {
                    const [ano, mesNum] = mes.split('-');
                    const nomeMes = new Date(parseInt(ano), parseInt(mesNum) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                    return (
                      <option key={mes} value={mes}>{nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Status:</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Todos">Todos</option>
                  <option value="Válida">Válida</option>
                  <option value="A Vencer">A Vencer</option>
                  <option value="Vencida">Vencida</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Tipo de CND:</label>
                <select
                  value={filtroTipoCND}
                  onChange={(e) => setFiltroTipoCND(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Todos">Todos</option>
                  {tiposCND.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Pendência:</label>
                <select
                  value={filtroPendencia}
                  onChange={(e) => setFiltroPendencia(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Todos">Todos</option>
                  <option value="Com Pendência">Com Pendência</option>
                  <option value="Sem Pendência">Sem Pendência</option>
                </select>
              </div>

              <div className="ml-auto text-sm text-gray-600">
                Mostrando <span className="font-bold">{cndsFiltradas.length}</span> de <span className="font-bold">{cnds.length}</span> CNDs
              </div>
            </div>
          </Card>
        )}

        {/* CNDs Table */}
        {cnds.length > 0 ? (
          <Card hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Mês Ref.</th>
                    <th className="text-left p-4 font-semibold text-gray-700">{columnDisplayNames['Cliente - Código']}</th>
                    <th className="text-left p-4 font-semibold text-gray-700">{columnDisplayNames['Cliente - Nome']}</th>
                    <th className="text-left p-4 font-semibold text-gray-700">{columnDisplayNames['Cliente - CNPJ']}</th>
                    <th className="text-left p-4 font-semibold text-gray-700">{columnDisplayNames['CND']}</th>
                    <th className="text-left p-4 font-semibold text-gray-700">{columnDisplayNames['Vencimento']}</th>
                    <th className="text-left p-4 font-semibold text-gray-700">{columnDisplayNames['Observação']}</th>
                    <th className="text-left p-4 font-semibold text-gray-700">{columnDisplayNames['Pendência']}</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cndsExibidas.map((cnd) => {
                    const [ano, mes] = cnd['Mês Referência'].split('-');
                    const mesFormatado = new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

                    const temPendencia = cnd['Pendência'] && cnd['Pendência'].trim() !== '';

                    return (
                      <tr key={cnd.id} className={`border-b border-gray-100 hover:bg-gray-50 ${temPendencia ? 'bg-orange-50' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${getStatusColor(cnd.status)}`}
                              title={cnd.status}
                            ></span>
                            {temPendencia && (
                              <span className="text-orange-500" title="Tem pendência">⚠️</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 text-xs">{mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1)}</td>
                        <td className="p-4 text-gray-600">{cnd['Cliente - Código']}</td>
                        <td className="p-4 font-medium text-gray-900">{cnd['Cliente - Nome']}</td>
                        <td className="p-4 text-gray-600">{cnd['Cliente - CNPJ']}</td>
                        <td className="p-4 text-gray-600">{cnd['CND']}</td>
                        <td className="p-4 text-gray-600">
                          {new Date(cnd['Vencimento']).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-gray-600 max-w-xs">
                          <div className="truncate" title={cnd['Observação']}>
                            {cnd['Observação'] || '-'}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          {temPendencia ? (
                            <div className="text-orange-700">
                              <div className="font-medium truncate" title={cnd['Pendência']}>
                                {cnd['Pendência']}
                              </div>
                              {cnd['Responsável'] && (
                                <div className="text-xs text-gray-600 mt-1">
                                  👤 {cnd['Responsável']}
                                </div>
                              )}
                              {cnd['Prazo'] && (
                                <div className="text-xs text-gray-600">
                                  📅 {new Date(cnd['Prazo']).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVer(cnd)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditar(cnd)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleExcluir(cnd)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Página <span className="font-bold">{paginaAtual}</span> de <span className="font-bold">{totalPaginas}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaAtual(1)}
                    disabled={paginaAtual === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Números das páginas */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      let numeroPagina;
                      if (totalPaginas <= 5) {
                        numeroPagina = i + 1;
                      } else if (paginaAtual <= 3) {
                        numeroPagina = i + 1;
                      } else if (paginaAtual >= totalPaginas - 2) {
                        numeroPagina = totalPaginas - 4 + i;
                      } else {
                        numeroPagina = paginaAtual - 2 + i;
                      }

                      return (
                        <button
                          key={numeroPagina}
                          onClick={() => setPaginaAtual(numeroPagina)}
                          className={`px-4 py-2 border rounded-lg ${
                            paginaAtual === numeroPagina
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {numeroPagina}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setPaginaAtual(totalPaginas)}
                    disabled={paginaAtual === totalPaginas}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  {indiceInicio + 1}-{Math.min(indiceFim, cndsFiltradas.length)} de {cndsFiltradas.length}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card hover={false} className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma CND cadastrada
            </h3>
            <p className="text-gray-500 mb-6">
              Importe uma planilha Excel ou adicione manualmente para começar
            </p>
            <Button variant="primary" onClick={() => setShowUpload(true)}>
              Começar Agora
            </Button>
          </Card>
        )}

        {/* Modal Ver Detalhes */}
        {showModalVer && cndSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📄 Detalhes da CND</h2>
                <button
                  onClick={() => setShowModalVer(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(cndSelecionada.status)}`}></span>
                      <p className="font-semibold text-gray-900">{cndSelecionada.status}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Código</p>
                    <p className="font-semibold text-gray-900">{cndSelecionada['Cliente - Código']}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mês Referência</p>
                    <p className="font-semibold text-gray-900">{cndSelecionada['Mês Referência']}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold text-gray-900">{cndSelecionada['Cliente - Nome']}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">CNPJ</p>
                  <p className="font-semibold text-gray-900">{cndSelecionada['Cliente - CNPJ']}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Tipo de CND</p>
                  <p className="font-semibold text-gray-900">{cndSelecionada['CND']}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Vencimento</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(cndSelecionada['Vencimento']).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {cndSelecionada['Observação'] && (
                  <div>
                    <p className="text-sm text-gray-600">Observação</p>
                    <p className="font-semibold text-gray-900">{cndSelecionada['Observação']}</p>
                  </div>
                )}

                {cndSelecionada['Pendência'] && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Pendência</p>
                    <p className="font-semibold text-orange-900 mb-3">{cndSelecionada['Pendência']}</p>

                    <div className="grid grid-cols-2 gap-4">
                      {cndSelecionada['Responsável'] && (
                        <div>
                          <p className="text-xs text-gray-600">Responsável</p>
                          <p className="font-medium text-gray-900">{cndSelecionada['Responsável']}</p>
                        </div>
                      )}
                      {cndSelecionada['Prazo'] && (
                        <div>
                          <p className="text-xs text-gray-600">Prazo</p>
                          <p className="font-medium text-gray-900">
                            {new Date(cndSelecionada['Prazo']).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setShowModalVer(false)}>
                  Fechar
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal Editar */}
        {showModalEditar && cndEditando && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">✏️ Editar CND</h2>
                <button
                  onClick={() => setShowModalEditar(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Cliente
                    </label>
                    <input
                      type="text"
                      value={cndEditando['Cliente - Código']}
                      onChange={(e) => setCndEditando({...cndEditando, 'Cliente - Código': e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mês Referência
                    </label>
                    <input
                      type="month"
                      value={cndEditando['Mês Referência']}
                      onChange={(e) => setCndEditando({...cndEditando, 'Mês Referência': e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={cndEditando['Cliente - Nome']}
                    onChange={(e) => setCndEditando({...cndEditando, 'Cliente - Nome': e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={cndEditando['Cliente - CNPJ']}
                    onChange={(e) => setCndEditando({...cndEditando, 'Cliente - CNPJ': e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de CND
                  </label>
                  <input
                    type="text"
                    value={cndEditando['CND']}
                    onChange={(e) => setCndEditando({...cndEditando, 'CND': e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    value={cndEditando['Vencimento']}
                    onChange={(e) => setCndEditando({...cndEditando, 'Vencimento': e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observação
                  </label>
                  <textarea
                    value={cndEditando['Observação']}
                    onChange={(e) => setCndEditando({...cndEditando, 'Observação': e.target.value})}
                    rows={3}
                    placeholder="Ex: Requerimento nº 12345/2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Controle de Pendências</h3>
                    {(cndEditando['Pendência'] || cndEditando['Responsável'] || cndEditando['Prazo']) && (
                      <button
                        type="button"
                        onClick={() => setCndEditando({...cndEditando, 'Pendência': '', 'Responsável': '', 'Prazo': ''})}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Pendência Resolvida
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pendência
                    </label>
                    <textarea
                      value={cndEditando['Pendência']}
                      onChange={(e) => setCndEditando({...cndEditando, 'Pendência': e.target.value})}
                      rows={2}
                      placeholder="Descreva a pendência (deixe em branco se não houver)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsável pela Tarefa
                      </label>
                      <input
                        type="text"
                        value={cndEditando['Responsável']}
                        onChange={(e) => setCndEditando({...cndEditando, 'Responsável': e.target.value})}
                        placeholder="Nome do responsável"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prazo
                      </label>
                      <input
                        type="date"
                        value={cndEditando['Prazo']}
                        onChange={(e) => setCndEditando({...cndEditando, 'Prazo': e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModalEditar(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSalvarEdicao}>
                  Salvar Alterações
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal Adicionar Manualmente */}
        {showModalAdicionar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">➕ Adicionar CND Manualmente</h2>
                <button
                  onClick={() => setShowModalAdicionar(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Cliente
                    </label>
                    <input
                      type="text"
                      value={novaCnd['Cliente - Código']}
                      onChange={(e) => setNovaCnd({...novaCnd, 'Cliente - Código': e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mês Referência
                    </label>
                    <input
                      type="month"
                      value={novaCnd['Mês Referência']}
                      onChange={(e) => setNovaCnd({...novaCnd, 'Mês Referência': e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={novaCnd['Cliente - Nome']}
                    onChange={(e) => setNovaCnd({...novaCnd, 'Cliente - Nome': e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nome da empresa ou pessoa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={novaCnd['Cliente - CNPJ']}
                    onChange={(e) => setNovaCnd({...novaCnd, 'Cliente - CNPJ': e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de CND <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={novaCnd['CND']}
                    onChange={(e) => setNovaCnd({...novaCnd, 'CND': e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: CND Federal, FGTS, Trabalhista..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={novaCnd['Vencimento']}
                    onChange={(e) => setNovaCnd({...novaCnd, 'Vencimento': e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observação
                  </label>
                  <textarea
                    value={novaCnd['Observação']}
                    onChange={(e) => setNovaCnd({...novaCnd, 'Observação': e.target.value})}
                    rows={2}
                    placeholder="Ex: Requerimento nº 12345/2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Controle de Pendências (Opcional)</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pendência
                    </label>
                    <textarea
                      value={novaCnd['Pendência']}
                      onChange={(e) => setNovaCnd({...novaCnd, 'Pendência': e.target.value})}
                      rows={2}
                      placeholder="Descreva a pendência (deixe em branco se não houver)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsável pela Tarefa
                      </label>
                      <input
                        type="text"
                        value={novaCnd['Responsável']}
                        onChange={(e) => setNovaCnd({...novaCnd, 'Responsável': e.target.value})}
                        placeholder="Nome do responsável"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prazo
                      </label>
                      <input
                        type="date"
                        value={novaCnd['Prazo']}
                        onChange={(e) => setNovaCnd({...novaCnd, 'Prazo': e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModalAdicionar(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleAdicionarManualmente}>
                  Adicionar CND
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal Customizado Universal */}
        {modal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <div className="text-center">
                {/* Ícone baseado no tipo */}
                <div className="mb-4">
                  {modal.type === 'success' && (
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {modal.type === 'error' && (
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {modal.type === 'warning' && (
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                  {modal.type === 'confirm' && (
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  {modal.type === 'input' && (
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Título e Mensagem */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{modal.title}</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{modal.message}</p>

                {/* Input se for tipo input */}
                {modal.type === 'input' && (
                  <input
                    type="text"
                    value={modal.inputValue || ''}
                    onChange={(e) => modal.onInputChange?.(e.target.value)}
                    placeholder={modal.inputPlaceholder}
                    className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}

                {/* Botões */}
                <div className="flex gap-3 justify-center">
                  {modal.onCancel && (
                    <Button variant="outline" onClick={modal.onCancel}>
                      {modal.cancelText || 'Cancelar'}
                    </Button>
                  )}
                  <Button
                    variant={modal.type === 'warning' || modal.type === 'error' ? 'outline' : 'primary'}
                    onClick={() => {
                      if (modal.onConfirm) {
                        modal.onConfirm();
                      } else {
                        setModal({ show: false, type: 'success', title: '', message: '' });
                      }
                    }}
                  >
                    {modal.confirmText || 'OK'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
