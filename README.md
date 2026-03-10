<p align="center">
  <h1 align="center">C<sub>0</sub>ntrol</h1>
  <p align="center">Sistema de Gestão e Controle de Certidões Negativas de Débitos</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## Sobre o Projeto

**C0ntrol** é um sistema web interno para gestão e controle de Certidões Negativas de Débitos (CNDs), desenvolvido para automatizar o acompanhamento de vencimentos, pendências e emissão de certidões de múltiplos clientes.

### Módulos

| Módulo | Descrição |
|--------|-----------|
| **CNDs** | Gerenciamento completo de certidões com controle de vencimento, alertas automáticos e importação via Excel |
| **Links CND** | Acesso rápido e organizado aos portais de emissão de CNDs federais, estaduais e municipais |
| **Rotina** | Automação de processos e rotinas repetitivas |

---

## Funcionalidades

- Importação em massa de CNDs via planilha Excel (`.xlsx`)
- Cálculo automático de status: **Válida**, **A Vencer** (20 dias) e **Vencida**
- Controle de pendências com responsável e prazo
- Botão de resolução rápida de pendências
- Filtros por mês de referência, status e busca textual
- CRUD completo com edição inline e exclusão individual/em massa
- +49 links pré-cadastrados para portais de emissão de CNDs
- Dados persistidos em PostgreSQL com fallback localStorage
- Interface responsiva com tema purple/gradient

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS 3.4 |
| Linguagem | TypeScript 5 |
| Backend | Next.js API Routes (App Router) |
| Banco de Dados | PostgreSQL 16 (Alpine) |
| Conexão DB | node-postgres (`pg`) com connection pooling |
| Importação | SheetJS (`xlsx`) |
| Infraestrutura | Docker, Docker Compose |
| Build | Multi-stage Dockerfile (deps → builder → runner) |

---

## Estrutura do Projeto

```
C0ntrol/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cnds/
│   │   │   │   ├── route.ts          # GET, POST, DELETE CNDs
│   │   │   │   └── [id]/route.ts     # PUT, DELETE CND individual
│   │   │   └── links/
│   │   │       ├── route.ts          # GET, POST links
│   │   │       └── [id]/route.ts     # PUT, DELETE link individual
│   │   ├── cnds/page.tsx             # Página de gestão de CNDs
│   │   ├── links-cnd/page.tsx        # Página de links CND
│   │   ├── rotina/page.tsx           # Página de rotinas
│   │   ├── layout.tsx                # Layout raiz
│   │   └── page.tsx                  # Dashboard principal
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ModuleCard.tsx
│   │   ├── LayoutClient.tsx
│   │   └── Navbar.tsx
│   ├── hooks/
│   │   ├── useCnds.ts               # Hook de CNDs (CRUD + API)
│   │   └── useCndLinks.ts           # Hook de links CND
│   ├── lib/
│   │   └── db.ts                     # Pool de conexão PostgreSQL
│   ├── middleware.ts
│   └── styles/
│       └── globals.css
├── docker-compose.yml
├── Dockerfile
├── init.sql                          # Schema + dados iniciais
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado)
- Ou: Node.js 20+ e PostgreSQL 16+

---

## Instalação e Execução

### Com Docker (Recomendado)

```bash
# Clonar o repositório
git clone <repository-url>
cd C0ntrol

# Subir os containers (app + banco)
docker-compose up -d --build

# Acessar a aplicação
# http://localhost:3000
```

A aplicação estará disponível em `http://localhost:3000` com o banco de dados já configurado e populado com os links CND padrão.

### Sem Docker (Desenvolvimento)

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com a URL do seu PostgreSQL

# Executar o schema no banco
psql -U seu_usuario -d sua_database -f init.sql

# Iniciar em modo desenvolvimento
npm run dev
```

---

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `NODE_ENV` | Ambiente de execução (`production` / `development`) |

> As credenciais do banco estão definidas no `docker-compose.yml` e no `.env.example`. Consulte esses arquivos para os valores.

---

## Docker Compose - Serviços

| Serviço | Container | Porta | Descrição |
|---------|-----------|-------|-----------|
| `c0ntrol_app` | `c0ntrol_app` | `3000` | Aplicação Next.js |
| `c0ntrol_db` | `c0ntrol_db` | `5433` | PostgreSQL 16 Alpine |

### Acessar o banco via pgAdmin

As credenciais de conexão (host, porta, usuário e senha) estão no `docker-compose.yml`.

---

## Banco de Dados

### Tabelas

**`cnds`** — Certidões Negativas de Débitos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `TEXT PK` | Identificador único |
| `cliente_codigo` | `TEXT` | Código do cliente |
| `cliente_nome` | `TEXT NOT NULL` | Nome do cliente |
| `cliente_cnpj` | `TEXT` | CNPJ/CPF do cliente |
| `cnd` | `TEXT NOT NULL` | Nome/tipo da certidão |
| `vencimento` | `DATE NOT NULL` | Data de vencimento |
| `mes_referencia` | `TEXT NOT NULL` | Mês de referência |
| `status` | `TEXT NOT NULL` | Válida, Vencida ou A Vencer |
| `observacao` | `TEXT` | Observações gerais |
| `pendencia` | `TEXT` | Descrição da pendência |
| `responsavel` | `TEXT` | Responsável pela resolução |
| `prazo` | `DATE` | Prazo para resolução |

**`cnd_links`** — Links de portais de emissão

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `TEXT PK` | Identificador único |
| `name` | `TEXT NOT NULL` | Nome do portal |
| `url` | `TEXT NOT NULL` | URL de acesso |
| `category` | `TEXT NOT NULL` | Categoria (Municipal, Estadual, etc.) |

---

## Importação de Excel

O sistema aceita planilhas `.xlsx` com os seguintes formatos de coluna:

**Formato 1 (padrão):**
| Coluna | Campo |
|--------|-------|
| `Cliente - Código` | Código do cliente |
| `Cliente - Nome` | Nome do cliente |
| `Cliente - CNPJ` | CNPJ |
| `CND` | Nome da certidão |
| `Vencimento` | Data de vencimento |

**Formato 2 (alternativo):**
| Coluna | Campo |
|--------|-------|
| `Certificado - Nome` | Nome da certidão |
| `Certificado - Data de expiração (completa)` | Data de vencimento |

Formatos de data suportados: `DD/MM/YYYY`, `YYYY-MM-DD`, datas seriais do Excel.

---

## Comandos Úteis

```bash
# Subir containers
docker-compose up -d

# Rebuild após alterações no código
docker-compose up -d --build c0ntrol_app

# Ver logs da aplicação
docker logs -f c0ntrol_app

# Ver logs do banco
docker logs -f c0ntrol_db

# Acessar o banco via terminal
docker exec -it c0ntrol_db psql -U c0ntrol_user -d c0ntrol

# Parar containers
docker-compose down

# Parar e remover volumes (apaga dados do banco)
docker-compose down -v
```

---

## Autor

Desenvolvido por **Hugo L. Almeida**.

---

## Licença

Este projeto é de uso interno e proprietário.
