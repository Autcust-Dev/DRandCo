import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    console.warn('[Admin API: delete-doc] Unauthorized access attempt or missing CSRF token.');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { slug } = await request.json();

    if (!slug) {
      console.warn('[Admin API: delete-doc] Missing required fields in request.');
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    }

    await db.collection('docs').doc(slug).delete();

    console.info('[Admin API: delete-doc] Action completed successfully.');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[Admin API: delete-doc] Critical failure during execution:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

