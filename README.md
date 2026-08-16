# E-Invitation Platform

A digital wedding invitation and RSVP platform built with Next.js App Router, Tailwind CSS, Prisma, and MySQL.

## Features

- 💍 Beautiful, responsive invitation pages
- 🌐 Bilingual support (Khmer & English) using `next-intl`
- 🌓 Dark / Light mode support using `next-themes`
- 📱 Mobile-first PWA ready
- 📊 Admin dashboard to manage events and RSVPs
- 🔒 Secure JWT-based authentication
- 🗄️ MySQL Database with Prisma ORM

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   Create a `.env` file with the following content:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/my_wedding_db"
   JWT_SECRET="your-super-secret-key-123"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. Run Prisma Migrations & Seed:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Admin Login:
   - Email: `admin@mywedding.com`
   - Password: `admin123`

## Hostinger Cloud / Node.js Deployment Guide

Hostinger Node.js hosting uses Passenger/PM2 depending on the setup. For a Next.js App Router project:

1. **Build the Application Locally:**
   Next.js needs to build the production output.
   ```bash
   npm run build
   ```

## Adding Background Music, Hero Videos, and Uploads

The platform supports both direct uploads from your computer and external URLs as fallbacks.

1. **Direct Media Uploads:**
   - On the Event Form, you can upload files directly (Images, Videos, and Audio).
   - **Supported extensions:**
     - Images (`.jpg`, `.jpeg`, `.png`, `.webp`, max 5MB)
     - Audio (`.mp3`, `.wav`, `.m4a`, `.ogg`, max 15MB)
     - Videos (`.mp4`, `.webm`, max 100MB)
   - Uploaded files are securely processed on the server and saved locally in:
     - `public/uploads/images/`
     - `public/uploads/videos/`
     - `public/uploads/audio/`
   - Path strings (e.g. `/uploads/images/file.jpg`) are saved to the MySQL database.
   
2. **Gallery Images:**
   - In the "Gallery Images" section, click "Upload Image" to upload multiple photos.
   - You can drag-and-drop or select files from your computer. Hover over any thumbnail and click the close button to delete it.

3. **Background Music:**
   - Under the "Media Settings" section, enter or upload an `.mp3` audio file.
   - You can also optionally provide a title. 
   - A floating "Tap to Play Music" control button will automatically appear at the bottom right of your public invitation.
   - *Note:* Autoplaying sound is strictly blocked by modern browsers, which is why users must tap to begin playing the background audio.

4. **Hero Video:**
   - Under the "Media Settings" section, toggle "Show Hero Video".
   - Select either "MP4 Video" or "YouTube Embed".
   - Enter or upload a valid `.mp4` video. For YouTube, paste the standard watch link.
   - This cinematic video will render directly at the top of your public invitation page (playing silently).

5. **Invitation Opening Screen:**
   - Go to the **Event Management Dashboard**.
   - Under "Opening Screen Settings", toggle "Show Opening Screen".
   - Specify a custom title and message (supporting Khmer/English translations), and upload a custom opening image.
   - When guests visit, they will first see a beautiful full-screen overlay and must click "Open Invitation" to enter, which smoothly triggers the slide-up animation and plays background music.

## Hostinger Deployment & Backups

> [!WARNING]
> Since uploaded files are stored locally in the `public/uploads/` directory on the server, please note:
> 1. **Backups:** Ensure you regularly back up the `public/uploads/` directory when performing database backups.
> 2. **Redeployments:** When pushing updates or redeploying the application, make sure not to overwrite or delete the existing `public/uploads/` directory on Hostinger, as this will remove your uploaded media!
> 3. **Scalability:** For large-scale production sites, it is recommended to move storage to an external provider (like AWS S3, Cloudinary, or Supabase Storage) by replacing the handlers in `lib/upload.ts`.

## PWA and Service Workers

2. **Upload Files to Hostinger:**
   Zip the following files and folders and upload them to your Hostinger `public_html` (or Node.js root) via File Manager or FTP:
   - `.next/` (Make sure to include this hidden folder)
   - `public/`
   - `prisma/`
   - `package.json`
   - `package-lock.json`
   - `.env` (Update with your Hostinger MySQL credentials)
   - `next.config.mjs`

3. **Install Production Dependencies:**
   Connect to your Hostinger account via SSH (Terminal), navigate to your app directory, and run:
   ```bash
   npm install --production
   ```
   Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

4. **Start the Application:**
   Next.js apps run on a custom server. You can run it using Hostinger's Node.js App startup command. Set your startup file/command to:
   ```bash
   npm start
   ```
   Or if using `server.js` (custom server mode):
   Create a `server.js` file at the root:
   ```javascript
   const { createServer } = require('http')
   const { parse } = require('url')
   const next = require('next')

   const dev = process.env.NODE_ENV !== 'production'
   const hostname = 'localhost'
   const port = process.env.PORT || 3000
   const app = next({ dev, hostname, port })
   const handle = app.getRequestHandler()

   app.prepare().then(() => {
     createServer(async (req, res) => {
       try {
         const parsedUrl = parse(req.url, true)
         await handle(req, res, parsedUrl)
       } catch (err) {
         console.error('Error occurred handling', req.url, err)
         res.statusCode = 500
         res.end('internal server error')
       }
     }).listen(port, (err) => {
       if (err) throw err
       console.log(`> Ready on http://${hostname}:${port}`)
     })
   })
   ```
   Then point Hostinger's Node.js startup to `server.js`.

5. **Run Migrations on Production:**
   In your Hostinger SSH terminal:
   ```bash
   npx prisma db push
   ```

Your Next.js E-Invitation app should now be live and running!
