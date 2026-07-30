# DermaCare — Skin & Hair Clinic Management System (Frontend)

A complete, frontend-only React + Vite + Tailwind CSS application for managing a skin & hair clinic.
No backend, no real API calls, and no authentication logic — everything runs on mock data in
`src/data/mockData.js`.

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    layout/         Sidebar, Navbar, Layout (collapsible sidebar + top navbar shell)
    common/          Reusable UI: Card, Button, Badge, Table, Pagination, Modal, FormField, etc.
  data/
    mockData.js      All mock data for patients, invoices, inventory, reports, users, etc.
  pages/
    Login.jsx
    Dashboard.jsx
    Patients.jsx
    RegisterPatient.jsx
    PatientDetails.jsx
    Billing.jsx
    Payments.jsx
    Inventory.jsx
    Pharmacy.jsx
    Reports.jsx
    Settings.jsx
    NotFound.jsx
  App.jsx            Route definitions
  main.jsx           App entry point
```

## Notes

- Login performs no real authentication — submitting the form just navigates to `/dashboard`.
- All data (patients, invoices, inventory, reports) is mock data held in React state; refreshing
  the page resets any local edits (add/delete/etc.), since there is no backend or persistence.
- The sidebar collapses on desktop (chevron button at the bottom) and becomes an overlay drawer
  on mobile (hamburger icon in the top navbar).
- The Billing page's "Print Invoice" button uses the browser's native print dialog with a
  print-specific stylesheet applied via Tailwind's `print:` variants.
- Theme color is set via Tailwind's `primary` color scale in `tailwind.config.js` (`#8B5CF6`).
