import express from 'express';
import { Client as EsClient } from '@elastic/elasticsearch';
const router = express.Router();
const es = new EsClient({ node: process.env.ES_NODE || 'http://localhost:9200' });
router.get('/', async (req, res) => {
  try {
    const q = req.query.q as string || '';
    const accountId = req.query.accountId as string | undefined;
    const folder = req.query.folder as string | undefined;
    const must:any[] = [];
    if (q) must.push({ multi_match: { query: q, fields: ['subject', 'text'] }});
    if (accountId) must.push({ term: { accountId }});
    if (folder) must.push({ term: { folder }});
    const body = must.length ? { bool: { must }} : { match_all: {} };
    const resp = await es.search({ index: 'emails', query: body, size: 50 });
    res.json(resp.hits.hits.map(h => h._source));
  } catch (e) { console.error(e); res.status(500).json({error:'search error'}); }
});
export { router as searchHandler };
