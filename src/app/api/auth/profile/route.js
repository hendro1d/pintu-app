import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');
    
    if (!authSession) {
      return NextResponse.json({ success: false, message: 'Tidak ada akses' }, { status: 401 });
    }

    let username = authSession.value;
    if (username === 'true') {
      username = 'admin'; // Backwards compatibility with old cookie format
    }
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    const pool = getPool();
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Password saat ini salah' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE username = ?', [newHash, username]);

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
