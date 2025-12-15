import { NextRequest, NextResponse } from 'next/server';
import { query, CND } from '@/lib/db';

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

    const insertedCnds: CND[] = [];

    for (const cnd of cnds) {
      const result = await query<CND>(`
        INSERT INTO cnds (
          id, cliente_codigo, cliente_nome, cliente_cnpj, cnd,
          vencimento, mes_referencia, status, observacao,
          pendencia, responsavel, prazo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        cnd.id,
        cnd.cliente_codigo || '',
        cnd.cliente_nome,
        cnd.cliente_cnpj || '',
        cnd.cnd,
        cnd.vencimento,
        cnd.mes_referencia,
        cnd.status,
        cnd.observacao || '',
        cnd.pendencia || '',
        cnd.responsavel || '',
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
