# MyWedding - E-Invitation PWA & Web App

## Social Link Preview & Open Graph Testing Guide

The application supports dynamic Open Graph (OG) metadata and social sharing cards for all wedding invitation links:
- General Invitation: `/invite/[slug]`
- Guest-Specific Invitation: `/invite/[slug]/guest/[guestId]`

---

### 1. Environment Configuration

To ensure social sharing cards show full preview images and accurate links, set `NEXT_PUBLIC_APP_URL` in your `.env` file to your production domain:

```env
NEXT_PUBLIC_APP_URL=https://leangna.online
```

> **Note on Localhost Testing:**
> Social media crawlers (Facebook, Messenger, Telegram, WhatsApp, Instagram DMs) cannot reach `http://localhost:3000`. Test link previews on your live public domain (`https://leangna.online`) or via a tunnel:
> ```bash
> ngrok http 3000
> ```

---

### 2. How to Test & Force Refresh Chat App Previews

Chat apps heavily cache link previews. When testing new images or text, follow these steps to force refresh:

#### A. Cache-Busting Version Query Parameter
When testing a link in Telegram, Messenger, or Instagram DMs, append a new version query parameter such as `?v=11` or `?v=12`:
`https://leangna.online/invite/sample-wedding/guest/cmt6scpig0001qz3n673q1b1b?v=11`
This forces chat app crawlers to fetch the latest server-rendered metadata immediately.

#### B. Telegram Chat Preview & WebpageBot
1. Open Telegram.
2. Search for `@WebpageBot`.
3. Send your link to `@WebpageBot` and click **Update preview** to clear Telegram's cached metadata.
4. Paste the link into any chat window; the Opening Image thumbnail and guest invitation header will appear.

#### C. Facebook Messenger & Meta Debugger
1. Open [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/).
2. Paste your guest invitation link.
3. Click **Debug** -> **Scrape Again** to invalidate Meta/Messenger cache.
4. Share the link on Messenger or Facebook DMs.

#### D. Instagram DMs & WhatsApp
1. Paste the link into an Instagram DM or WhatsApp chat.
2. Wait 1–3 seconds for the link preview thumbnail and personalized invitation text to fetch before pressing send.

---

### 3. Privacy Setting: Show / Hide Guest Name in Social Preview

In the Admin Dashboard (**Manage Events -> Edit Event**):
- **Toggle On:** Shows `សូមគោរពអញ្ជើញ [Guest Name]` in the social preview when sharing individual guest links.
- **Toggle Off:** Hides guest names and defaults to general wedding invitation titles.
