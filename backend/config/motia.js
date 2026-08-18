// config/motia.js
import fetch from 'node-fetch';

/**
 * Trigger a Motia workflow event
 * @param {string} eventName
 * @param {object} payload
 */
export async function triggerMotiaEvent(eventName, payload) {
  try {
    const response = await fetch(process.env.MOTIA_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MOTIA_API_KEY}`
      },
      body: JSON.stringify({
        event: eventName,
        payload,
        source: 'student-dropout-backend',
        timestamp: new Date().toISOString()
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Motia event trigger failed:', error.message);
  }
}






