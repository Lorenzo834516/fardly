import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { data: business, error } = await supabaseAdmin
    .from('businesses')
    .select('id, name, logo_url, brand_color, whatsapp_number, instagram_handle, facebook_handle, tiktok_handle, twitter_handle, website_url')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single();

  if (error || !business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
  }

  const { data: mainBranch } = await supabaseAdmin
    .from('branches')
    .select('address, phone, opening_hours')
    .eq('business_id', business.id)
    .eq('is_main', true)
    .maybeSingle();

  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name, sort_order')
    .eq('business_id', business.id)
    .order('sort_order', { ascending: true });

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, category_id, name, description, price, image_url, available')
    .eq('business_id', business.id)
    .eq('available', true);

  const { data: coupons } = await supabaseAdmin
    .from('coupons')
    .select('id, code, type, value, description, ends_at')
    .eq('business_id', business.id)
    .eq('active', true)
    .or('ends_at.is.null,ends_at.gt.' + new Date().toISOString());

  const menu = (categories ?? [])
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      products: (products ?? []).filter((p) => p.category_id === cat.id),
    }))
    .filter((cat) => cat.products.length > 0);

  return NextResponse.json({
    id: business.id,
    name: business.name,
    logoUrl: business.logo_url,
    brandColor: business.brand_color,
    whatsapp: business.whatsapp_number,
    instagram: business.instagram_handle,
    facebook: business.facebook_handle,
    tiktok: business.tiktok_handle,
    twitter: business.twitter_handle,
    website: business.website_url,
    address: mainBranch?.address ?? null,
    phone: mainBranch?.phone ?? null,
    openingHours: mainBranch?.opening_hours ?? null,
    menu,
    coupons: coupons ?? [],
  });
}