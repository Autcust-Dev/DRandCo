import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { slug, title, content } = await request.json();

    if (!slug || !title || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    await db.collection('policies').doc(slug).set({
      slug,
      title,
      content,
      date: new Date().toISOString()
    }, { merge: true });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error updating policy:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

