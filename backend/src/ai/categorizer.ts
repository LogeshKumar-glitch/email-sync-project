import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const LABELS = ['Interested','Meeting Booked','Not Interested','Spam','Out of Office'];
export async function categorizeEmail(email: { subject: string; text: string; from?: string }) {
  try {
    const prompt = `Classify this email into one of: ${LABELS.join(', ')}.\nSubject: ${email.subject}\nBody: ${email.text}\nLabel:`;
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0
    });
    const raw = res.choices?.[0]?.message?.content?.trim() ?? '';
    const label = raw.split('\n')[0].trim();
    if (LABELS.includes(label)) return label;
  } catch (e) {
    console.error('categorizer error', e);
  }
  const t = (email.subject + ' ' + (email.text||'')).toLowerCase();
  if (t.includes('out of office') || t.includes('away')) return 'Out of Office';
  if (t.includes('unsubscribe') || t.includes('buy now')) return 'Spam';
  if (t.includes('interested') || t.includes('would like') || t.includes('call')) return 'Interested';
  return 'Not Interested';
}
