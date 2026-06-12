import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    console.warn('[Admin API: update-settings] Unauthorized access attempt or missing CSRF token.');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { siteTitle, siteDescription } = await request.json();

    const updateData: any = {};
    if (siteTitle !== undefined) updateData.siteTitle = siteTitle;
    if (siteDescription !== undefined) updateData.siteDescription = siteDescription;

    await db.collection('site_content').doc('settings').set(updateData, { merge: true });

    console.info('[Admin API: update-settings] Action completed successfully.');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[Admin API: update-settings] Critical failure during execution:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

