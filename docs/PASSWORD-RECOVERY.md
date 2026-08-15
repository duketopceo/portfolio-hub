# Password recovery pointers (no secrets)

This document is **pointers only**. It does **not** contain passwords, keys, tokens, connection strings, or personal email addresses. Never commit credentials.

## Mac Mini / SSH / cluster logins

Look in **1Password**.

- Search the vault for: **Mac Mini**, **cluster1**, **cluster2**, **cluster3**, **SSH**, **Tailscale**
- The account used for service alerts is documented in the vault, not in git.

Machine shell access still requires the **Mac user password** from 1Password (Tailscale connectivity alone is not that password).

## Apple ID login codes (OTP, not the password)

Login codes for Mac Mini have historically arrived as verification messages with a subject similar to **"Login code for Mac mini"**.

Those messages are **one-time codes**, not the account password. Do not store OTPs or sender addresses in git.

## Tailscale admin

- Admin console: https://login.tailscale.com/admin/machines
- Access is usually via **SSO** / existing Tailscale identity.
- Listing machines ≠ logging into a Mac. For SSH/local login, use the Mac user password from 1Password.

## Cloudflare / tunnel token

- Manage tunnels and Zero Trust in the **Cloudflare dashboard**.
- Runtime values belong in **1Password** and/or the manager host environment file under the homelab Cloudflare stack — **never commit them**.
- This portfolio repo may reference audit scripts (`scripts/audit-cloudflare.sh`); they do not embed credentials.

## If the password is truly lost

1. Use **Apple ID account recovery** for the Mac user identity.
2. With physical access, reset the Mac login password via **macOS Recovery** (follow Apple’s current recovery docs).
3. After recovery, rotate remote-access credentials or re-approve devices as needed, and update 1Password.

## Related

- Cluster / edge context: [`STALE-AUDIT-2026-08-15.md`](./STALE-AUDIT-2026-08-15.md)
