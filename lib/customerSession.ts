import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.COOKIE_SECRET!; // pon un string largo y aleatorio en tu .env

export const CUSTOMER_COOKIE = 'cf_session';

type SessionPayload = {
  customerId: string;
  businessId: string;
};

function sign(value: string) {
  return createHmac('sha256', SECRET).update(value).digest('base64url');
}

// Genera el valor de la cookie: payload en base64 + firma, separados por punto.
// Nadie puede modificar customerId/businessId sin conocer SECRET, porque
// la firma dejaría de coincidir.
export function createSessionToken(payload: SessionPayload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;

  const expected = sign(data);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}