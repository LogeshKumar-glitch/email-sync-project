import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
export async function upsertVector(id: string, text: string, meta = {}) {
  try {
    const emb = await client.embeddings.create({ model: 'text-embedding-3-large', input: text });
    const vector = emb.data[0].embedding;
    await axios.put(`${QDRANT_URL}/collections/emails/points`, { points: [{ id, vector, payload: { text, ...meta } }] });
  } catch (e) { console.error('upsertVector error', e); }
}
export async function suggestReply(emailText: string) {
  try {
    const emb = await client.embeddings.create({ model: 'text-embedding-3-large', input: emailText });
    const qvec = emb.data[0].embedding;
    const search = await axios.post(`${QDRANT_URL}/collections/context/points/search`, { vector: qvec, top: 3, include: ['payload'] });
    const contexts = (search.data.result || []).map((r: any) => r.payload.text).join('\n\n---\n\n');
    const prompt = `Using the context below, write a short polite reply. If the lead is interested, include meeting booking link: https://cal.com/example\nContext:\n${contexts}\nIncoming email:\n${emailText}\nReply:`;
    const gen = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });
    return gen.choices?.[0]?.message?.content?.trim();
  } catch (e) {
    console.error('suggestReply error', e);
    return 'Thank you for your message. I will get back to you soon.';
  }
}
