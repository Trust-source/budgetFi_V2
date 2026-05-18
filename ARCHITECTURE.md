# BudgetFi Architecture Guide

## System Overview

BudgetFi is a full-stack personal finance application following Next.js 16 best practices with clear separation of concerns.

```
Client (React 19)
    ↓
Next.js 16 (App Router)
    ↓
API Routes (TypeScript)
    ↓
Supabase (PostgreSQL + Auth)
```

## Authentication Flow

```
User → Sign Up/Login Page
    ↓
Supabase Auth → Email Verification
    ↓
Middleware (proxy.ts) → Session Management
    ↓
Protected Routes (Dashboard, Accounts, etc.)
    ↓
Logout → Clear Session
```

### Key Files
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/proxy.ts` - Middleware for session refresh
- `middleware.ts` - Route protection
- `hooks/useAuth.ts` - Auth state management

## Database Schema

### Accounts Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- name: TEXT (e.g., "Checking Account")
- type: TEXT (checking, savings, credit, investment)
- balance: DECIMAL (current balance)
- currency: TEXT (USD, EUR, etc.)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Categories Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key, nullable for defaults)
- name: TEXT (e.g., "Food & Dining")
- icon: TEXT (emoji or icon name)
- is_default: BOOLEAN (true for system defaults)
- created_at: TIMESTAMP
```

### Transactions Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- account_id: UUID (foreign key to accounts)
- category_id: UUID (foreign key to categories)
- amount: DECIMAL (transaction amount)
- type: TEXT (income, expense)
- description: TEXT (optional)
- transaction_date: DATE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Budgets Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- category_id: UUID (foreign key to categories)
- amount: DECIMAL (budget limit)
- month: INTEGER (1-12)
- year: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(user_id, category_id, month, year)
```

### Row Level Security
All tables have RLS enabled with policies:
- SELECT: Only own records (user_id match)
- INSERT: Only for own user_id
- UPDATE: Only own records
- DELETE: Only own records

## Data Flow Patterns

### Creating a Transaction
1. User submits form on `/transactions`
2. Form validates input
3. POST to `/api/transactions`
4. API validates and inserts transaction
5. API updates account balance
6. SWR cache revalidates
7. UI updates with new data

```typescript
// Client
const { data, isLoading } = useSWR('/api/transactions', fetcher)

// Submit
await fetch('/api/transactions', {
  method: 'POST',
  body: JSON.stringify(transactionData)
})

