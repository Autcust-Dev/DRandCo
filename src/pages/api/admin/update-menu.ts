import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    console.warn('[Admin API: update-menu] Unauthorized access attempt or missing CSRF token.');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id, title, items, order } = await request.json();

    if (!id || !title) {
      console.warn('[Admin API: update-menu] Missing required fields in request.');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Save menu to Firestore under the 'menus' collection
    await db.collection('menus').doc(id).set({
      id,
      title,
      items: items || [],
      order: order || 0,
      updatedAt: new Date().toISOString()
    });

    console.info('[Admin API: update-menu] Action completed successfully.');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[Admin API: update-menu] Critical failure during execution:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
