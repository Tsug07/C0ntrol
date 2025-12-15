import { Pool } from 'pg';

// Pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Testar conexão
pool.on('error', (err) => {
  console.error('Erro inesperado no pool PostgreSQL:', err);
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
