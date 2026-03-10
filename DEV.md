# 🛠️ Guia de Desenvolvimento Local - C0ntrol

## Desenvolvimento Local (sem Docker)

### 1. Requisitos
- Node.js 20+
- PostgreSQL 16+
- npm ou yarn

### 2. Configuração

```bash
# Instalar dependências
npm install

# Configurar .env.local
cp .env.example .env.local
```

Editar `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/c0ntrol_dev
NODE_ENV=development
```

### 3. Configurar Banco de Dados Local

```bash
# Criar banco
createdb c0ntrol_dev

# Rodar migrations (schema)
psql -d c0ntrol_dev -f init.sql
```

### 4. Rodar em Desenvolvimento

```bash
# Modo desenvolvimento (hot reload)
npm run dev

# Abrir: http://localhost:3000
```

## Desenvolvimento com Docker (Recomendado)

### 1. Subir apenas o banco de dados:

```bash
# Criar docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up -d c0ntrol_db
```

### 2. Rodar app localmente:

```bash
npm run dev
```

Vantagens:
- Hot reload funciona
- Logs diretos no terminal
- Debugging mais fácil

## 🧪 Testes

```bash
# Rodar testes (quando implementados)
npm test

# Rodar linter
npm run lint

# Build local
npm run build
npm start
```

## 📦 Build Docker Local

```bash
# Build
docker-compose build

# Subir
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## 🔍 Debugging

### Logs do Next.js:
```bash
# Em dev
npm run dev

# Ver requisições API
# Checar terminal onde o dev está rodando
```

### Logs do PostgreSQL:
```bash
docker logs c0ntrol_db -f
```

### Conectar ao banco:
```bash
# Via Docker
docker exec -it c0ntrol_db psql -U c0ntrol_user -d c0ntrol

# Via cliente local
psql -h localhost -U c0ntrol_user -d c0ntrol
```

## 🎨 Estrutura do Projeto

```
c0ntrol/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── cnds/         # Página CNDs
│   │   ├── links-cnd/    # Página Links
│   │   └── rotina/       # Página Rotina
│   ├── components/       # Componentes React
│   │   ├── ui/           # Componentes UI
│   │   └── Navbar.tsx    # Navegação
│   ├── hooks/            # Custom Hooks
│   ├── lib/              # Utilitários
│   │   └── db.ts         # Database connection
│   └── styles/           # Estilos globais
├── scripts/              # Scripts utilitários
├── docker/               # Configurações Docker
├── Dockerfile            # Build da aplicação
├── docker-compose.yml    # Compose local
└── next.config.js        # Config Next.js
```

## 🔧 Comandos Úteis

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpar build do Next.js
rm -rf .next

# Limpar Docker (cuidado!)
docker system prune -a
docker volume prune

# Rebuild completo
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 💡 Dicas

1. **Hot Reload não funciona no Docker**: Use `npm run dev` localmente
2. **Mudanças no schema**: Rode o `init.sql` novamente
3. **Port já em uso**: Mude a porta no `docker-compose.yml`
4. **CSS não carrega**: Limpe `.next/` e rebuilde

## 🐛 Problemas Comuns

### Porta 3000 já em uso:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Erro de permissão no PostgreSQL:
```bash
# Resetar senha
docker exec -it c0ntrol_db psql -U postgres
ALTER USER c0ntrol_user WITH PASSWORD 'new_password';
```

### Build do Docker falha:
```bash
# Limpar cache
docker builder prune -a

# Rebuild sem cache
docker-compose build --no-cache
```

---

**Happy Coding! 🚀**
