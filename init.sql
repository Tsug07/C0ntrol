-- ===========================================
-- SCHEMA DO BANCO DE DADOS - C0NTROL
-- PostgreSQL - Inicialização automática via Docker
-- ===========================================

-- Tabela de CNDs
CREATE TABLE IF NOT EXISTS cnds (
  id TEXT PRIMARY KEY,
  cliente_codigo TEXT DEFAULT '',
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT DEFAULT '',
  cnd TEXT NOT NULL,
  vencimento DATE NOT NULL,
  mes_referencia TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Válida', 'Vencida', 'A Vencer')),
  observacao TEXT DEFAULT '',
  pendencia TEXT DEFAULT '',
  responsavel TEXT DEFAULT '',
  prazo DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Links CND
CREATE TABLE IF NOT EXISTS cnd_links (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cnds_mes_referencia ON cnds(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_cnds_status ON cnds(status);
CREATE INDEX IF NOT EXISTS idx_cnds_vencimento ON cnds(vencimento);
CREATE INDEX IF NOT EXISTS idx_cnd_links_category ON cnd_links(category);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela cnds
DROP TRIGGER IF EXISTS update_cnds_updated_at ON cnds;
CREATE TRIGGER update_cnds_updated_at
  BEFORE UPDATE ON cnds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- DADOS INICIAIS - Links CND padrão
-- ===========================================

INSERT INTO cnd_links (id, name, url, category) VALUES
  -- CND Municipal
  ('mun-1', 'São Roque de Minas/MG', 'https://webcidadao.com.br/web-cidadao-web/pages/certidaodebitos/certidaodebitos.xhtml', 'CND Municipal'),
  ('mun-2', 'Além Paraíba/MG', 'https://nfse.alemparaiba.mg.gov.br/', 'CND Municipal'),
  ('mun-3', 'Coqueiral/MG', 'https://coqueiral-mg.prefeituramoderna.com.br/meuiptu/index.php?cidade=coqueiral', 'CND Municipal'),
  ('mun-4', 'Rio Bonito/RJ', 'https://riobonito.eloweb.net/portal-contribuinte/emissao-certidoes', 'CND Municipal'),
  ('mun-5', 'Uberaba/MG', 'http://iptu.uberaba.mg.gov.br/tributos/cnd/cnd.php', 'CND Municipal'),
  ('mun-6', 'Raul Soares/MG', 'https://servicos1.cloud.el.com.br/mg-raulsoares-pm/services/certidao_retirada.php?codigo_tpc=&codigo_agp=&agrupa=c', 'CND Municipal'),
  ('mun-7', 'Ouro Branco/MG', 'https://e-gov.betha.com.br/cdweb/03114-521/contribuinte/rel_cndcontribuinte.faces', 'CND Municipal'),
  ('mun-8', 'Santa Vitória/MG', 'https://sistemas.santavitoria.mg.gov.br/portalcidadao/', 'CND Municipal'),
  ('mun-9', 'Guarani/MG', 'https://guarani.tributos-futurize.com.br/cnd.php', 'CND Municipal'),
  ('mun-10', 'Leopoldina/MG', 'https://leopoldina2-web.sigmix.net/servicosweb/home.jsf', 'CND Municipal'),
  ('mun-11', 'Barra Mansa/RJ', 'https://www.gp.srv.br/tributario/barramansa/portal_serv_servico?12,53', 'CND Municipal'),
  ('mun-12', 'Resende/RJ', 'https://e-gov.betha.com.br/cdweb/03114-505/contribuinte/rel_cndcontribuinte.faces', 'CND Municipal'),
  ('mun-13', 'Rio de Janeiro/RJ', 'https://daminternet.rio.rj.gov.br/certidao/Requerimento', 'CND Municipal'),
  ('mun-14', 'Pinheiral/RJ', 'https://e-gov.betha.com.br/cdweb/03114-515/contribuinte/rel_cndcontribuinte.faces', 'CND Municipal'),
  ('mun-15', 'Volta Redonda/RJ', 'https://www2.voltaredonda.rj.gov.br/pgm/mod/cnd/', 'CND Municipal'),

  -- CND Estadual
  ('est-1', 'MG - Fazenda', 'https://www2.fazenda.mg.gov.br/sol/ctrl/SOL/CDT/SERVICO_829?ACAO=INICIAR', 'CND Estadual'),
  ('est-2', 'RJ - Com IE', 'https://portal.fazenda.rj.gov.br/dec/', 'CND Estadual'),
  ('est-3', 'RJ - Sem IE', 'https://crf-unificada-web.fazenda.rj.gov.br/crf-unificada-web/#/', 'CND Estadual'),
  ('est-4', 'SP - Fazenda', 'https://www10.fazenda.sp.gov.br/CertidaoNegativaDeb/Pages/ImpressaoCertidaoNegativa.aspx', 'CND Estadual'),

  -- CND Procuradoria
  ('proc-1', 'MG - Procuradoria', 'https://aplicacao.mpmg.mp.br/ouvidoria/service/cidadao/certidao', 'CND Procuradoria'),
  ('proc-2', 'RJ - Pedido', 'https://www.consultadividaativa.rj.gov.br/RDGWEBLNX/servlet/StartCISPage?PAGEURL=/cisnatural/NatLogon.html&xciParameters.natsession=Solicitar_Certidao', 'CND Procuradoria'),
  ('proc-3', 'RJ - Consulta', 'http://www.consultadividaativa.rj.gov.br/RDGWEBLNX/servlet/StartCISPage?PAGEURL=/cisnatural/NatLogon.html&xciParameters.natsession=Consultar_Solicitacao', 'CND Procuradoria'),
  ('proc-4', 'SP - Dívida Ativa', 'https://www.dividaativa.pge.sp.gov.br/sc/pages/crda/emitirCrda.jsf', 'CND Procuradoria'),

  -- CND Falência
  ('fal-1', 'MG - TJMG', 'https://rupe.tjmg.jus.br/rupe/justica/publico/certidoes/criarSolicitacaoCertidao.rupe?solicitacaoPublica=true', 'CND Falência'),
  ('fal-2', 'RJ - TJRJ', 'https://www3.tjrj.jus.br/CJE/', 'CND Falência'),
  ('fal-3', 'SP - TJSP', 'http://esaj.tjsp.jus.br/sco/abrirCadastro.do', 'CND Falência'),
  ('fal-4', 'ES - TJES', 'https://sistemas.tjes.jus.br/certidaonegativa/sistemas/certidao/CERTIDAOPESQUISA.cfm', 'CND Falência'),

  -- CNDs Gerais
  ('ger-1', 'CND Trabalhista (TST)', 'https://cndt-certidao.tst.jus.br/inicio.faces', 'CNDs Gerais'),
  ('ger-2', 'CND FGTS (Caixa)', 'https://consulta-crf.caixa.gov.br/consultacrf/pages/impressao.jsf', 'CNDs Gerais'),
  ('ger-3', 'CND Ilícitos Trabalhistas', 'https://eprocesso.sit.trabalho.gov.br/Entrar?ReturnUrl=%2FCertidao%2FEmitir', 'CNDs Gerais'),
  ('ger-4', 'CND Ações Trabalhistas (TRT1)', 'https://pje.trt1.jus.br/certidoes/inicio', 'CNDs Gerais'),
  ('ger-5', 'CND RFB (Receita Federal)', 'https://cav.receita.fazenda.gov.br/ecac/Aplicacao.aspx?id=2&origem=menu', 'CNDs Gerais'),
  ('ger-6', 'CND RFB 2ª Via', 'https://servicos.receitafederal.gov.br/servico/certidoes/#/home', 'CNDs Gerais'),
  ('ger-7', 'CND CEIS/CGU', 'https://certidoes.cgu.gov.br/', 'CNDs Gerais'),
  ('ger-8', 'CND TCU', 'https://portal.tcu.gov.br/carta-de-servicos/certidoes', 'CNDs Gerais'),
  ('ger-9', 'CND IBAMA', 'https://servicos.ibama.gov.br/sicafiext/sistema.php', 'CNDs Gerais'),
  ('ger-10', 'CTF IBAMA', 'https://servicos.ibama.gov.br/ctf/publico/certificado_regularidade_consulta.php', 'CNDs Gerais'),
  ('ger-11', 'Consulta CNPJ', 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp', 'CNDs Gerais'),
  ('ger-12', 'Habilitação Contador (CRCRJ)', 'https://webserver.crcrj.org.br/spw/consultacadastral/principal.aspx', 'CNDs Gerais'),
  ('ger-13', 'CND Simplificada (JUCERJA)', 'https://www.jucerja.rj.gov.br/Servicos/Certidao/', 'CNDs Gerais'),
  ('ger-14', 'Improbidade Adm. e Inelegibilidade', 'https://www.cnj.jus.br/improbidade_adm/consultar_requerido.php?validar=form', 'CNDs Gerais'),
  ('ger-15', 'CND SICAF', 'https://www3.comprasnet.gov.br/sicaf-web/private/geral/consultarSituacaoFornecedor.jsf', 'CNDs Gerais'),
  ('ger-16', 'Ações Competência JF Cível (TRF2)', 'https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar', 'CNDs Gerais'),
  ('ger-17', 'CND Licitação (TJRJ)', 'https://www4.tjrj.jus.br/clp/', 'CNDs Gerais'),
  ('ger-18', 'CND TCE-RJ', 'https://www.tcerj.tc.br/portalnovo/pagina/emissao-de-certidao-de-processos', 'CNDs Gerais'),
  ('ger-19', 'CND Unificada (CJF)', 'https://certidao-unificada.cjf.jus.br/#/solicitacao-certidao', 'CNDs Gerais'),
  ('ger-20', 'CND TRF2', 'https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar', 'CNDs Gerais'),
  ('ger-21', 'CND Protesto (Online)', 'https://www.pesquisaprotesto.com.br/certidaoNegativa', 'CNDs Gerais'),
  ('ger-22', 'Antecedentes Criminais (PF)', 'https://servicos.pf.gov.br/epol-sinic-publico/', 'CNDs Gerais')
ON CONFLICT (id) DO NOTHING;
