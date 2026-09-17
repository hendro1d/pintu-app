import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(req) {
  try {
    const data = await req.json(); // Expected format: [{id: 1, order_index: 0}, {id: 2, order_index: 1}, ...]
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update each item's order_index
      for (const item of data) {
        if (item.id !== undefined && item.order_index !== undefined) {
          await connection.query(
            'UPDATE apps SET order_index = ? WHERE id = ?',
            [item.order_index, item.id]
          );
        }
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({ success: true });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Failed to reorder apps:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
