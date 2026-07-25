# Supabase + Google Calendar/Meet setup

This implementation keeps every private credential on the Node.js backend. The browser only calls `/api/contact`, `/api/scheduling/availability`, and `/api/scheduling/book`.

## 1. Create the Supabase tables

1. Create or open the Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/migrations/202607240001_create_leads_appointments_reviews.sql`.
4. In **Project Settings > API**, copy the project URL and the server-side secret/service-role key.
5. Add them to the production environment as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

The migration creates:

- `leads` for contact and consultation forms.
- `appointments` for confirmed Calendar events and Meet URLs.
- `google_reviews` for the future Google Business Profile synchronization.

RLS is enabled. Anonymous and authenticated browser roles receive no direct table access. Only the backend service role can read and write these tables.

## 2. Configure Google Calendar API

1. Create a project in Google Cloud Console.
2. Enable **Google Calendar API**.
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 **Web application** client.
5. Authorize the Calendar owner once with offline access and the scope `https://www.googleapis.com/auth/calendar`.
6. Store the resulting refresh token in `GOOGLE_REFRESH_TOKEN`.
7. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALENDAR_ID` to the server environment.

The backend refreshes access tokens at runtime, checks `freeBusy`, and creates a unique `hangoutsMeet` conference for every event. Never expose these values through a variable beginning with `VITE_`.

## 3. Scheduling rules

Defaults are configured for Colombia:

- Time zone: `America/Bogota`
- UTC offset: `-05:00`
- Monday through Friday
- 09:00 to 17:00
- 30-minute consultations
- Four hours minimum notice
- Thirty days available in advance

Change the `SCHEDULING_*` environment variables if the business schedule changes. Keep `SCHEDULING_UTC_OFFSET` aligned with `GOOGLE_TIME_ZONE`.

## 4. Run locally

Copy `.env.example` to `.env`, add real secrets, then run:

```bash
npm run dev
```

Use the Vite URL printed by the command. Vite proxies `/api` to the Express backend on port 3001.

## 5. Production checks

- Confirm the hosting process runs `npm start`, not only the static `dist` folder.
- Confirm HTTPS is enabled.
- Book a test appointment with a non-owner email.
- Verify the event appears on the owner calendar.
- Verify the guest receives the Calendar invitation and unique Google Meet link.
- Verify the new rows in `leads` and `appointments`.
- Rotate any credential accidentally exposed in logs or committed files.

## Current behavior without credentials

The website and contact UI continue to load. Scheduling reports that online booking is being configured. Contact submissions can be stored when Supabase is configured even if SMTP is temporarily unavailable.
