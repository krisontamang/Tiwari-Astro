# Astro Tiwari (तपाईंको भविष्य, तपाईंको रोजाइमा)

A modern, responsive Vedic Astrology consultation web application built with React 19, Tailwind CSS, and Devanagari typography.

## 🚀 Local Deployment Status

The application is currently running locally:
- **Local URL**: [http://localhost:3000](http://localhost:3000)
- **Network URL**: [http://127.0.0.1:3000](http://127.0.0.1:3000)

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
├── index.html            # Main HTML entry mounting React application
├── server.js              # Node.js HTTP server + static file serving + mock tRPC APIs
├── package.json           # Project metadata and run scripts
├── assets/
│   ├── index-ChgpL9kq.js  # React frontend application bundle
│   ├── index-DpdlmGVI.css # Stylesheet with Tailwind & typography
│   └── eSewa_QR.jpg       # eSewa QR payment code
├── manus-storage/         # Static storage for QR codes & uploaded media
│   └── eSewa_My_QR_9809192604_1788636795054_2026-09-06_01_18_15_45f0b9e9.jpg
└── extracted_data/        # Extracted source references, text dictionaries & analysis
```

---

## ✨ Features Included

1. **Vedic Astrology Services**:
   - 01 / Clarity: जन्मकुण्डली विश्लेषण (Birth Chart Analysis)
   - 02 / Connection: विवाह मिलान (Matchmaking)
   - 03 / Timing: करियर तथा व्यवसाय (Career & Business Guidance)
2. **Pricing Packages**:
   - Basic Package (रु. २९९/-)
   - Standard Package (रु. ४९९/-)
   - VIP Premium (रु. १,०५५/-)
3. **Interactive Consultation & Booking Form**:
   - Dual Nepali Calendar picker (Bikram Sambat वि.सं. & Anno Domini ई.सं.)
   - Time of birth with Nepali time period selection (AM/PM, बिहान, दिउँसो, बेलुका, राति)
   - Birth time rectification event log
   - Kundali photo upload with auto-extract
   - eSewa QR code scan & payment screenshot upload
   - Astrologer **Boss Mode** (`*3*6*9`) with private review note panel
   - Structured WhatsApp message dispatch (`+977 9809192604`)
