import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const config = { maxDuration: 30 };

export default async function handler(req) {
  // Protect the cron endpoint - only allow scheduled calls
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { method } = req;
  if (method !== 'GET' && method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subscribers = await redis.smembers('subscribers');
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let sent = 0;
  let skipped = 0;

  for (const email of subscribers) {
    const userData = await redis.hgetall(`user:${email}`);
    if (!userData || userData.tasks === undefined) continue;

    // Skip if already sent today
    const lastSent = userData.lastReminderSent || '';
    if (lastSent.slice(0, 10) === todayStr) {
      skipped++;
      continue;
    }

    const tasks = JSON.parse(userData.tasks);
    const overdue = tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      const due = new Date(task.dueDate);
      // Overdue if due date is yesterday or before
      return due <= yesterday;
    });

    if (overdue.length === 0) continue;

    // Format email HTML
    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1f2937; margin-bottom: 4px;">You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">Here's what needs your attention:</p>
        <div style="border: 2px solid #fecaca; border-radius: 12px; padding: 16px; background: #fef2f2;">
          ${overdue.map((task) => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #fee2e2;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; flex-shrink: 0;"></span>
              <div>
                <strong style="color: #1f2937;">${task.title}</strong>
                ${task.description ? `<p style="color: #6b7280; margin: 2px 0 0; font-size: 13px;">${task.description}</p>` : ''}
                <p style="color: #dc2626; font-size: 12px; font-weight: 500; margin: 2px 0 0;">Due: ${new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">TaskFlow &mdash; Simple, Fast Task Manager</p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: 'TaskFlow <reminders@resend.dev>',
        to: [email],
        subject: `You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} — TaskFlow`,
        html,
      });

      // Mark as sent today
      await redis.hset(`user:${email}`, { lastReminderSent: today.toISOString() });
      sent++;
    } catch (error) {
      console.error(`Failed to send reminder to ${email}:`, error.message);
    }
  }

  return new Response(JSON.stringify({ sent, skipped, total: subscribers.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
