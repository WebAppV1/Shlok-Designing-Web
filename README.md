# Shlok Designing — Digital Order & Production Management System

A prototype multi-page website built for the **Societal Internship (BE05000011)**
at Shantilal Shah Government Engineering College, Bhavnagar, in partnership
with **Shlok Designing**, a jacquard saree design and weaving unit in Surat,
Gujarat.

## Team

| Name | Role |
|---|---|
| Harsh Parmar | Team Lead, Technical Development |
| Mitesh Vegad | Technical Development |
| Jay Kakadiya | Field Research & Stakeholder Communication |
| Naitik Dodiya | Field Research & Documentation |

## Company

- **Trade Name:** Shlok Designing
- **Proprietor:** Hardik Dhirubhai Dhameliya
- **GSTIN:** 24BAJPD2932G1Z3
- **Address:** Plot No.1, Hari Om Industrial Arena V-B, Parab Gam, Nr. Om Industrial, Parab, Surat, Gujarat, 394310
- **Machinery:** Triple Pana Rapier Jacquard Machine
- **Product:** Brocade & tissue-zari sarees

## What this project includes (4 services)

1. **Design Catalog & Custom Order Studio** (`catalog.html`) — browse active
   designs and submit a custom design request.
2. **Production Tracking** (`track-order.html`) — public batch lookup
   showing live progress across 6 real production stages.
3. **Dealer & Wholesaler Portal** (`dealer/`) — dealer login, live stock
   view, bulk order placement, order history.
4. **Admin Dashboard** (`admin/`) — role-secured panel with production
   stage management, dealer order management, inventory with low-stock
   alerts, and a simple analytics chart, plus review of incoming custom
   requests.

Plus a full **About Us** page with the company's registered details and
process explanation, and a responsive **Home** page tying it all together.

## Tech

Plain HTML / CSS / JavaScript — no build step required. Data is persisted
to the browser's `localStorage` (acting as a mock backend/database for the
prototype) so the Admin Dashboard, Dealer Portal, and Catalog all read and
write the same data set.

```
shlok-designing-website/
├── index.html              Home
├── about.html               About Us
├── catalog.html              Service 1 — Catalog + Custom Orders
├── track-order.html           Service 2 — Production Tracking (public)
├── dealer/
│   ├── login.html            Service 3 — Dealer login
│   └── dashboard.html          Dealer stock, orders, history
├── admin/
│   ├── login.html             Service 4 — Admin login
│   └── dashboard.html          Production / Orders / Inventory / Analytics
├── css/style.css              Shared design system
├── js/
│   ├── data.js                 Mock data layer (localStorage)
│   ├── main.js                  Shared nav + toast helpers
│   ├── catalog.js
│   ├── track.js
│   ├── dealer.js
│   └── admin.js
└── assets/img/                  Real photos from the unit (thread stock,
                                   saree samples, jacquard machine)
```

## Running it

No server or build step is required — open `index.html` directly in a
browser, or serve the folder locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Demo logins

**Dealer Portal** (`dealer/login.html`)
- Phone: `9825000001`
- Password: `meera123`

**Admin Dashboard** (`admin/login.html`)
- Username: `admin`
- Password: `shlok@2026`

## Security notes (prototype scope)

This is a client-side demo built for an academic presentation — it
persists data in `localStorage` and uses simple client-side credential
checks, so it is **not** production-secure. For a real deployment:
- Move authentication and data storage to a server with hashed passwords
- Serve over HTTPS
- Add server-side input validation and role-based access control
- Add rate limiting on login endpoints
