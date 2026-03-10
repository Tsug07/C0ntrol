#!/bin/bash
# ===========================================
# SCRIPT DE BACKUP DO BANCO DE DADOS
# Uso: ./backup-db.sh
# ===========================================

set -e

# Configurações
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="c0ntrol_backup_${TIMESTAMP}.sql"
CONTAINER_NAME="c0ntrol_db"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

echo "🔄 Iniciando backup do banco de dados..."
echo "📅 Data/Hora: $(date)"

# Fazer backup usando pg_dump dentro do container
docker exec -t "$CONTAINER_NAME" pg_dump -U c0ntrol_user -d c0ntrol > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compactar o backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

echo "✅ Backup concluído: ${BACKUP_DIR}/${BACKUP_FILE}.gz"
echo "📦 Tamanho: $(du -h "${BACKUP_DIR}/${BACKUP_FILE}.gz" | cut -f1)"

# Limpar backups antigos (manter últimos 7 dias)
find "$BACKUP_DIR" -name "c0ntrol_backup_*.sql.gz" -mtime +7 -delete
echo "🧹 Backups antigos (>7 dias) foram removidos"

echo "✨ Processo de backup finalizado!"
