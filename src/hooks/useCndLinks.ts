'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CNDLink {
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
  { id: 'mun-8', name: 'Santa Vitória/MG', url: 'https://sistemas.santavitoria.mg.gov.br/portalcidadao/', category: 'CND Municipal' },
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
  { id: 'ger-2', name: 'CND FGTS (Caixa)', url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/impressao.jsf', category: 'CNDs Gerais' },
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

export function useCndLinks() {
  const [links, setLinks] = useState<CNDLink[]>(linksIniciais);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar Links
  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');

      if (!response.ok) {
        throw new Error('Erro ao carregar Links');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        setLinks(data);
      } else {
        // Se não houver dados no banco, usa os links iniciais
        setLinks(linksIniciais);
      }
    } catch (err: any) {
      console.error('Erro ao carregar Links:', err);
      setError(err.message);
      // Fallback para localStorage ou dados iniciais
      const localData = localStorage.getItem('cndLinks');
      if (localData) {
        setLinks(JSON.parse(localData));
      } else {
        setLinks(linksIniciais);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar Link
  const addLink = async (link: Omit<CNDLink, 'id'> & { id: string }) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link)
      });

      if (!response.ok) throw new Error('Erro ao adicionar Link');

      setLinks(prev => {
        const updated = [...prev, link];
        localStorage.setItem('cndLinks', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao adicionar Link:', err);
      // Fallback para localStorage
      setLinks(prev => {
        const newLinks = [...prev, link];
        localStorage.setItem('cndLinks', JSON.stringify(newLinks));
        return newLinks;
      });
      return { success: true, offline: true };
    }
  };

  // Atualizar Link
  const updateLink = async (link: CNDLink) => {
    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link)
      });

      if (!response.ok) throw new Error('Erro ao atualizar Link');

      setLinks(prev => {
        const updated = prev.map(l => l.id === link.id ? link : l);
        localStorage.setItem('cndLinks', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao atualizar Link:', err);
      // Fallback para localStorage
      setLinks(prev => {
        const updated = prev.map(l => l.id === link.id ? link : l);
        localStorage.setItem('cndLinks', JSON.stringify(updated));
        return updated;
      });
      return { success: true, offline: true };
    }
  };

  // Excluir Link
  const deleteLink = async (id: string) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao excluir Link');

      setLinks(prev => {
        const updated = prev.filter(l => l.id !== id);
        localStorage.setItem('cndLinks', JSON.stringify(updated));
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao excluir Link:', err);
      // Fallback para localStorage
      setLinks(prev => {
        const updated = prev.filter(l => l.id !== id);
        localStorage.setItem('cndLinks', JSON.stringify(updated));
        return updated;
      });
      return { success: true, offline: true };
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    setLinks,
    loading,
    error,
    addLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks
  };
}
