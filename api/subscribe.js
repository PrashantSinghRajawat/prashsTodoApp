import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { email, tasks, reminderTime } = await req.json();

  if (!email || !tasks || !Array.isArray(tasks)) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await redis.hset(`user:${email}`, {
    email,
    tasks: JSON.stringify(tasks),
    reminderTime: reminderTime || '09:00',
    lastReminderSent: '',
    updatedAt: new Date().toISOString(),
  });

  await redis.sadd('subscribers', email);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
