# NoteNest — MVP Slice (Browse → Preview → Buy)

This is a working, end-to-end vertical slice of the NoteNest MERN app:
a student can **browse notes, preview a locked/watermarked sample PDF,
pay via Stripe, and download the full file** once payment is confirmed.
A seller can upload a note (cover image + PDF) that becomes browsable.

It's intentionally scoped down from the full spec (no admin panel, no
reviews/wishlist, no seller earnings dashboard yet) so the core purchase
flow is solid and easy to extend, rather than a wide, shallow shell.

## Architecture

```
notenest/
├── backend/     Node + Express + MongoDB (Mongoose) API
└── frontend/    React (Vite) + Tailwind CSS
```

### Backend — how the "preview before buy" flow actually works
1. Seller uploads a full PDF + cover image (`POST /api/notes`, multipart).
2. The **full PDF** is uploaded to Cloudinary as `type: authenticated`
   (raw resource) — it is never publicly reachable.
3. The server uses `pdf-lib` to copy only the first N pages
   (`PREVIEW_PAGE_COUNT`, default 4) into a new, watermarked PDF, and
   uploads *that* publicly — this is what `PDFPreviewer` renders on the
   frontend before purchase.
4. Buying creates a `pending` `Order` and a Stripe Checkout Session.
5. Stripe's webhook (`POST /api/orders/webhook`, raw body + signature
   verified) marks the order `paid`, adds the note to the buyer's
   `purchasedNotes`, and increments the note's `salesCount`.
6. `GET /api/orders/download/:noteId` checks the buyer actually owns
   the note, then returns a **5-minute signed Cloudinary URL** for the
   real file — so link-sharing after the page closes doesn't leak it.

### Data models
- `User` — bcrypt-hashed password, `role` (student/seller/admin), `purchasedNotes[]`
- `Note` — metadata, `coverImageUrl`, `previewFileUrl` (public), `fullFileKey` (private, only ever used server-side to mint signed URLs)
- `Order` — buyer, note, amount, Stripe session/payment intent, status

### Security measures already in place
- JWT auth + role-based route guards (`protect`, `authorize`)
- bcrypt password hashing (12 salt rounds)
- `helmet`, `cors` (locked to `CLIENT_URL`), `express-mongo-sanitize`
- Rate limiting on `/api/auth/*` (20 req / 15 min)
- File-type validation on upload (PDF-only, image-only fields), 25MB cap
- Full PDFs are never served directly — only signed, time-limited URLs after ownership is verified
- Stripe webhook signature verification (raw body, not JSON-parsed)

## Setup

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- A free Cloudinary account (cover images + PDF storage)
- A Stripe account (test mode is fine)

### 1. Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, STRIPE_*
npm install
npm run dev               # http://localhost:5000
```

To test the webhook locally, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/orders/webhook
```
Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET` in `.env`.

### 2. Frontend
```bash
cd frontend
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

### 3. Try the flow
1. Register a **seller** account. You'll see **Seller Dashboard** and
   **Upload Note** in the nav — use the upload form (cover image + PDF,
   price, category, tags) to publish a note through the UI.
2. Register a **student** account, browse to the note on the home page,
   view the watermarked preview, click **Buy Now**.
3. Complete checkout with a Stripe test card (`4242 4242 4242 4242`,
   any future expiry/CVC).
4. Land on the success page, go to **My Purchases**, and download the
   real file via the signed URL.
5. Back on the seller account, **Seller Dashboard** shows sales count,
   estimated earnings, and a delete action per note.

## What's deliberately not built yet
- Editing an existing note (delete + re-upload works today)
- Admin panel (approve/reject notes, manage users/orders)
- Wishlist, ratings/reviews, recommendations
- Email notifications
- Dark/light mode toggle (Tailwind `darkMode: 'class'` is wired, no switch yet)

These all slot into the existing models/routes cleanly — happy to build
out any of them next.
