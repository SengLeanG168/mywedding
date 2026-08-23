# MyWedding - E-Invitation PWA & Web App

## Social Link Preview & Open Graph Testing Guide

The application supports dynamic Open Graph (OG) metadata and social sharing cards for all wedding invitation links:
- General Invitation: `/invite/[slug]`
- Guest-Specific Invitation: `/invite/[slug]/guest/[guestId]`

---

### 1. Environment Configuration

To ensure social sharing cards show full preview images and accurate links, set `NEXT_PUBLIC_APP_URL` in your `.env` file to your production domain:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

> **Note on Localhost Testing:**
> Social media crawlers (Facebook, Telegram, WhatsApp, Messenger) cannot reach `http://localhost:3000`. To test link previews locally before deploying to production, use a tunneling tool such as [ngrok](https://ngrok.com/):
> ```bash
> ngrok http 3000
> ```
> Then set `NEXT_PUBLIC_APP_URL=https://xxxx.ngrok-free.app` in `.env`.

---

### 2. How to Test Link Previews

#### A. Facebook Sharing Debugger
1. Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
2. Paste your invitation link: `https://yourdomain.com/km/invite/your-slug/guest/guestId`.
3. Click **Debug**.
4. If cached data appears, click **Scrape Again** to clear Facebook's cache and pull fresh metadata and OG images.

#### B. Telegram Chat Preview
1. Open Telegram desktop or mobile app.
2. Open **Saved Messages** or a private chat.
3. Paste the invitation link.
4. Telegram will automatically crawl the link and render the dynamic wedding title, bride & groom names, guest name, and 1200x630 OG image.
5. To clear Telegram cache if updating metadata, send the link to `@WebpageBot` on Telegram and choose **Update preview**.

#### C. WhatsApp Link Preview
1. Paste the link into any WhatsApp chat box.
2. Wait 1–3 seconds for WhatsApp to fetch the preview card before pressing send.
3. The thumbnail image, guest invitation title, and description will render in the chat bubble.

#### D. Facebook Messenger
1. Send the invitation link to a friend or test account on Messenger.
2. Messenger renders the rich card with the wedding preview image and personalized guest invitation header.

---

### 3. Privacy Setting: Show / Hide Guest Name in Social Preview

In the Admin Dashboard (**Manage Events -> Edit Event**):
- **Toggle On:** Shows `សូមគោរពអញ្ជើញ [Guest Name]` in the social preview when sharing individual guest links.
- **Toggle Off:** Hides guest names and defaults to general wedding invitation titles.
