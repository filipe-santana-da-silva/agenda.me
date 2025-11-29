Keep-Alive (Supabase)
======================

This repository includes a small server endpoint to perform a lightweight, read-only ping against Supabase to help keep the project from being paused due to inactivity.

Files added:
- `app/api/supabase/keep-alive/route.ts` — Server route that performs a single, read-only `SELECT id` from the `page` table and returns `{ ok: true }` on success.
- `.github/workflows/keep-alive.yml` — Example GitHub Actions workflow that can hit a configured URL on a schedule (every 10 minutes). You must set the `KEEP_ALIVE_URL` repository secret to the public URL of the keep-alive endpoint after deployment.

How to use
----------

1. Deploy your app as usual (Vercel, Netlify, etc.). The keep-alive route will be available at:

   /api/supabase/keep-alive

   (Example full URL: `https://your-deployment.app/api/supabase/keep-alive`)

2. Choose one of the options below to call the endpoint regularly:

- GitHub Actions (recommended if you keep the repo on GitHub):
  - Add the full keep-alive URL as a repository secret named `KEEP_ALIVE_URL`.
  - The included workflow `.github/workflows/keep-alive.yml` will ping the URL every 10 minutes.

- External uptime monitors:
  - Services like UptimeRobot, cron-job.org or similar can be configured to call the endpoint every 5–15 minutes.

Notes and safety
----------------
- The route performs a read-only query and does not modify any data.
- The server-side Supabase client is used so no secret keys are committed to the repo.
- If your deployment platform provides a built-in cron or scheduler (Vercel Cron, Render Scheduled Jobs), you can use that to call the endpoint instead.

If you prefer a different read target table than `page`, edit `app/api/supabase/keep-alive/route.ts` to use a small table that exists in your schema.

Vercel-specific instructions
---------------------------

If you are deploying to Vercel (production), you have three straightforward options to keep Supabase active:

- Use Vercel Scheduled/Cron Jobs (recommended when available):
  1. Deploy your project to Vercel.
  2. In the Vercel dashboard, open your Project → Settings → Cron Jobs (or Scheduled Jobs).
  3. Create a new job that performs a `GET` request to your keep-alive URL (e.g. `https://your-site.vercel.app/api/supabase/keep-alive`).
  4. Set the interval to something like every 10 minutes.

- Use the included GitHub Actions workflow (already added to the repo):
  - Add a repository secret named `KEEP_ALIVE_URL` with the full keep-alive endpoint URL.
  - The workflow `.github/workflows/keep-alive.yml` will call that URL on the schedule defined (every 10 minutes).

- Use an external uptime monitor (UptimeRobot, cron-job.org):
  - Create an HTTP check for the keep-alive URL and set it to run every 5–15 minutes.

Notes about Vercel plans and scheduling
--------------------------------------
- Some Vercel plans expose a built-in scheduler/cron feature in the dashboard. If your plan does not show Cron Jobs, use the GitHub Actions workflow or an external uptime monitor.
- Keep the request light — the endpoint performs a single small SELECT. Do not call any admin or write endpoints from scheduled jobs.

Example curl (PowerShell) for testing:

```powershell
curl https://your-site.vercel.app/api/supabase/keep-alive
```

