import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';

export async function GET(req, context) {
  const params = await context.params;
  const filename = params?.filename;
  
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Security: prevent directory traversal
  const safeFilename = path.basename(filename);
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(uploadsDir, safeFilename);

  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Read the file buffer
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (safeFilename.endsWith('.png')) contentType = 'image/png';
    else if (safeFilename.endsWith('.jpg') || safeFilename.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (safeFilename.endsWith('.gif')) contentType = 'image/gif';
    else if (safeFilename.endsWith('.webp')) contentType = 'image/webp';
    else if (safeFilename.endsWith('.svg')) contentType = 'image/svg+xml';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
