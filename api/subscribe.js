import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, tasks, reminderTime } = req.body;

  if (!email || !tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  await redis.hset(`user:${email}`, {
    email,
    tasks: JSON.stringify(tasks),
    reminderTime: reminderTime || '09:00',
    lastReminderSent: '',
    updatedAt: new Date().toISOString(),
  });

  await redis.sadd('subscribers', email);

  res.status(200).json({ ok: true });
}