// Revalidate
mutate('/api/transactions')
mutate('/api/accounts')
```

### Real-time Balance Updates
When transactions are added/deleted:
1. Account balance is calculated server-side
2. Transaction triggers account balance update
3. Both mutations are called on success
4. UI reflects new state immediately

## Component Structure

### Layout Components
- `Sidebar` - Navigation for all authenticated pages
- `Card` - Reusable container component
- `Button` - Form submissions and actions

### Feature Components
- `SpendingChart` - Pie chart visualization
- Form components (Input, Select, Label)

### Page Components
All pages:
1. Wrap with `useAuth()` hook to protect
2. Import `Sidebar` for navigation
3. Fetch data with `useSWR`
4. Show `Spinner` while loading
5. Handle errors gracefully

```typescript
export default function PageName() {
  const { user, loading: authLoading } = useAuth()
  const { data, isLoading } = useSWR(user ? '/api/endpoint' : null, fetcher)

  if (authLoading) return <Spinner />

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        {/* Content */}
      </main>
    </div>
  )
}
```

## API Route Pattern

All API routes follow this pattern:
1. Get user from Supabase Auth
2. Check authorization
3. Validate input
4. Execute database operation
5. Return JSON response

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Get user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // 2. Check auth
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Validate
    const { field } = await request.json()
    if (!field) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // 4. Execute
    const { data, error } = await supabase
      .from('table')
      .insert([{ user_id: user.id, field }])
      .select()

    // 5. Return
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## Styling System

### Design Tokens (app/globals.css)
```css
--background: oklch(0.98 0.002 247)    /* Light background */
--foreground: oklch(0.2 0.01 247)      /* Dark text */
--primary: oklch(0.45 0.22 247)        /* Primary blue */
--secondary: oklch(0.5 0.15 180)       /* Secondary teal */
--muted: oklch(0.93 0.01 247)          /* Muted gray */
--destructive: oklch(0.62 0.2 25)      /* Red for errors */
```

### Color Palette
- **Primary**: Deep blue (247°) - CTAs, important elements
- **Secondary**: Teal (180°) - Accents, borders
- **Charts**: 5 distinct colors for data visualization
- **Dark Mode**: Lighter variants for dark theme

### Tailwind Classes
Always use semantic tokens:
- `bg-background` not `bg-white`
- `text-foreground` not `text-black`
- `border-border` not `border-gray-200`

## Performance Optimizations

### Client-side
- SWR for data fetching with caching
- Suspense boundaries for loading
- Optimistic updates for better UX

### Server-side
- Database indexes on user_id, dates
- Efficient queries with proper selection
- Session cookies (HTTP-only)

### Build-time
- Next.js 16 Turbopack bundling
- Automatic code splitting
- Image optimization

## Error Handling

### Client Errors
- Form validation (TypeScript + zod patterns)
- Network error recovery
- User-friendly error messages

### Server Errors
- RLS policy violations
- Database constraint violations
- Missing user authentication

### Display Pattern
```tsx
{error && (
  <div className="flex items-center gap-2 p-3 rounded-lg 
                  bg-destructive/10 border border-destructive/20">
    <AlertCircle className="w-4 h-4 text-destructive" />
    <p className="text-sm text-destructive">{error}</p>
  </div>
)}
```

## Testing Workflow

### Manual Testing
1. Sign up new account
2. Create 2-3 accounts
3. Add 5-10 transactions
4. Set budgets for 2-3 categories
5. Verify balances update
6. Check spending chart
7. Test mobile view

### Key User Flows
- Authentication (sign up, email verify, login)
- Account creation and deletion
- Transaction adding and deletion
- Budget creation and tracking
- Logout

## Deployment Considerations

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL    # Public, safe to expose
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Public, limited scope
```

### Security Checklist
- ✓ RLS policies enabled on all tables
- ✓ Row-level security tested
- ✓ CORS properly configured
- ✓ No hardcoded secrets
- ✓ Input validation on all endpoints
- ✓ Error messages don't leak info

### Scaling Considerations
- Current setup handles single user fine
- Database indexes for user_id queries
- SWR caching prevents redundant requests
- Can add: pagination, archived records, etc.

## Adding New Features

### Steps to Add Feature X

1. **Design Database**
   - Create table schema
   - Add RLS policies
   - Create indexes

2. **Create API Route**
   - Add `/api/x/route.ts`
   - Implement GET/POST/PUT/DELETE
   - Add validation and error handling

3. **Create Page**
   - Add `/x/page.tsx`
   - Use useAuth() and useSWR()
   - Add Sidebar wrapper

4. **Add Navigation**
   - Update Sidebar navItems
   - Add route to middleware protection

5. **Test**
   - Test all CRUD operations
   - Test authentication
   - Test mobile responsiveness

## Common Patterns

### Form Submission
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    mutate('/api/endpoint')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error')
  } finally {
    setLoading(false)
  }
}
```

### Protected Page Wrapper
```typescript
export default function Page() {
  const { user, loading } = useAuth()

  if (loading) return <Spinner />

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">{/* Content */}</main>
    </div>
  )
}
```

## Resources

- **Next.js 16**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **React 19**: https://react.dev
- **Tailwind CSS 4**: https://tailwindcss.com
- **SWR**: https://swr.vercel.app
- **Recharts**: https://recharts.org

---

Last updated: 2024
Built with Next.js 16 + React 19 + Supabase
