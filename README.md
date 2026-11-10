This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Payments (Paystack)

Online payments use [Paystack](https://paystack.com) with a redirect checkout
flow and a signed webhook backstop. The flow supports full payment, 50% deposit
plus instalments, and balance payments. Institutional quotes are invoiced by
purchase order and never go through Paystack.

### 1. Environment variables

Add these to `.env.local` (development) and to your production host
(`.env.production` is only read during a production build):

| Variable | Required | Description |
| --- | --- | --- |
| `PAYSTACK_SECRET_KEY` | Yes | Paystack secret key (`sk_test_...` locally, `sk_live_...` in production). Server-only — never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Explicit public base URL used for Paystack callbacks, email links and the auth base URL. Set it to the production domain **for the Production environment only** so preview deployments fall back to their own Vercel URL. |
| `NEXT_PUBLIC_BASE_URL` | Production | Canonical site URL used by `sitemap.xml`, `robots.txt` and metadata. Set it to the same origin as `NEXT_PUBLIC_APP_URL` (`https://www.tweaks.co.za`) so SEO URLs do not point at the apex→www redirect. |

If either variable is not set, `src/lib/app-url.ts` resolves the base URL
automatically:

1. `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_BASE_URL` (explicit override)
2. Preview: `VERCEL_URL` (the deployment URL), then `VERCEL_BRANCH_URL`
3. Production: `VERCEL_PROJECT_PRODUCTION_URL`, then `https://www.tweaks.co.za`
4. Local: `http://localhost:3000`

Vercel provides these variables automatically, so preview deployments work
without any extra configuration. In Vercel, scope `NEXT_PUBLIC_APP_URL` and
`NEXT_PUBLIC_BASE_URL` to **Production** only (leave Preview empty) so previews
use their own deployment URL.

Get the key from **Paystack Dashboard → Settings → API Keys & Webhooks**.
The same secret key signs webhook payloads; Paystack has no separate webhook
secret.

> **No public key is required.** This integration uses Paystack's redirect
> checkout: the server calls `/transaction/initialize` with the secret key and
> redirects the browser to the returned `authorization_url`. A
> `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` would only be needed if you switched to the
> Inline/Popup checkout, where the browser calls Paystack directly.

> If `PAYSTACK_SECRET_KEY` is missing in development, the app falls back to a
> simulated checkout so you can test the flow offline. Simulation is disabled
> in production — payments will refuse to initialize until the key is set.

### 2. Configure the webhook

In **Paystack Dashboard → Settings → API Keys & Webhooks → Webhook URL**, set:

```text
https://<your-domain>/api/paystack/webhook
```

Production: `https://www.tweaks.co.za/api/paystack/webhook`

The endpoint verifies the `x-paystack-signature` HMAC-SHA512 header against the
raw request body, then handles:

| Event | Action |
| --- | --- |
| `charge.success` | Re-verifies the transaction with Paystack, checks amount/currency, and settles the payment + quote balance. |
| `charge.failed` | Marks the pending payment as failed. |
| `refund.processed` | Marks the payment refunded and recalculates the outstanding balance. |

All other events are acknowledged with `200` so Paystack stops retrying them.
Transient verification failures return `500` so Paystack retries automatically.

### 3. Local development with webhooks

Paystack cannot reach `localhost`, so expose your dev server with a tunnel:

```bash
npx ngrok http 3000
# then set the webhook URL to https://<ngrok-id>.ngrok-free.app/api/paystack/webhook
```

Use Paystack **test mode** keys and test cards from the Paystack dashboard. The
browser callback (`/quote/<token>?reference=...`) verifies the payment even if
the webhook has not arrived yet; both paths are idempotent.

### 4. Payment flow

1. Client opens `/quote/<token>` and chooses a payment option.
2. `POST /api/paystack/initialize` validates the quote, creates a `pending`
   payment row, and returns Paystack's authorization URL.
3. The client is redirected to Paystack and pays in ZAR.
4. Paystack redirects back to the quote page and calls the webhook.
5. `/api/paystack/verify` (browser) and `/api/paystack/webhook` (server) both
   verify the transaction with Paystack, then mark it `success`, record fees and
   channel, and recalculate `paidToDateCents` / `balanceCents` / instalment
   dates. Work is released automatically when the balance reaches zero (or a PO
   is logged for institutional quotes).

### 5. Going live checklist

- [ ] Replace `PAYSTACK_SECRET_KEY` with the live key on the production host.
- [ ] Set the production webhook URL to `https://www.tweaks.co.za/api/paystack/webhook`.
- [ ] Confirm `NEXT_PUBLIC_APP_URL` matches the production domain.
- [ ] Make one small live transaction, then refund it, and confirm both the
      payment and the refund appear in the CRM payments ledger.
- [ ] Keep `local.db` / test data out of production.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
