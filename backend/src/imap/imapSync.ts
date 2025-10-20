// Placeholder IMAP sync module using imapflow.
// Configure accounts via IMAP_ACCOUNTS_JSON env (JSON array).
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import { processEmail } from '../processors/indexer';
dotenv.config();
const ACCOUNTS_JSON = process.env.IMAP_ACCOUNTS_JSON || '[]';
const ACCOUNTS = JSON.parse(ACCOUNTS_JSON);
export async function startImap() {
  for (const acc of ACCOUNTS) {
    (async () => {
      try {
        const client = new ImapFlow({
          host: acc.host,
          port: acc.port,
          secure: acc.secure,
          auth: acc.auth
        });
        await client.connect();
        console.log('[IMAP] connected', acc.id);
        // fetch last 30 days once
        const since = new Date();
        since.setDate(since.getDate() - 30);
        for await (const message of client.fetch({ since }, { source: true, uid: true })) {
          const parsed = await simpleParser(message.source);
          await processEmail({
            accountId: acc.id,
            folder: 'INBOX',
            uid: message.uid,
            from: parsed.from?.text ?? '',
            to: parsed.to?.text ?? '',
            subject: parsed.subject ?? '',
            date: parsed.date ?? new Date(),
            text: parsed.text ?? ''
          });
        }
        // listen for new messages (simplified)
        client.on('exists', async (seq) => {
          try {
            const m = await client.fetchOne(seq, { source: true, uid: true });
            const parsed = await simpleParser(m.source);
            await processEmail({
              accountId: acc.id,
              folder: 'INBOX',
              uid: m.uid,
              from: parsed.from?.text ?? '',
              to: parsed.to?.text ?? '',
              subject: parsed.subject ?? '',
              date: parsed.date ?? new Date(),
              text: parsed.text ?? ''
            });
          } catch (e) { console.error('IMAP exists handler error', e); }
        });
      } catch (e) {
        console.error('IMAP client init error', e);
      }
    })();
  }
}
