import { Pool } from 'pg';

// Configuração do pool com limites de segurança e performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL apenas em produção com banco externo
  ssl: process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('c0ntrol_db')
    ? false
    : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
  // Configurações de pool para produção
  max: 20, // Máximo de conexões
  min: 2, // Mínimo de conexões mantidas
  idleTimeoutMillis: 30000, // Fechar conexões idle após 30s
  connectionTimeoutMillis: 10000, // Timeout de conexão: 10s
  // Statement timeout para prevenir queries lentas
  statement_timeout: 30000, // 30 segundos máximo por query
});

// Eventos do pool para monitoramento
pool.on('error', (err) => {
  console.error('[DB Pool] Erro inesperado no pool PostgreSQL:', err);
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB Pool] Nova conexão estabelecida');
  }
});

pool.on('remove', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB Pool] Conexão removida do pool');
  }
});

// Helper para queries
export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Helper para query única
export async function queryOne<T>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// Tipos para as tabelas
export interface CND {
  id: string;
  cliente_codigo: string;
  cliente_nome: string;
  cliente_cnpj: string;
  cnd: string;
  vencimento: string;
  mes_referencia: string;
  status: 'Válida' | 'Vencida' | 'A Vencer';
  observacao: string;
  pendencia: string;
  responsavel: string;
  prazo: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CNDLink {
  id: string;
  name: string;
  url: string;
  category: string;
  created_at?: string;
}

export default pool;
