# GitHub Secrets Setup for CI/CD

This document explains every secret required for the CI and Deploy pipelines to work.

---

## Required Secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Where to get it |
|---|---|---|
| `VERCEL_TOKEN` | Your Vercel personal access token | [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create Token** |
| `VERCEL_ORG_ID` | `team_mHbUYlrkZbdGlD2ytK2sYxsU` | Already set ✓ |
| `VERCEL_PROJECT_ID` | `prj_hC3J1sNt3S3hq23SC50MQMNDQMrV` | Already set ✓ |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Already set ✓ |
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis REST URL | Already set ✓ |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis token | Already set ✓ |

---

## One remaining step: VERCEL_TOKEN

1. Go to **[vercel.com/account/tokens](https://vercel.com/account/tokens)**
2. Click **Create Token**
3. Name it: `GitHub Actions CI/CD`
4. Scope: **Full Account**
5. Copy the token
6. Run:
   ```bash
   gh secret set VERCEL_TOKEN --body "your-token-here" --repo DevMLAI01/smart-dashboard
   ```
   Or paste it in the GitHub UI under Settings → Secrets → Actions.

---

## Verify All Secrets

```bash
gh secret list --repo DevMLAI01/smart-dashboard
```

Expected output (6 secrets):
```
ANTHROPIC_API_KEY
UPSTASH_REDIS_REST_TOKEN
UPSTASH_REDIS_REST_URL
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_TOKEN
```
