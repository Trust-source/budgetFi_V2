# BudgetFi Setup Guide

## Quick Start

BudgetFi is now ready to run! Follow these steps to get started.

### 1. Environment Variables

You need to add your Supabase credentials. Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project:
1. Go to Supabase Dashboard
2. Select your project
3. Click "Settings" → "API"
4. Copy the URL and anon key

### 2. Database Setup

The database schema has already been created with:
- accounts table (checking, savings, credit, investment)
- categories table (auto-seeded on first login)
- transactions table (income/expense)
- budgets table (monthly allocations)
- All tables have Row Level Security enabled

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Create Your First Account

1. Go to the landing page
2. Click "Get started"
3. Sign up with email and password
4. Check your email for verification link
5. Sign in
6. Categories will auto-seed on first dashboard load

## What's Included

### Pages (All Production-Ready)
- ✓ Landing page with features
- ✓ Sign in / Sign up pages
- ✓ Email verification flow
- ✓ Dashboard with overview
- ✓ Accounts management
- ✓ Transactions tracking
- ✓ Budget management

### Features
- ✓ Multi-account support
- ✓ Income/expense tracking
- ✓ Category-based organization
- ✓ Monthly budgets with alerts
- ✓ Spending visualization
- ✓ Responsive mobile design
- ✓ Secure authentication
- ✓ Real-time updates

### Technology
- ✓ Next.js 16 (App Router)
- ✓ React 19
- ✓ TypeScript
- ✓ Tailwind CSS 4
- ✓ Supabase (PostgreSQL + Auth)
- ✓ SWR (data fetching)
- ✓ Recharts (visualizations)

## Testing the App

### Test Workflow

1. **Create Account**
   - Sign up at `/auth/signup`
   - Verify email (check spam folder)
   - Sign in at `/auth/login`

2. **Add Accounts**
   - Go to `/accounts`
   - Create accounts (checking, savings, etc.)
   - Set initial balance

3. **Add Transactions**
   - Go to `/transactions`
   - Add income and expenses
   - Watch account balances update

4. **Set Budgets**
   - Go to `/budgets`
   - Set monthly budgets by category
   - See spending progress

5. **View Dashboard**
   - Go to `/dashboard`
   - See account summaries
   - View spending chart
   - Monitor recent transactions

## API Endpoints

All endpoints require authentication (user session):

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts` - Update account
- `DELETE /api/accounts?id=<id>` - Delete account

### Transactions
- `GET /api/transactions` - List transactions
  - `?account_id=<id>` - Filter by account
  - `?start_date=<date>&end_date=<date>` - Filter by date
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions?id=<id>` - Delete transaction

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `DELETE /api/categories?id=<id>` - Delete category

### Budgets
- `GET /api/budgets?month=<m>&year=<y>` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets` - Update budget
- `DELETE /api/budgets?id=<id>` - Delete budget

### Utilities
- `POST /api/seed-categories` - Seed default categories

## Troubleshooting

### "Unauthorized" Error
- Ensure you're signed in
- Check browser cookies are enabled
- Try signing out and in again

### Categories Not Showing
- Categories auto-seed on first dashboard load
- Or manually POST to `/api/seed-categories`

### Balance Not Updating
- Refresh the page
- Check transaction was created
- Verify account ID is correct

### Authentication Issues
- Clear browser cache
- Ensure `.env.local` is correct
- Check Supabase project is active

## Customization

### Colors
Edit `app/globals.css` to change the theme:
- Primary: oklch(0.45 0.22 247) - deep blue
- Secondary: oklch(0.5 0.15 180) - teal

### Account Types
Edit form in `app/accounts/page.tsx`:
```tsx
<SelectItem value="checking">Checking</SelectItem>
<SelectItem value="savings">Savings</SelectItem>
<SelectItem value="credit">Credit Card</SelectItem>
<SelectItem value="investment">Investment</SelectItem>
```

### Default Categories
Edit `app/api/seed-categories/route.ts`:
```typescript
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔' },
  // Add more...
]
```

## Production Deployment

### On Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in project settings
4. Deploy!

### Environment Variables to Set
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Pre-deployment Checklist
- ✓ Test all pages work
- ✓ Test authentication flow
- ✓ Test transaction creation
- ✓ Test budget alerts
- ✓ Test mobile responsiveness
- ✓ Verify RLS policies are enabled

## Project Structure

```
budgetfi/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Theme & styles
│   ├── dashboard/               # Dashboard page
│   ├── accounts/                # Account management
│   ├── transactions/            # Transaction tracking
│   ├── budgets/                 # Budget management
│   ├── auth/                    # Auth pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── signup-success/
│   │   ├── error/
│   │   └── callback/
│   └── api/                     # API routes
│       ├── accounts/
│       ├── transactions/
│       ├── categories/
│       ├── budgets/
│       └── seed-categories/
├── components/
│   ├── sidebar.tsx              # Navigation
│   ├── spending-chart.tsx       # Chart component
│   └── ui/                      # shadcn components
├── hooks/
│   └── useAuth.ts               # Auth hook
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── proxy.ts
│   └── utils.ts
├── middleware.ts                # Auth middleware
├── README.md                    # Documentation
└── SETUP.md                     # This file
```

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs

## What's Next?

Once you're up and running:

1. Explore the dashboard
2. Create test accounts
3. Add some transactions
4. Set budgets
5. Customize the theme colors
6. Deploy to Vercel

Enjoy using BudgetFi! 🚀
