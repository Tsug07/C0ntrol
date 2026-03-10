import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting simples em memória (para produção, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Configuração
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 min

function getRateLimitKey(request: NextRequest): string {
  // Em produção, usar IP real considerando proxy/load balancer
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || 'unknown');
  return `${ip}:${request.nextUrl.pathname}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(key);

  if (!record || now > record.resetTime) {
    // Novo período ou expirado
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Limite excedido
  }

  record.count++;
  return true;
}

// Cleanup periódico (executar a cada hora)
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  rateLimit.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => rateLimit.delete(key));
}, 3600000); // 1 hora

export function middleware(request: NextRequest) {
  // Aplicar rate limiting apenas para rotas de API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);

    if (!checkRateLimit(key)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW / 1000))
          }
        }
      );
    }

    // Headers de segurança
    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // CORS (ajustar para seu domínio em produção)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    }

    return response;
  }

  return NextResponse.next();
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: '/api/:path*',
};
