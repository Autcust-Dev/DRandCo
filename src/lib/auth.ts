import { jwtVerify } from 'jose';
import type { AstroCookies } from 'astro';

export async function hashString(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyAdminSession(request: Request, cookies: AstroCookies): Promise<boolean> {
  const sessionCookie = cookies.get('admin_session');
  if (!sessionCookie) return false;

  // CSRF Protection for state-changing requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const csrfTokenHeader = request.headers.get('x-csrf-token');
    const csrfTokenCookie = cookies.get('csrf_token')?.value;

    if (!csrfTokenHeader || !csrfTokenCookie || csrfTokenHeader !== csrfTokenCookie) {
      console.warn('CSRF token validation failed in admin session verifier');
      return false;
    }
  }

  try {
    const jwtSecret = import.meta.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(sessionCookie.value, secret);
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const fingerprint = await hashString(userAgent);

    if (payload.fingerprint !== fingerprint) {
      return false; // Possible session hijack
    }

    return true;
  } catch (err) {
    return false;
  }
}

