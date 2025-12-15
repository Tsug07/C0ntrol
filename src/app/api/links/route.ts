import { NextRequest, NextResponse } from 'next/server';
import { query, CNDLink } from '@/lib/db';

// GET - Listar todos os Links
export async function GET() {
  try {
    const links = await query<CNDLink>(`
      SELECT id, name, url, category, created_at
      FROM cnd_links
      ORDER BY category ASC, name ASC
    `);

    return NextResponse.json(links);
  } catch (error) {
    console.error('Erro ao buscar Links:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar Links' },
      { status: 500 }
    );
  }
}

// POST - Criar novo Link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await query<CNDLink>(`
      INSERT INTO cnd_links (id, name, url, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      body.id,
      body.name,
      body.url,
      body.category
    ]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar Link:', error);
    return NextResponse.json(
      { error: 'Erro ao criar Link' },
      { status: 500 }
    );
  }
}
