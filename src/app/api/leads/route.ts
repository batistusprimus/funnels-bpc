import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { submitLeadSchema } from '@/lib/validation';
import { routeLead } from '@/lib/lead-router';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Valider les données
    const validation = submitLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { funnelId, variant, data, utmParams } = validation.data;

    const supabase = await createServerClient();

    // Vérifier que le funnel existe
    const { data: funnel, error: funnelError } = await supabase
      .from('funnels')
      .select('id')
      .eq('id', funnelId)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    // Créer le lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        funnel_id: funnelId,
        variant,
        data,
        utm_params: utmParams || {},
        status: 'pending',
      })
      .select()
      .single();

    if (leadError || !lead) {
      console.error('Error creating lead:', leadError);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Router le lead (async, en arrière-plan)
    routeLead(lead.id).catch((error) => {
      console.error('Error routing lead:', error);
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const funnelId = searchParams.get('funnelId');

    let query = supabase
      .from('leads')
      .select('*, funnels(name, slug)')
      .order('created_at', { ascending: false });

    if (funnelId) {
      query = query.eq('funnel_id', funnelId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads: data });
  } catch (error) {
    console.error('Error in GET /api/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

