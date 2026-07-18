import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Database is not configured. Please configure Supabase.' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('user_email', email.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((f) => ({
      id: f.id,
      email: f.friend_email,
      name: f.friend_name,
      initials: f.initials,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch friends.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, friendEmail, friendName } = await req.json();

    if (!email || !friendEmail || !friendName) {
      return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Database is not configured. Please configure Supabase.' }, { status: 500 });
    }

    const initials = friendName.substring(0, 2).toUpperCase();
    const id = `friend-${Math.random().toString(36).substring(2, 9)}`;

    const { error } = await supabase.from('friends').insert({
      id,
      user_email: email.toLowerCase(),
      friend_email: friendEmail.toLowerCase(),
      friend_name: friendName,
      initials,
    });

    if (error) throw error;

    return NextResponse.json({ id, email: friendEmail, name: friendName, initials });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add friend.' }, { status: 500 });
  }
}
