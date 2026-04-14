interface Env {
  BYPASS_TURNSTILE?: string;
  CONTACT_TO_EMAIL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface ContactRequestBody {
  email?: string;
  message?: string;
  name?: string;
  subject?: string;
  turnstileToken?: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
}

const corsHeaders = {
  'Content-Type': 'application/json',
};

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function verifyTurnstile(secret: string, token: string, ipAddress: string | null) {
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);

  if (ipAddress) {
    formData.append('remoteip', ipAddress);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as TurnstileVerifyResponse;
  return result.success;
}

async function sendWithResend(env: Env, payload: Required<Omit<ContactRequestBody, 'turnstileToken'>>) {
  const to = env.CONTACT_TO_EMAIL;
  const from = env.RESEND_FROM_EMAIL;
  const apiKey = env.RESEND_API_KEY;

  if (!to || !from || !apiKey) {
    return false;
  }

  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message).replaceAll('\n', '<br />');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `Portfolio contact: ${payload.subject}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Subject: ${payload.subject}`,
        '',
        payload.message,
      ].join('\n'),
      html: `
        <div>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    }),
  });

  return response.ok;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.CONTACT_TO_EMAIL) {
    return json({ error: 'Contact form is not configured.' }, 503);
  }

  let body: ContactRequestBody;

  try {
    body = (await request.json()) as ContactRequestBody;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const subject = body.subject?.trim() ?? '';
  const message = body.message?.trim() ?? '';
  const turnstileToken = body.turnstileToken?.trim() ?? '';
  const bypassTurnstile = env.BYPASS_TURNSTILE === 'true';

  if (!name || !email || !subject || !message || (!turnstileToken && !bypassTurnstile)) {
    return json({ error: 'Missing required fields.' }, 400);
  }

  if (!isValidEmail(email) || subject.length > 180 || message.length > 4000 || name.length > 120) {
    return json({ error: 'Invalid form fields.' }, 400);
  }

  const ipAddress = request.headers.get('CF-Connecting-IP');
  const captchaValid = bypassTurnstile
    ? true
    : await verifyTurnstile(env.TURNSTILE_SECRET_KEY, turnstileToken, ipAddress);

  if (!captchaValid) {
    return json({ error: 'Captcha verification failed.' }, 400);
  }

  const emailSent = await sendWithResend(env, {
    name,
    email,
    subject,
    message,
  });

  if (!emailSent) {
    return json({ error: 'Email delivery failed.' }, 502);
  }

  return json({ ok: true });
};
