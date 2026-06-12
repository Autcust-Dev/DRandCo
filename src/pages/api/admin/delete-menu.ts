import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    console.warn('[Admin API: delete-menu] Unauthorized access attempt or missing CSRF token.');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      console.warn('[Admin API: delete-menu] Missing required fields in request.');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    await db.collection('menus').doc(id).delete();

    console.info('[Admin API: delete-menu] Action completed successfully.');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[Admin API: delete-menu] Critical failure during execution:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
