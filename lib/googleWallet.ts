import { GoogleAuth } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID!;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL!;

// Acepta la clave privada en dos formatos:
// 1. Normal, con \n escapadas como texto (uso local, en .env.local)
// 2. Codificada en Base64 (recomendado para Vercel, evita que la
//    interfaz web corrompa los saltos de línea al pegarla)
function resolvePrivateKey(): string {
  const raw = process.env.GOOGLE_WALLET_PRIVATE_KEY ?? '';

  if (raw.includes('BEGIN PRIVATE KEY')) {
    // Viene en formato normal, solo hay que convertir \n de texto a saltos reales
    return raw.replace(/\\n/g, '\n');
  }

  // Si no tiene el encabezado PEM, asumimos que está en Base64
  return Buffer.from(raw, 'base64').toString('utf8');
}

const PRIVATE_KEY = resolvePrivateKey();

const WALLET_BASE_URL = 'https://walletobjects.googleapis.com/walletobjects/v1';

function getAuthClient() {
  return new GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
  });
}

async function getAccessToken() {
  const auth = getAuthClient();
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('No se pudo obtener el access token de Google');
  return token;
}

type BusinessBrand = {
  id: string;
  name: string;
  logoUrl: string | null;
  brandColor: string | null;
};

// Una "clase" = el diseño base de la tarjeta de UN negocio.
// Se crea/actualiza una sola vez por negocio (no por cliente).
export async function upsertLoyaltyClass(business: BusinessBrand) {
  const token = await getAccessToken();
  const classId = `${ISSUER_ID}.${business.id}`;

  const classPayload = {
    id: classId,
    issuerName: business.name,
    programName: business.name,
    programLogo: {
      sourceUri: {
        uri: business.logoUrl || 'https://placehold.co/200x200?text=%20',
      },
    },
    hexBackgroundColor: business.brandColor || '#2b2420',
    reviewStatus: 'UNDER_REVIEW',
  };

  // Intenta actualizar; si no existe, la crea.
  const patchRes = await fetch(`${WALLET_BASE_URL}/loyaltyClass/${classId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(classPayload),
  });

  if (patchRes.status === 404) {
    const createRes = await fetch(`${WALLET_BASE_URL}/loyaltyClass`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(classPayload),
    });
    if (!createRes.ok) {
      throw new Error('No se pudo crear la clase de Wallet: ' + (await createRes.text()));
    }
  } else if (!patchRes.ok) {
    throw new Error('No se pudo actualizar la clase de Wallet: ' + (await patchRes.text()));
  }

  return classId;
}

type CustomerCard = {
  customerId: string;
  customerName: string;
  stamps: number;
  metaStamps: number;
};

// Un "objeto" = la tarjeta de UN cliente específico, con su progreso actual.
export function buildLoyaltyObjectPayload(classId: string, business: BusinessBrand, card: CustomerCard) {
  const objectId = `${ISSUER_ID}.${business.id}-${card.customerId}`;

  return {
    id: objectId,
    classId,
    state: 'ACTIVE',
    accountName: card.customerName,
    accountId: card.customerId,
    loyaltyPoints: {
      label: 'Sellos',
      balance: { string: `${card.stamps} / ${card.metaStamps}` },
    },
    barcode: {
      type: 'QR_CODE',
      value: card.customerId,
    },
  };
}

// Genera el link que abre "Agregar a Google Wallet".
// No necesita crear el objeto por adelantado: el JWT firmado
// incluye la definición completa y Google lo crea al momento
// de que el cliente le da clic.
export async function createSaveToWalletLink(business: BusinessBrand, card: CustomerCard) {
  const classId = await upsertLoyaltyClass(business);
  const loyaltyObject = buildLoyaltyObjectPayload(classId, business, card);

  const claims = {
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [loyaltyObject],
    },
  };

  const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
  return `https://pay.google.com/gp/v/save/${token}`;
}