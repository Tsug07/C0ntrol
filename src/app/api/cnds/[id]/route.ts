import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, CND } from '@/lib/db';

// GET - Buscar CND por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cnd = await queryOne<CND>(`
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
      WHERE id = $1
    `, [id]);

    if (!cnd) {
      return NextResponse.json(
        { error: 'CND não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(cnd);
  } catch (error) {
    console.error('Erro ao buscar CND:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar CND' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar CND
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await query<CND>(`
      UPDATE cnds SET
        cliente_codigo = $2,
        cliente_nome = $3,
        cliente_cnpj = $4,
        cnd = $5,
        vencimento = $6,
        mes_referencia = $7,
        status = $8,
        observacao = $9,
        pendencia = $10,
        responsavel = $11,
        prazo = $12,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      id,
      body.cliente_codigo || '',
      body.cliente_nome,
      body.cliente_cnpj || '',
      body.cnd,
      body.vencimento,
      body.mes_referencia,
      body.status,
      body.observacao || '',
      body.pendencia || '',
      body.responsavel || '',
      body.prazo || null
    ]);

    if (!result[0]) {
      return NextResponse.json(
        { error: 'CND não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar CND:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar CND' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir CND
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query<CND>(
      'DELETE FROM cnds WHERE id = $1 RETURNING *',
      [id]
    );

    if (!result[0]) {
      return NextResponse.json(
        { error: 'CND não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir CND:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir CND' },
      { status: 500 }
    );
  }
}
