import { Client as EsClient } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
import { categorizeEmail } from '../ai/categorizer';
import { sendSlackNotification } from '../integrations/slack';
import { triggerExternalWebhook } from '../integrations/webhook';
dotenv.config();
const es = new EsClient({ node: process.env.ES_NODE || 'http://localhost:9200' });
const INDEX = 'emails';
export async function processEmail(email: any) {
  try {
    const label = await categorizeEmail(email);
    const id = `${email.accountId}-${email.uid}`;
    await es.index({ index: INDEX, id, document: { ...email, label }, refresh: 'wait_for' });
    if (label === 'Interested') {
      await sendSlackNotification(email);
      await triggerExternalWebhook(email);
    }
    console.log('[processor] indexed', id, 'label=', label);
  } catch (e) { console.error('processEmail error', e); }
}
