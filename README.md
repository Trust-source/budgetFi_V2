# BudgetFi - Personal Finance Management

BudgetFi is a modern, full-stack personal finance management application built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Supabase. It helps users track accounts, manage budgets, and understand their spending patterns with beautiful visualizations.

## Features

### Core Features
- **Multi-Account Management**: Track multiple financial accounts (checking, savings, credit cards, investments)
- **Transaction Tracking**: Log income and expenses with categories and descriptions
- **Budget Management**: Set monthly budgets by category and monitor spending
- **Spending Analytics**: Visualize spending patterns with interactive pie charts
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Secure Authentication**: Email/password authentication with Supabase Auth
- **Real-time Data**: Automatic balance updates and spending calculations

### Pages
- **Landing Page** (`/`): Beautiful marketing page with feature highlights
- **Authentication** (`/auth/login`, `/auth/signup`): User sign-in and registration
- **Dashboard** (`/dashboard`): Overview with account summaries and recent transactions
- **Accounts** (`/accounts`): Create and manage financial accounts
- **Transactions** (`/transactions`): Add and view income/expense transactions
- **Budgets** (`/budgets`): Set and track monthly category budgets

## Tech Stack

### Frontend
- **Next.js 16**: Latest React framework with App Router
- **React 19**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Recharts**: Beautiful chart library
- **SWR**: Data fetching with caching
- **Lucide React**: Icon library

### Backend
- **Next.js API Routes**: Serverless backend
- **Supabase**: PostgreSQL database with auth

### Database Schema
- **accounts**: User financial accounts
- **categories**: Transaction categories (auto-seeded)
- **transactions**: Income/expense transactions
- **budgets**: Monthly budget allocations

## Getting Started

### Prerequisites
- Node.js 18+ or pnpm
- Supabase project with auth enabled

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository>
   cd budgetfi
   pnpm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Setup**
   The database schema is automatically created via Supabase. Run the migrations if needed.

4. **Start development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Key Implementation Details

### Authentication
- **Supabase Auth**: Email/password authentication
- **Protected Routes**: Middleware redirects unauthenticated users
- **Session Management**: HTTP-only cookies with automatic refresh

### Data Security
- **Row Level Security (RLS)**: Database-level security ensuring users only access their own data
- **Type Safety**: Full TypeScript support for runtime safety
- **API Validation**: Request validation and error handling

### Performance
- **Client-side Caching**: SWR for efficient data fetching
- **Optimistic Updates**: Immediate UI updates with background sync
- **Database Indexes**: Optimized queries for common operations

### Responsive Design
- **Mobile-first**: Designed for mobile, enhanced for larger screens
- **Collapsible Sidebar**: Smart navigation on small screens
- **Touch-friendly**: Proper spacing and hit targets

## API Routes

### Accounts (`/api/accounts`)
- `GET`: Fetch user's accounts
- `POST`: Create new account
- `PUT`: Update account details
- `DELETE`: Remove account (with query param `id`)

### Transactions (`/api/transactions`)
- `GET`: Fetch transactions (supports filtering by account, date range)
- `POST`: Create transaction (updates account balance)
- `DELETE`: Remove transaction (reverts account balance)

### Categories (`/api/categories`)
- `GET`: Fetch user categories (includes default categories)
- `POST`: Create custom category
- `DELETE`: Remove category

### Budgets (`/api/budgets`)
- `GET`: Fetch budgets (supports month/year filtering)
- `POST`: Create budget
- `PUT`: Update budget amount
- `DELETE`: Remove budget

### Utilities (`/api/seed-categories`)
- `POST`: Seed default categories for new user

## Development

### Project Structure
```
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout
├── dashboard/              # Main dashboard
├── accounts/               # Account management
├── transactions/           # Transaction tracking
├── budgets/                # Budget management
├── auth/                   # Authentication pages
│   ├── login/
│   ├── signup/
│   ├── signup-success/
│   └── error/
└── api/                    # Backend routes

components/
├── sidebar.tsx             # Navigation sidebar
├── spending-chart.tsx      # Chart component
└── ui/                     # shadcn/ui components

hooks/
└── useAuth.ts              # Authentication hook

lib/
├── supabase/               # Supabase client configs
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client
│   └── proxy.ts            # Middleware
└── utils.ts                # Utilities
```

### Adding New Features

1. **Database Changes**: Modify schema via Supabase console
2. **API Routes**: Add new route in `/api` directory
3. **Components**: Create reusable components in `/components`
4. **Pages**: Add new page with Sidebar wrapper

## Production Deployment

### Environment Setup
Set these variables in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Deployment Steps
1. Build: `pnpm build`
2. Test: `pnpm start`
3. Deploy to Vercel (recommended) or your preferred platform

### Security Checklist
- ✓ Row Level Security (RLS) enabled
- ✓ Environment variables secured
- ✓ CORS properly configured
- ✓ Rate limiting on API routes
- ✓ Input validation on all endpoints

## Customization

### Theme Colors
Edit design tokens in `app/globals.css`:
- Primary color: Deep blue (247°)
- Secondary color: Teal (180°)
- Accent colors: Chart colors for visualizations

### Default Categories
Customize in `app/api/seed-categories/route.ts`

### Account Types
Modify account type options in form components

## Troubleshooting

### Common Issues

**Categories not showing in forms**
- Run `/api/seed-categories` POST request after signup
- This happens automatically on first dashboard load

**Balance not updating**
- Ensure RLS policies allow balance updates
- Check transaction was created successfully

**Auth redirects not working**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check middleware.ts is in root directory

## Contributing

Pull requests welcome! Please:
1. Follow existing code style
2. Add TypeScript types
3. Test responsive design
4. Update documentation

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check Next.js documentation

---

Built with Next.js 16 and Supabase. Production-ready and fully responsive.
