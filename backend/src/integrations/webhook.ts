import axios from 'axios';
export async function triggerExternalWebhook(email: any) {
  const url = process.env.EXTERNAL_WEBHOOK;
  if (!url) return;
  await axios.post(url, { event: 'interested_email', email }).catch(e => console.error('webhook send error', e));
}
