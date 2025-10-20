import axios from 'axios';
export async function sendSlackNotification(email: any) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  const payload = { text: `*Interested* from ${email.from}\nSubject: ${email.subject}\n${(email.text||'').slice(0,300)}` };
  await axios.post(webhook, payload).catch(e => console.error('slack send error', e));
}
