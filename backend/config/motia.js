import fetch from 'node-fetch';

export async function triggerMotiaEvent(eventName, payload) {
  if (!process.env.MOTIA_WEBHOOK_URL) throw new Error('MOTIA_WEBHOOK_URL is not configured');
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.MOTIA_API_KEY) headers.Authorization = `Bearer ${process.env.MOTIA_API_KEY}`;
  const response = await fetch(process.env.MOTIA_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      event: eventName,
      payload,
      source: 'campus-iq-backend',
      timestamp: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(`Motia returned HTTP ${response.status}`);
  return response.json();
}
