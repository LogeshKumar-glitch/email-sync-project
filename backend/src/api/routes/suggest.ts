import express from 'express';
import { suggestReply } from '../../ai/rag';
const router = express.Router();
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const suggestion = await suggestReply(text);
  res.json({ suggestion });
});
export { router as suggestHandler };
