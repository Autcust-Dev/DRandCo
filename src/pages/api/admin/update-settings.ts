import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../lib/auth';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isAuthenticated = await verifyAdminSession(request, cookies);
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { siteTitle, siteDescription } = await request.json();

    const updateData: any = {};
    if (siteTitle !== undefined) updateData.siteTitle = siteTitle;
    if (siteDescription !== undefined) updateData.siteDescription = siteDescription;

    await db.collection('site_content').doc('settings').set(updateData, { merge: true });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

