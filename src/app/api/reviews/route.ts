import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabase,
  isServerSupabaseKnownBlocked,
} from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (isServerSupabaseKnownBlocked()) {
    return NextResponse.json({ sandboxDirect: true });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ sandboxDirect: true });
  }

  try {
    if (body.action === 'increment_view' && body.product_id) {
      await supabase.rpc('increment_product_view', {
        p_product_id: body.product_id,
      });
      return NextResponse.json({ sandboxDirect: false, ok: true });
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: body.product_id,
        author_name: body.author_name,
        rating: body.rating,
        comment: body.comment,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ sandboxDirect: false, review: data });
  } catch {
    return NextResponse.json({ sandboxDirect: true });
  }
}
