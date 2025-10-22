## CSE 340 — CSE Motors

A Node.js + Express + EJS app with PostgreSQL that delivers inventory by classification and a dynamic vehicle detail view. Includes centralized error handling and an intentional 500 test route.

### Prerequisites

- Node.js LTS
- PostgreSQL running locally or a connection string for your DB
- Git

### Setup

1. Clone and install

```bash
git clone <your-repo-url>
cd <your-folder>
npm install
```

1. Environment

Create a .env file at the project root:

```
DATABASE_URL=postgres://user:[password@localhost:5432](mailto:password@localhost:5432)/cse340
PORT=3000
NODE_ENV=development
```

1. Database
- Ensure the inventory table exists with columns:
    
    inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color, inv_description, inv_image, inv_thumbnail, classification_id
    
- Seed data as needed.

### Run

- Development (with nodemon)

```bash
npm run dev
```

- Production

```bash
npm start
```

- Server entry point: server.js
- App entry (Express app): app.js

### Project Structure

- app.js — Express app, routes, static, global error handler
- server.js — HTTP server bootstrap
- controllers/
    - inventoryController.js — builds vehicle detail view
    - siteController.js — home and intentional 500 route
- models/
    - inventory-model.js — getVehicleById (parameterized)
- routes/
    - inventoryRoute.js — /inv/detail/:inv_id
    - siteRoute.js — /, /cause-error
    - static.js — static asset serving (optional if app.js already serves /public)
- utilities/
    - index.js — formatUSD, formatMiles, buildVehicleDetailHTML, asyncHandler
- views/
    - inventory/detail.ejs — single dynamic detail template
    - errors/error.ejs — used by centralized error handler
    - index.ejs — home
    - partials/head.ejs — includes /css/styles.css
    - partials/header.ejs, partials/nav.ejs, partials/footer.ejs
- public/
    - css/styles.css — responsive, accessible layout
    - js/script.js — minimal enhancements
    - images/ — site and vehicle images

### Key Routes

- Classification (example)
    - GET /inv/type/:slug — e.g., sedan, suv, truck
- Detail
    - GET /inv/detail/:inv_id — dynamic, single view renders any vehicle
- Error test (Task 3)
    - GET /cause-error — intentional 500 caught by middleware
- Health (optional)
    - GET /healthz — returns OK

### MVC Flow for Detail View

1. Route: /inv/detail/:inv_id
2. Controller: inventoryController.buildVehicleDetail
3. Model: inventory-model.getVehicleById(invId) — parameterized query
4. Utility: buildVehicleDetailHTML(vehicle) — formats USD and miles, returns HTML
5. View: views/inventory/detail.ejs renders the utility HTML

### Error Handling

- 404 middleware forwards to global handler
- Centralized error handler renders views/errors/error.ejs for all errors
- Only show stack traces in development

### Frontend Checklist (highlights)

- Title and H1 show Make + Model + Year
- Uses full-size image (not thumbnail)
- Price shown in USD with currency and commas
- Mileage has commas
- Responsive: image and details side-by-side on large screens, stacked on small
- Accessible: alt text, proper headings, focus styles, no horizontal scrolling

### Testing

1. Local
- Visit a classification page, click multiple vehicles → /inv/detail/:inv_id
- Resize to confirm responsive behavior
- Visit a fake route → 404 error view
- Click “Test 500 Error” in footer → 500 error view
- Validate HTML/CSS and run WAVE
1. Production
- Push to GitHub
- Deploy on Render
- Re-run the tests on production
- Fix any env or path issues if they appear

### Deployment (Render)

- Connect GitHub repo
- Set environment variables (DATABASE_URL, PORT, NODE_ENV)
- Build command: npm install
- Start command: npm start
- After deploy, verify routes as in Testing

### Scripts

- npm run dev — nodemon server.js
- npm start — node server.js

### Notes

- Keep /css/styles.css linked in views/partials/head.ejs
- Ensure DB pool export path in models/inventory-model.js matches your project
- Nav links in views/partials/nav.ejs point to /inv/type/:slug
- Classification cards should link to /inv/detail/<%= item.inv_id %>