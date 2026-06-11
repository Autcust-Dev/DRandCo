import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { slug } = await request.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
    }

    await db.collection('apps').doc(slug).delete();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting app:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

