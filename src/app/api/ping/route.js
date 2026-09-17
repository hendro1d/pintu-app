import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const [apps] = await pool.query('SELECT id, url FROM apps');

    const updatePromises = apps.map(async (app) => {
      const startTime = Date.now();
      let status = 'OFFLINE';
      let latency = 0;

      for (let i = 0; i < 3; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const response = await fetch(app.url, { 
            method: 'GET',
            signal: controller.signal,
            mode: 'no-cors'
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok || response.type === 'opaque' || (response.status >= 200 && response.status < 500)) {
              status = 'ONLINE';
              break; // Success, stop retrying
          }
        } catch (error) {
          // If fetch fails (e.g. ECONNRESET), we let the loop try again
        }
        
        // Wait 1 second before retrying, if not the last attempt
        if (i < 2) await new Promise(r => setTimeout(r, 1000));
      }

      latency = Date.now() - startTime;
      
      return pool.query(
        'UPDATE apps SET status = ?, latency = ?, last_checked = NOW() WHERE id = ?',
        [status, latency, app.id]
      );
    });

    await Promise.allSettled(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to ping apps:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
