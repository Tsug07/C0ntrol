# 🚀 Guia de Deploy - C0ntrol

## Pré-requisitos na VPS

1. **Docker** e **Docker Compose** instalados
2. **Nginx** (opcional, para proxy reverso)
3. **Certbot** (para SSL/HTTPS)
4. Portas **80** (HTTP) e **443** (HTTPS) abertas

## 📋 Passo a Passo

### 1. Preparar a VPS

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
```

### 2. Clonar o Projeto

```bash
# Criar diretório
mkdir -p /opt/c0ntrol
cd /opt/c0ntrol

# Clonar repositório
git clone <seu-repositorio> .
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env.production

# Editar com senhas fortes
nano .env.production
```

**⚠️ IMPORTANTE**: Altere as seguintes variáveis:

```env
DATABASE_URL=postgresql://c0ntrol_user:SENHA_FORTE_AQUI@c0ntrol_db:5432/c0ntrol
POSTGRES_PASSWORD=SENHA_FORTE_AQUI
```

### 4. Subir os Containers

```bash
# Build e start
docker-compose -f docker-compose.production.yml up -d --build

# Verificar logs
docker-compose -f docker-compose.production.yml logs -f
```

### 5. Configurar Nginx (Proxy Reverso)

Criar arquivo `/etc/nginx/sites-available/c0ntrol`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    # SSL (configurar com Certbot)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy para aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar site:

```bash
sudo ln -s /etc/nginx/sites-available/c0ntrol /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

### 7. Configurar Backup Automático

```bash
# Dar permissão ao script
chmod +x scripts/backup-db.sh

# Adicionar ao crontab (backup diário às 2h da manhã)
crontab -e

# Adicionar linha:
0 2 * * * cd /opt/c0ntrol && ./scripts/backup-db.sh >> /var/log/c0ntrol-backup.log 2>&1
```

## 🔒 Checklist de Segurança

- [ ] Senhas fortes no `.env.production`
- [ ] Porta 5432 (PostgreSQL) NÃO exposta publicamente
- [ ] Firewall configurado (apenas 80, 443, 22)
- [ ] SSL/HTTPS ativado
- [ ] Backups automáticos configurados
- [ ] Logs sendo monitorados

## 📊 Monitoramento

### Ver logs da aplicação:
```bash
docker-compose -f docker-compose.production.yml logs -f c0ntrol_app
```

### Ver logs do banco:
```bash
docker-compose -f docker-compose.production.yml logs -f c0ntrol_db
```

### Verificar saúde dos containers:
```bash
docker ps
docker stats
```

## 🔄 Atualização da Aplicação

```bash
# Pull das mudanças
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.production.yml up -d --build

# Verificar logs
docker-compose -f docker-compose.production.yml logs -f
```

## 🆘 Troubleshooting

### Container não inicia:
```bash
# Ver logs detalhados
docker-compose -f docker-compose.production.yml logs

# Verificar recursos
docker stats
free -h
df -h
```

### Banco de dados com problema:
```bash
# Entrar no container
docker exec -it c0ntrol_db psql -U c0ntrol_user -d c0ntrol

# Ver conexões ativas
SELECT * FROM pg_stat_activity;
```

### Restaurar backup:
```bash
# Parar aplicação
docker-compose -f docker-compose.production.yml stop c0ntrol_app

# Restaurar
gunzip < backups/c0ntrol_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i c0ntrol_db psql -U c0ntrol_user -d c0ntrol

# Reiniciar
docker-compose -f docker-compose.production.yml start c0ntrol_app
```

## 📱 Acessar a Aplicação

Após deploy completo, acesse:
- **Produção**: https://seu-dominio.com
- **Status**: `docker ps`

---

**Desenvolvido por**: Canella e Santos
**Última atualização**: 2025
