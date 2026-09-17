import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

export async function PUT(req, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const formData = await req.formData();
    
    const name = formData.get('name');
    const description = formData.get('description');
    const url = formData.get('url');
    const category = formData.get('category');
    
    const pool = getPool();
    
    // Check existing app to preserve old image if not updated
    const [existingRows] = await pool.query('SELECT logo_url, screenshot_url FROM apps WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, error: 'App not found' }, { status: 404 });
    }
    const existing = existingRows[0];
    
    let logo_url = existing.logo_url;
    let screenshot_url = existing.screenshot_url;
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    const logoFile = formData.get('logo');
    if (logoFile && typeof logoFile !== 'string' && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const fileName = `${Date.now()}-logo-${logoFile.name}`;
      await fs.writeFile(path.join(uploadsDir, fileName), buffer);
      logo_url = `/api/uploads/${fileName}`;
    }

    const screenshotFile = formData.get('screenshot');
    if (screenshotFile && typeof screenshotFile !== 'string' && screenshotFile.size > 0) {
      const buffer = Buffer.from(await screenshotFile.arrayBuffer());
      const fileName = `${Date.now()}-screenshot-${screenshotFile.name}`;
      await fs.writeFile(path.join(uploadsDir, fileName), buffer);
      screenshot_url = `/api/uploads/${fileName}`;
    }

    await pool.query(
      'UPDATE apps SET name = ?, description = ?, url = ?, category = ?, logo_url = ?, screenshot_url = ? WHERE id = ?',
      [name, description, url, category, logo_url, screenshot_url, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update app:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const pool = getPool();
    await pool.query('DELETE FROM apps WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete app:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
