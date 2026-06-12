import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    console.warn('[Admin API: update-app] Unauthorized access attempt or missing CSRF token.');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { slug, name, content } = await request.json();

    if (!slug || !name || content === undefined) {
      console.warn('[Admin API: update-app] Missing required fields in request.');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Save app info to Firestore under the 'apps' collection
    await db.collection('apps').doc(slug).set({
      slug,
      name,
      content,
      updatedAt: new Date().toISOString()
    });

    console.info('[Admin API: update-app] Action completed successfully.');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[Admin API: update-app] Critical failure during execution:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

