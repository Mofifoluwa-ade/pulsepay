import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { ScheduledPayment } from '../../../lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Database is not configured. Please set up Supabase.' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('scheduled_payments')
      .select('*')
      .eq('user_email', email.toLowerCase());

    if (error) throw error;

    const mapped = (data || []).map((sp) => ({
      id: sp.id,
      recipientEmail: sp.recipient_email,
      amount: Number(sp.amount),
      frequency: sp.frequency,
      nextExecution: sp.next_execution,
      status: sp.status,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch scheduled payments.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { recipientEmail, amount, frequency, email } = await req.json();

    if (!recipientEmail || amount === undefined || isNaN(Number(amount)) || !frequency || !email) {
      return NextResponse.json({ error: 'Missing or invalid parameters.' }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Database is not configured. Please set up Supabase.' }, { status: 500 });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero.' }, { status: 400 });
    }

    // Generate simple execution text based on frequency
    let nextExecutionText = '';
    const now = new Date();
    if (frequency === 'daily') {
      nextExecutionText = 'Tomorrow, ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (frequency === 'weekly') {
      nextExecutionText = 'Next Monday, 10:00 AM';
    } else if (frequency === 'monthly') {
      nextExecutionText = 'In 30 days, ' + now.toLocaleDateString();
    } else {
      nextExecutionText = 'Once on ' + new Date(now.getTime() + 86400000 * 2).toLocaleDateString();
    }

    const newScheduleId = `sp-${Math.random().toString(36).substring(2, 9)}`;
    const lowerEmail = email.toLowerCase();
    
    const { error } = await supabase.from('scheduled_payments').insert({
      id: newScheduleId,
      user_email: lowerEmail,
      recipient_email: recipientEmail,
      amount: numAmount,
      frequency,
      next_execution: nextExecutionText,
      status: 'active',
    });

    if (error) throw error;

    return NextResponse.json({
      id: newScheduleId,
      recipientEmail,
      amount: numAmount,
      frequency,
      nextExecution: nextExecutionText,
      status: 'active',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to schedule payment.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id || !email) {
      return NextResponse.json({ error: 'Schedule ID and Email are required.' }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Database is not configured. Please set up Supabase.' }, { status: 500 });
    }

    const { error } = await supabase
      .from('scheduled_payments')
      .delete()
      .eq('id', id)
      .eq('user_email', email.toLowerCase());

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete scheduled payment.' }, { status: 500 });
  }
}
