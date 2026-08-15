# Password recovery pointers (no secrets)

This document is **pointers only**. It does **not** contain passwords, keys, tokens, or connection strings. Never commit credentials.

## Mac Mini / SSH / cluster logins

Look in **1Password**.

- Account email used with 1Password alerts: `kimballluke@gmail.com`
- Search the vault for: **Mac Mini**, **cluster1**, **cluster2**, **cluster3**, **SSH**, **Tailscale**

Machine shell access still requires the **Mac user password** from 1Password (Tailscale connectivity alone is not that password).

## Apple ID login codes (OTP, not the password)

Login codes for Mac mini have historically been emailed from `hello@blip.net` with subjects like **"Login code for Mac mini"**.

Those messages are **one-time codes**, not the account password. Do not store OTPs in git.

## Tailscale admin

- Admin console: https://login.tailscale.com/admin/machines
- Access is usually via **SSO** / existing Tailscale identity.
- Listing machines ≠ logging into a Mac. For SSH/local login, use the Mac user password from 1Password.

## Cloudflare / tunnel token

- Manage tunnels and Zero Trust in the **Cloudflare dashboard**.
- Token / env values: **1Password** and/or the manager host `.env` under the homelab Cloudflare stack — **never commit**.
- This portfolio repo may reference audit scripts (`scripts/audit-cloudflare.sh`); they do not embed the token.

## If the password is truly lost

1. Use **Apple ID account recovery** for the Mac user identity.
2. With physical access, reset the Mac login password via **macOS Recovery** (follow Apple’s current recovery docs).
3. After recovery, **rotate Tailscale auth keys** / re-approve devices as needed, and update 1Password.

## Related

- Cluster / edge context: [`STALE-AUDIT-2026-08-15.md`](./STALE-AUDIT-2026-08-15.md)
