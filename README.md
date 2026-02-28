# Kgotla Capital - SME Bond Securitization Platform

A comprehensive, regulated platform connecting Botswana's SMEs with institutional capital through innovative bond securitization. Built with HTML, CSS, JavaScript, and Supabase.

## Features (Functional Requirements Covered)

### User Management (FR-1 to FR-4)
- Multi-role registration (SME, Investor, Regulator, Admin)
- KYC identity verification (National ID, Tax ID, Business Certificates)
- Email + password authentication with MFA support
- Role-Based Access Control (RBAC)

### SME Onboarding & Assessment (FR-5 to FR-8)
- Business profile creation with financial data
- Automated financial ratio calculations (liquidity, leverage, profitability)
- Credit scoring engine with risk categorization
- Compliance status tracking with document expiry alerts

### Bond Structuring (FR-9 to FR-12)
- SME pool creation by risk level
- Senior/Mezzanine/Junior tranche structuring
- Monte Carlo risk simulation
- Bond issuance document generation

### Investor Management (FR-13 to FR-16)
- Investor onboarding with mandates
- Investment dashboard with available pools
- Subscription functionality with confirmations
- Performance monitoring with analytics

### Payments & Settlement (FR-17 to FR-20)
- Capital disbursement tracking
- Repayment monitoring with late payment detection
- Investor payout calculations
- Comprehensive audit logging

### Regulatory & Reporting (FR-21 to FR-23)
- NBFIRA & Bank of Botswana compliance reports
- Regulatory dashboard with risk indicators
- PDF and Excel export capabilities

### Administration (FR-24 to FR-26)
- User approval/suspension workflows
- System configuration for risk thresholds
- Notification engine for alerts

### Analytics (FR-27 to FR-28)
- Portfolio analytics with sector distribution
- Economic impact tracking (jobs, growth)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kgotla.co.bw | admin123 |
| SME | sme@kgotla.co.bw | sme123 |
| Investor | investor@kgotla.co.bw | inv123 |
| Regulator | regulator@kgotla.co.bw | reg123 |

## Setup

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL editor
3. Update `js/config.js` with your project URL and anon key:
```javascript
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
```

### 2. Local Development
Simply open `index.html` in a browser. The app uses localStorage for demo data - no backend required for testing.

### 3. Deploy to Vercel
```bash
npm i -g vercel
cd sme-bond-platform
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + custom MFA
- **Hosting**: Vercel (static deployment)

## Regulatory Compliance
- NBFIRA standards aligned
- Bank of Botswana oversight compatible
- BSE listing format compatible
- Botswana Data Protection Act compliant
- 7-year audit log retention
- AES-256 encryption at rest (via Supabase)
- TLS 1.2+ in transit (via Vercel)

## Project Structure
```
sme-bond-platform/
├── index.html          # Login/Registration
├── dashboard.html      # Main app shell
├── css/
│   ├── global.css      # Design system
│   ├── auth.css        # Auth page styles
│   └── dashboard.css   # Dashboard styles
├── js/
│   ├── config.js       # Supabase config + utilities
│   ├── auth.js         # Authentication logic
│   ├── store.js        # Data store + demo data
│   ├── dashboard-app.js # App shell + navigation
│   └── pages.js        # All page renderers
├── supabase-schema.sql # Database schema
├── vercel.json         # Deployment config
└── README.md
```
