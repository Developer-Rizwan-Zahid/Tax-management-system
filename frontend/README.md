# Tax Management System - Frontend

Professional Next.js frontend for the Tax Management System.

## Features

- ✅ User Authentication (Login/Register)
- ✅ Taxpayer Management (CRUD)
- ✅ Income Entries Management
- ✅ Tax Calculation
- ✅ PDF Report Generation
- ✅ Tax Slabs Management
- ✅ Role-based Access Control
- ✅ Responsive UI with Tailwind CSS

## Setup

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5100
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Docker

The frontend is included in the main `docker-compose.yml`. To run:

```bash
docker-compose up --build
```

Frontend will be available at [http://localhost:3000](http://localhost:3000)

## Pages

- `/login` - User login
- `/register` - User registration
- `/taxpayers` - Taxpayer list with CRUD operations
- `/taxpayers/[id]` - Taxpayer details with income entries and tax calculation
- `/tax-slabs` - Tax slabs management (Admin only)

## API Integration

The frontend connects to the backend API at `http://localhost:5100` by default. This can be configured via `NEXT_PUBLIC_API_URL` environment variable.

## Authentication

- JWT tokens are stored in cookies
- Protected routes automatically redirect to login if not authenticated
- Token is automatically included in API requests
