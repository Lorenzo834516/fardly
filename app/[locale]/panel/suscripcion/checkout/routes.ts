import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getStripe, MONTHLY_PLAN_PRICE_ID } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Inicializamos la instancia de Stripe dentro de la función handler
    const stripe = getStripe();

    // ... Continúa con la lógica de tu endpoint usando 'stripe' y 'MONTHLY_PLAN_PRICE_ID'
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error en el servidor' },
      { status: 500 }
    );
  }
}