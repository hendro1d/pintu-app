import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const pool = getPool();
    
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [body.username]);
    
    if (users.length > 0) {
      const user = users[0];
      const isValid = await bcrypt.compare(body.password, user.password);
      
      if (isValid) {
        const cookieStore = await cookies();
        cookieStore.set('auth_session', user.username, {
          httpOnly: true,
          secure: false, // Since this runs on HTTP locally/intranet
          sameSite: 'lax',
          path: '/'
        });
        return NextResponse.json({ success: true });
      }
    }
    
    return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan' }, { status: 500 });
  }
}
