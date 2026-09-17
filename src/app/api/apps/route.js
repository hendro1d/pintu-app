import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM apps ORDER BY order_index ASC, id ASC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Failed to fetch apps:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const url = formData.get('url');
    const category = formData.get('category');
    
    // File upload handling
    const logoFile = formData.get('logo');
    const screenshotFile = formData.get('screenshot');
    
    let logo_url = null;
    let screenshot_url = null;
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    if (logoFile && typeof logoFile !== 'string' && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const fileName = `${Date.now()}-logo-${logoFile.name}`;
      await fs.writeFile(path.join(uploadsDir, fileName), buffer);
      logo_url = `/api/uploads/${fileName}`;
    }

    if (screenshotFile && typeof screenshotFile !== 'string' && screenshotFile.size > 0) {
      const buffer = Buffer.from(await screenshotFile.arrayBuffer());
      const fileName = `${Date.now()}-screenshot-${screenshotFile.name}`;
      await fs.writeFile(path.join(uploadsDir, fileName), buffer);
      screenshot_url = `/api/uploads/${fileName}`;
    }

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO apps (name, description, url, category, logo_url, screenshot_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, url, category, logo_url, screenshot_url]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Failed to create app:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
