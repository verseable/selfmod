# Moderator Application

A clean, dark-themed moderator application form for a Discord community.
When someone submits, their answers are posted straight into a private staff
channel through a Discord webhook. No database, no login, no monthly cost.

Built with Next.js (App Router). Deploys on Vercel's free tier.

---

## 1. Get your Discord webhook URL

1. In Discord, open **Server Settings → Integrations → Webhooks**.
2. Click **New Webhook**, name it (e.g. "Applications"), and pick the private
   staff channel you want submissions to land in.
3. Click **Copy Webhook URL**. Keep it secret — anyone with this URL can post
   to that channel.

## 2. Customize your form

Open `app/questions.js` and edit:

- `SERVER_NAME` — your community's name (shows in the title, header, and the
  Discord message).
- `EXPECTATIONS` — the bullet points in the "Before you apply" notice at the
  top of the form.
- The `SECTIONS` array — add, remove, or reword any question. Each field needs
  a unique `name`. Set `required: true` to make it mandatory. A field's `type`
  can be `"text"`, `"textarea"`, or `"checkbox"` — the requirements (Level 3+,
  fewer than 2 warns, over 14, 2FA) are checkboxes the applicant must tick to
  submit, and each ticked box is recorded in the Discord message.

That's the only file you need to touch to make it yours.

## 3. Deploy on Vercel

1. Push this folder to a new **GitHub** repository.
2. Go to [vercel.com](https://vercel.com), click **Add New → Project**, and
   import that repository.
3. Before deploying, open **Environment Variables** and add:
   - **Name:** `DISCORD_WEBHOOK_URL`
   - **Value:** the webhook URL you copied in step 1
4. Click **Deploy**. In about a minute you'll get a live URL you can share.

To change the webhook later, update that same variable in
**Vercel → Project → Settings → Environment Variables**, then redeploy.

## Run it locally (optional)

```bash
npm install
cp .env.example .env.local   # then paste your webhook URL into .env.local
npm run dev
```

Open http://localhost:3000.

---

## Notes

- **Keep the webhook secret.** It lives only on the server as an environment
  variable and is never exposed to the browser. Don't commit `.env.local`.
- **Spam protection.** The form includes a hidden honeypot field that silently
  drops most bots. If you get flooded by real people, the simplest next step is
  adding rate limiting (e.g. Upstash Ratelimit) in `app/api/apply/route.js`.
- **Answer length.** Each answer is capped so it fits Discord's message limits.
  If you need full, searchable history and a review dashboard instead of
  channel posts, that's the point where a database is worth adding.
