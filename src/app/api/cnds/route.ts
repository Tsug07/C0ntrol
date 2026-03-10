import { NextRequest, NextResponse } from 'next/server';
import { query, CND } from '@/lib/db';

// Validação de entrada
function sanitizeString(str: string): string {
  return str.trim().slice(0, 500); // Limitar tamanho
}

function isValidCNPJ(cnpj: string): boolean {
  if (!cnpj || cnpj.trim() === '') return true;
  const cleaned = cnpj.replace(/[\.\-\/\s]/g, '');
  return /^\d{11,14}$/.test(cleaned);
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

function isValidStatus(status: string): boolean {
  return ['Válida', 'Vencida', 'A Vencer'].includes(status);
}

// GET - Listar todas as CNDs
export async function GET() {
  try {
    const cnds = await query<CND>(`
      SELECT
        id,
        cliente_codigo,
        cliente_nome,
        cliente_cnpj,
        cnd,
        TO_CHAR(vencimento, 'YYYY-MM-DD') as vencimento,
        mes_referencia,
        status,
        observacao,
        pendencia,
        responsavel,
        TO_CHAR(prazo, 'YYYY-MM-DD') as prazo,
        created_at,
        updated_at
      FROM cnds
      ORDER BY vencimento ASC
    `);

    return NextResponse.json(cnds);
  } catch (error) {
    console.error('Erro ao buscar CNDs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar CNDs' },
      { status: 500 }
    );
  }
}

// POST - Criar uma ou mais CNDs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar se é array (múltiplas CNDs) ou objeto único
    const cnds: CND[] = Array.isArray(body) ? body : [body];

    // Validar número de registros (máximo 100 por request)
    if (cnds.length > 100) {
      return NextResponse.json(
        { error: 'Máximo de 100 registros por vez' },
        { status: 400 }
      );
    }

    const insertedCnds: CND[] = [];

    for (const cnd of cnds) {
      // Validações
      if (!cnd.cliente_nome || cnd.cliente_nome.trim() === '') {
        return NextResponse.json(
          { error: 'Nome do cliente é obrigatório' },
          { status: 400 }
        );
      }

      if (!cnd.cnd || cnd.cnd.trim() === '') {
        return NextResponse.json(
          { error: 'Número da CND é obrigatório' },
          { status: 400 }
        );
      }

      if (!isValidDate(cnd.vencimento)) {
        return NextResponse.json(
          { error: 'Data de vencimento inválida' },
          { status: 400 }
        );
      }

      if (!isValidStatus(cnd.status)) {
        return NextResponse.json(
          { error: 'Status inválido' },
          { status: 400 }
        );
      }

      if (cnd.cliente_cnpj && !isValidCNPJ(cnd.cliente_cnpj)) {
        return NextResponse.json(
          { error: 'CNPJ inválido' },
          { status: 400 }
        );
      }
      // Sanitizar dados antes de inserir
      const result = await query<CND>(`
        INSERT INTO cnds (
          id, cliente_codigo, cliente_nome, cliente_cnpj, cnd,
          vencimento, mes_referencia, status, observacao,
          pendencia, responsavel, prazo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        cnd.id,
        sanitizeString(cnd.cliente_codigo || ''),
        sanitizeString(cnd.cliente_nome),
        sanitizeString(cnd.cliente_cnpj || ''),
        sanitizeString(cnd.cnd),
        cnd.vencimento,
        sanitizeString(cnd.mes_referencia),
        cnd.status,
        sanitizeString(cnd.observacao || ''),
        sanitizeString(cnd.pendencia || ''),
        sanitizeString(cnd.responsavel || ''),
        cnd.prazo || null
      ]);

      if (result[0]) {
        insertedCnds.push(result[0]);
      }
    }

    return NextResponse.json(insertedCnds, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar CND:', error);
    return NextResponse.json(
      { error: 'Erro ao criar CND' },
      { status: 500 }
    );
  }
}

// DELETE - Limpar todas as CNDs ou por mês
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes');

    if (mes) {
      // Deletar CNDs de um mês específico
      await query('DELETE FROM cnds WHERE mes_referencia = $1', [mes]);
    } else {
      // Deletar todas as CNDs
      await query('DELETE FROM cnds');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar CNDs:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar CNDs' },
      { status: 500 }
    );
  }
}
