import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../lib/db';
import { ScheduledPayment } from '../../../lib/types';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json(db.scheduledPayments || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch scheduled payments.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { recipientEmail, amount, frequency } = await req.json();

    if (!recipientEmail || amount === undefined || isNaN(Number(amount)) || !frequency) {
      return NextResponse.json({ error: 'Missing or invalid parameters.' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero.' }, { status: 400 });
    }

    const db = getDb();
    
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

    const newSchedule: ScheduledPayment = {
      id: `sp-${Math.random().toString(36).substring(2, 9)}`,
      recipientEmail,
      amount: numAmount,
      frequency,
      nextExecution: nextExecutionText,
      status: 'active',
    };

    db.scheduledPayments = [newSchedule, ...(db.scheduledPayments || [])];
    saveDb(db);

    return NextResponse.json(newSchedule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to schedule payment.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required.' }, { status: 400 });
    }

    const db = getDb();
    const originalLength = db.scheduledPayments.length;
    db.scheduledPayments = db.scheduledPayments.filter((sp) => sp.id !== id);

    if (db.scheduledPayments.length === originalLength) {
      return NextResponse.json({ error: 'Scheduled payment not found.' }, { status: 404 });
    }

    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete scheduled payment.' }, { status: 500 });
  }
}
