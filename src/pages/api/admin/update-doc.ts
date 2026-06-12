import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    console.warn('[Admin API: update-doc] Unauthorized access attempt or missing CSRF token.');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { slug, title, content } = await request.json();

    if (!slug || !title || content === undefined) {
      console.warn('[Admin API: update-doc] Missing required fields in request.');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Save doc to Firestore under the 'docs' collection
    await db.collection('docs').doc(slug).set({
      slug,
      title,
      content,
      updatedAt: new Date().toISOString()
    });

    console.info('[Admin API: update-doc] Action completed successfully.');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[Admin API: update-doc] Critical failure during execution:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

