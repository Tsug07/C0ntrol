import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, CNDLink } from '@/lib/db';

// GET - Buscar Link por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const link = await queryOne<CNDLink>(
      'SELECT * FROM cnd_links WHERE id = $1',
      [id]
    );

    if (!link) {
      return NextResponse.json(
        { error: 'Link não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error('Erro ao buscar Link:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar Link' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar Link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await query<CNDLink>(`
      UPDATE cnd_links SET
        name = $2,
        url = $3,
        category = $4
      WHERE id = $1
      RETURNING *
    `, [id, body.name, body.url, body.category]);

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Link não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar Link:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar Link' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir Link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query<CNDLink>(
      'DELETE FROM cnd_links WHERE id = $1 RETURNING *',
      [id]
    );

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Link não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir Link:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir Link' },
      { status: 500 }
    );
  }
}
