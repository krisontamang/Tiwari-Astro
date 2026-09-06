# Astro Tiwari (तपाईंको भविष्य, तपाईंको रोजाइमा)

A modern, responsive Vedic Astrology consultation web application built with React 19, Tailwind CSS, and Devanagari typography.

## 🚀 Live & Local Status

- **Public Site**: [http://localhost:3000](http://localhost:3000)
- **Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔐 Admin Portal Credentials

- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Email**: `bensartiwari@gmail.com`
- **Password**: `Astro@369`

### Admin Features:
1. **Payment Verification**:
   - Inspect customer eSewa payment screenshots in high-resolution lightbox.
   - 1-click **Verify Payment** (`प्रमाणित गर्नुहोस्`) button.
   - Rejection and note-taking options.
2. **Customer & Kundali Management**:
   - View customer birth details (Date of birth in BS & AD, birth time with AM/PM & Nepali period, birth place).
   - View uploaded Kundali photos.
   - Filter by status: *All*, *Pending Verification*, *Verified*, *Rejected*.
   - Direct 1-click WhatsApp customer message with pre-filled confirmation text.
3. **Financial KPIs**:
   - Total requests, pending queue, verified clients count, and total confirmed NPR revenue.

---

## 🛠️ How to Run

### Start the Server:
```bash
npm start
# or
node server.js
```

### Custom Port:
```bash
$env:PORT="8080"; node server.js
```

---

## 📁 Project Structure

```
├── index.html            # Main HTML entry mounting React application & submission bridge
├── server.js              # Node.js HTTP server + static serving + Admin & tRPC APIs
├── package.json           # Project metadata and run scripts
├── admin/
│   └── index.html         # Complete Admin Dashboard with login & payment verification
├── data/
│   └── submissions.json   # Persistent database of customer consultation requests
├── uploads/               # Customer uploaded payment screenshots & Kundali photos
├── assets/
│   ├── index-ChgpL9kq.js  # React frontend application bundle
│   ├── index-DpdlmGVI.css # Stylesheet with Tailwind & typography
│   └── eSewa_QR.jpg       # eSewa QR payment code
└── manus-storage/         # Static storage for QR codes & media
```
