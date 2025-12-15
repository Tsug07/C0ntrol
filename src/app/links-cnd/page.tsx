'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface CNDLink {
  id: string;
  name: string;
  url: string;
  category: string;
}

const linksIniciais: CNDLink[] = [
  // CND MUNICIPAL
  { id: 'mun-1', name: 'São Roque de Minas/MG', url: 'https://webcidadao.com.br/web-cidadao-web/pages/certidaodebitos/certidaodebitos.xhtml', category: 'CND Municipal' },
  { id: 'mun-2', name: 'Além Paraíba/MG', url: 'https://nfse.alemparaiba.mg.gov.br/', category: 'CND Municipal' },
  { id: 'mun-3', name: 'Coqueiral/MG', url: 'https://coqueiral-mg.prefeituramoderna.com.br/meuiptu/index.php?cidade=coqueiral', category: 'CND Municipal' },
  { id: 'mun-4', name: 'Rio Bonito/RJ', url: 'https://riobonito.eloweb.net/portal-contribuinte/emissao-certidoes', category: 'CND Municipal' },
  { id: 'mun-5', name: 'Uberaba/MG', url: 'http://iptu.uberaba.mg.gov.br/tributos/cnd/cnd.php', category: 'CND Municipal' },
  { id: 'mun-6', name: 'Raul Soares/MG', url: 'https://servicos1.cloud.el.com.br/mg-raulsoares-pm/services/certidao_retirada.php?codigo_tpc=&codigo_agp=&agrupa=c', category: 'CND Municipal' },
  { id: 'mun-7', name: 'Ouro Branco/MG', url: 'https://e-gov.betha.com.br/cdweb/03114-521/contribuinte/rel_cndcontribuinte.faces', category: 'CND Municipal' },
  { id: 'mun-8', name: 'Santa Vitória/MG', url: 'https://sistemas.santavitoria.mg.gov.br/portalcidadao/#075f539f0b7223f116d2c85c4ce1b1752fccb0db1fd92284312b33310fb199ef6050e9373e0f36365cbb7737a0e49e582e657146a648fd13d54aa9e4338df879e807578fb1eeafd7b9e70283f841665c926de53325df44abdbe6fb2ff40fdf8d617449c3e7a3e843f49e3c4d9557cc842c7b0a78b37934a02bb392b40cceb4be', category: 'CND Municipal' },
  { id: 'mun-9', name: 'Guarani/MG', url: 'https://guarani.tributos-futurize.com.br/cnd.php', category: 'CND Municipal' },
  { id: 'mun-10', name: 'Leopoldina/MG', url: 'https://leopoldina2-web.sigmix.net/servicosweb/home.jsf', category: 'CND Municipal' },
  { id: 'mun-11', name: 'Barra Mansa/RJ', url: 'https://www.gp.srv.br/tributario/barramansa/portal_serv_servico?12,53', category: 'CND Municipal' },
  { id: 'mun-12', name: 'Resende/RJ', url: 'https://e-gov.betha.com.br/cdweb/03114-505/contribuinte/rel_cndcontribuinte.faces', category: 'CND Municipal' },
  { id: 'mun-13', name: 'Rio de Janeiro/RJ', url: 'https://daminternet.rio.rj.gov.br/certidao/Requerimento', category: 'CND Municipal' },
  { id: 'mun-14', name: 'Pinheiral/RJ', url: 'https://e-gov.betha.com.br/cdweb/03114-515/contribuinte/rel_cndcontribuinte.faces', category: 'CND Municipal' },
  { id: 'mun-15', name: 'Volta Redonda/RJ', url: 'https://www2.voltaredonda.rj.gov.br/pgm/mod/cnd/', category: 'CND Municipal' },

  // CND ESTADUAL
  { id: 'est-1', name: 'MG - Fazenda', url: 'https://www2.fazenda.mg.gov.br/sol/ctrl/SOL/CDT/SERVICO_829?ACAO=INICIAR', category: 'CND Estadual' },
  { id: 'est-2', name: 'RJ - Com IE', url: 'https://portal.fazenda.rj.gov.br/dec/', category: 'CND Estadual' },
  { id: 'est-3', name: 'RJ - Sem IE', url: 'https://crf-unificada-web.fazenda.rj.gov.br/crf-unificada-web/#/', category: 'CND Estadual' },
  { id: 'est-4', name: 'SP - Fazenda', url: 'https://www10.fazenda.sp.gov.br/CertidaoNegativaDeb/Pages/ImpressaoCertidaoNegativa.aspx', category: 'CND Estadual' },

  // CND PROCURADORIA
  { id: 'proc-1', name: 'MG - Procuradoria', url: 'https://aplicacao.mpmg.mp.br/ouvidoria/service/cidadao/certidao', category: 'CND Procuradoria' },
  { id: 'proc-2', name: 'RJ - Pedido', url: 'https://www.consultadividaativa.rj.gov.br/RDGWEBLNX/servlet/StartCISPage?PAGEURL=/cisnatural/NatLogon.html&xciParameters.natsession=Solicitar_Certidao', category: 'CND Procuradoria' },
  { id: 'proc-3', name: 'RJ - Consulta', url: 'http://www.consultadividaativa.rj.gov.br/RDGWEBLNX/servlet/StartCISPage?PAGEURL=/cisnatural/NatLogon.html&xciParameters.natsession=Consultar_Solicitacao', category: 'CND Procuradoria' },
  { id: 'proc-4', name: 'SP - Dívida Ativa', url: 'https://www.dividaativa.pge.sp.gov.br/sc/pages/crda/emitirCrda.jsf', category: 'CND Procuradoria' },

  // CND FALÊNCIA
  { id: 'fal-1', name: 'MG - TJMG', url: 'https://rupe.tjmg.jus.br/rupe/justica/publico/certidoes/criarSolicitacaoCertidao.rupe?solicitacaoPublica=true', category: 'CND Falência' },
  { id: 'fal-2', name: 'RJ - TJRJ', url: 'https://www3.tjrj.jus.br/CJE/', category: 'CND Falência' },
  { id: 'fal-3', name: 'SP - TJSP', url: 'http://esaj.tjsp.jus.br/sco/abrirCadastro.do', category: 'CND Falência' },
  { id: 'fal-4', name: 'ES - TJES', url: 'https://sistemas.tjes.jus.br/certidaonegativa/sistemas/certidao/CERTIDAOPESQUISA.cfm', category: 'CND Falência' },

  // CNDs GERAIS
  { id: 'ger-1', name: 'CND Trabalhista (TST)', url: 'https://cndt-certidao.tst.jus.br/inicio.faces', category: 'CNDs Gerais' },
  { id: 'ger-2', name: 'CND FGTS (Caixa)', url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/impressao.jsf;jsessionid=xhc_5VHYQIahee4wWqH0pbchgiQb1mwCu7drFyFp.crjpcapllx209_sicrf_inter_8083', category: 'CNDs Gerais' },
  { id: 'ger-3', name: 'CND Ilícitos Trabalhistas', url: 'https://eprocesso.sit.trabalho.gov.br/Entrar?ReturnUrl=%2FCertidao%2FEmitir', category: 'CNDs Gerais' },
  { id: 'ger-4', name: 'CND Ações Trabalhistas (TRT1)', url: 'https://pje.trt1.jus.br/certidoes/inicio', category: 'CNDs Gerais' },
  { id: 'ger-5', name: 'CND RFB (Receita Federal)', url: 'https://cav.receita.fazenda.gov.br/ecac/Aplicacao.aspx?id=2&origem=menu', category: 'CNDs Gerais' },
  { id: 'ger-6', name: 'CND RFB 2ª Via', url: 'https://servicos.receitafederal.gov.br/servico/certidoes/#/home', category: 'CNDs Gerais' },
  { id: 'ger-7', name: 'CND CEIS/CGU', url: 'https://certidoes.cgu.gov.br/', category: 'CNDs Gerais' },
  { id: 'ger-8', name: 'CND TCU', url: 'https://portal.tcu.gov.br/carta-de-servicos/certidoes', category: 'CNDs Gerais' },
  { id: 'ger-9', name: 'CND IBAMA', url: 'https://servicos.ibama.gov.br/sicafiext/sistema.php', category: 'CNDs Gerais' },
  { id: 'ger-10', name: 'CTF IBAMA', url: 'https://servicos.ibama.gov.br/ctf/publico/certificado_regularidade_consulta.php', category: 'CNDs Gerais' },
  { id: 'ger-11', name: 'Consulta CNPJ', url: 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp', category: 'CNDs Gerais' },
  { id: 'ger-12', name: 'Habilitação Contador (CRCRJ)', url: 'https://webserver.crcrj.org.br/spw/consultacadastral/principal.aspx', category: 'CNDs Gerais' },
  { id: 'ger-13', name: 'CND Simplificada (JUCERJA)', url: 'https://www.jucerja.rj.gov.br/Servicos/Certidao/', category: 'CNDs Gerais' },
  { id: 'ger-14', name: 'Improbidade Adm. e Inelegibilidade', url: 'https://www.cnj.jus.br/improbidade_adm/consultar_requerido.php?validar=form', category: 'CNDs Gerais' },
  { id: 'ger-15', name: 'CND SICAF', url: 'https://www3.comprasnet.gov.br/sicaf-web/private/geral/consultarSituacaoFornecedor.jsf', category: 'CNDs Gerais' },
  { id: 'ger-16', name: 'Ações Competência JF Cível (TRF2)', url: 'https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar', category: 'CNDs Gerais' },
  { id: 'ger-17', name: 'CND Licitação (TJRJ)', url: 'https://www4.tjrj.jus.br/clp/', category: 'CNDs Gerais' },
  { id: 'ger-18', name: 'CND TCE-RJ', url: 'https://www.tcerj.tc.br/portalnovo/pagina/emissao-de-certidao-de-processos', category: 'CNDs Gerais' },
  { id: 'ger-19', name: 'CND Unificada (CJF)', url: 'https://certidao-unificada.cjf.jus.br/#/solicitacao-certidao', category: 'CNDs Gerais' },
  { id: 'ger-20', name: 'CND TRF2', url: 'https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar', category: 'CNDs Gerais' },
  { id: 'ger-21', name: 'CND Protesto (Online)', url: 'https://www.pesquisaprotesto.com.br/certidaoNegativa', category: 'CNDs Gerais' },
  { id: 'ger-22', name: 'Antecedentes Criminais (PF)', url: 'https://servicos.pf.gov.br/epol-sinic-publico/', category: 'CNDs Gerais' },
];

const categories = [
  { id: 'all', name: 'Todos', icon: '📋' },
  { id: 'CND Municipal', name: 'Municipal', icon: '🏛️' },
  { id: 'CND Estadual', name: 'Estadual', icon: '🗺️' },
  { id: 'CND Procuradoria', name: 'Procuradoria', icon: '⚖️' },
  { id: 'CND Falência', name: 'Falência', icon: '📑' },
  { id: 'CNDs Gerais', name: 'Gerais', icon: '🔗' },
];

export default function LinksCNDPage() {
  const [links, setLinks] = useState<CNDLink[]>(linksIniciais);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('all');
  const [busca, setBusca] = useState<string>('');
  const [showModalAdicionar, setShowModalAdicionar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [linkEditando, setLinkEditando] = useState<CNDLink | null>(null);
  const [novoLink, setNovoLink] = useState<Omit<CNDLink, 'id'>>({
    name: '',
    url: '',
    category: 'CND Municipal'
  });
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [linkParaExcluir, setLinkParaExcluir] = useState<CNDLink | null>(null);

  // Carregar links do localStorage
  useEffect(() => {
    const linksSalvos = localStorage.getItem('cndLinks');
    if (linksSalvos) {
      try {
        setLinks(JSON.parse(linksSalvos));
      } catch {
        setLinks(linksIniciais);
      }
    }
  }, []);

  // Salvar links no localStorage
  useEffect(() => {
    localStorage.setItem('cndLinks', JSON.stringify(links));
  }, [links]);

  const linksFiltrados = links.filter(link => {
    const passaCategoria = categoriaAtiva === 'all' || link.category === categoriaAtiva;
    const passaBusca = busca === '' ||
      link.name.toLowerCase().includes(busca.toLowerCase()) ||
      link.category.toLowerCase().includes(busca.toLowerCase());
    return passaCategoria && passaBusca;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CND Municipal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CND Estadual':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CND Procuradoria':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CND Falência':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CNDs Gerais':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '🔗';
  };

  const handleAdicionarLink = () => {
    if (!novoLink.name || !novoLink.url) {
      alert('Por favor, preencha o nome e a URL do link.');
      return;
    }

    const novoLinkCompleto: CNDLink = {
      ...novoLink,
      id: `custom-${Date.now()}`
    };

    setLinks([...links, novoLinkCompleto]);
    setShowModalAdicionar(false);
    setNovoLink({ name: '', url: '', category: 'CND Municipal' });
  };

  const handleEditarLink = (link: CNDLink) => {
    setLinkEditando({ ...link });
    setShowModalEditar(true);
  };

  const handleSalvarEdicao = () => {
    if (!linkEditando) return;

    setLinks(links.map(l => l.id === linkEditando.id ? linkEditando : l));
    setShowModalEditar(false);
    setLinkEditando(null);
  };

  const handleConfirmarExclusao = (link: CNDLink) => {
    setLinkParaExcluir(link);
    setShowModalConfirm(true);
  };

  const handleExcluirLink = () => {
    if (!linkParaExcluir) return;

    setLinks(links.filter(l => l.id !== linkParaExcluir.id));
    setShowModalConfirm(false);
    setLinkParaExcluir(null);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔗 Links CND
          </h1>
          <p className="text-gray-600">
            Acesso rápido aos principais portais de emissão de Certidões Negativas de Débitos
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <Button variant="primary" onClick={() => setShowModalAdicionar(true)}>
            ➕ Adicionar Link
          </Button>
        </div>

        {/* Busca */}
        <Card hover={false} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou categoria..."
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
        </Card>

        {/* Categorias */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                categoriaAtiva === cat.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
              {cat.id !== 'all' && (
                <span className="ml-2 text-xs opacity-75">
                  ({links.filter(l => l.category === cat.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-6 text-sm text-gray-600">
          Mostrando <span className="font-bold">{linksFiltrados.length}</span> de{' '}
          <span className="font-bold">{links.length}</span> links
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linksFiltrados.map((link) => (
            <div key={link.id} className="relative group">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full hover:shadow-lg hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getCategoryIcon(link.category)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                        {link.name}
                      </h3>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full border ${getCategoryColor(link.category)}`}>
                        {link.category}
                      </span>
                    </div>
                    <div className="text-gray-400 group-hover:text-purple-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </a>
              {/* Botões de ação */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditarLink(link);
                  }}
                  className="p-1.5 bg-white rounded-lg shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmarExclusao(link);
                  }}
                  className="p-1.5 bg-white rounded-lg shadow-md text-red-600 hover:bg-red-50 transition-colors"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {linksFiltrados.length === 0 && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum link encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou a busca
            </p>
          </Card>
        )}

        {/* Info Section */}
        <Card hover={false} className="mt-8 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Dica</h3>
              <p className="text-yellow-700 text-sm">
                <strong>CND Protesto:</strong> Para certidão presencial, comparecer ao cartório com requerimento (taxa aproximada R$ 45,55).
                A consulta online está disponível para estudos em{' '}
                <a
                  href="https://www.pesquisaprotesto.com.br/certidaoNegativa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-900"
                >
                  pesquisaprotesto.com.br
                </a>
              </p>
            </div>
          </div>
        </Card>

        {/* Modal Adicionar Link */}
        {showModalAdicionar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">➕ Adicionar Novo Link</h2>
                <button
                  onClick={() => setShowModalAdicionar(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={novoLink.name}
                    onChange={(e) => setNovoLink({ ...novoLink, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: CND Municipal de São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={novoLink.url}
                    onChange={(e) => setNovoLink({ ...novoLink, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://exemplo.com.br"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={novoLink.category}
                    onChange={(e) => setNovoLink({ ...novoLink, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModalAdicionar(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleAdicionarLink}>
                  Adicionar Link
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal Editar Link */}
        {showModalEditar && linkEditando && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">✏️ Editar Link</h2>
                <button
                  onClick={() => setShowModalEditar(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={linkEditando.name}
                    onChange={(e) => setLinkEditando({ ...linkEditando, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={linkEditando.url}
                    onChange={(e) => setLinkEditando({ ...linkEditando, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={linkEditando.category}
                    onChange={(e) => setLinkEditando({ ...linkEditando, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
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

        {/* Modal Confirmar Exclusão */}
        {showModalConfirm && linkParaExcluir && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir o link <strong>{linkParaExcluir.name}</strong>?
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setShowModalConfirm(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleExcluirLink}>
                    Excluir
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
