# Clerk Authentication Setup Guide

This application uses **Clerk** for authentication, integrated with **Convex** for the backend.

## Prerequisites

1. Create a Clerk account at [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application in your Clerk dashboard

## Environment Setup

### 1. Get your Clerk API Keys

From your Clerk Dashboard:
1. Go to **API Keys** page
2. Copy your **Publishable Key**
3. Copy your **Secret Key**

### 2. Configure Environment Variables

Add these to your `.env.local` file (create it if it doesn't exist):

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

### 3. Convex Setup (Already Configured)

Your Convex deployment should already have:
```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_deployment_name
```

## How It Works

### Authentication Flow

1. **Unauthenticated users** → Redirected to `/sign-in`
2. **Sign in/Sign up** → Handled by Clerk components
3. **Authenticated users** → Access to `/areas` and other protected routes
4. **Sign out** → Click UserButton in header

### Protected Routes

All routes under `/areas` are automatically protected by Clerk middleware. No manual auth checks needed!

### Clerk Components Used

- **`<SignIn />`** - Pre-built sign-in component at `/sign-in`
- **`<SignUp />`** - Pre-built sign-up component at `/sign-up`
- **`<UserButton />`** - User profile button in header
- **Clerk Middleware** - Automatic route protection

### Integration with Convex

The app uses `ConvexProviderWithClerk` to:
- Sync Clerk authentication state with Convex
- Allow Convex queries/mutations to access user info
- Enable server-side auth checks in Convex functions

## Customization

### Styling Clerk Components

Clerk components are styled to match your design system. You can customize them in:
- `/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

### Redirect URLs

Configure these in your `.env.local`:
```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/areas
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/areas
```

## Accessing User Data

### In Client Components

```typescript
import { useUser } from "@clerk/nextjs";

export function MyComponent() {
  const { user } = useUser();

  return <div>{user?.primaryEmailAddress?.emailAddress}</div>;
}
```

### In Server Components / API Routes

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Your logic here
}
```

### In Convex Functions

```typescript
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const myQuery = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Your logic here
  },
});
```

## Testing Authentication

1. Start your development server:
   ```bash
   npx convex dev  # Terminal 1
   npm run dev      # Terminal 2
   ```

2. Visit `http://localhost:3000`
3. You'll be redirected to `/sign-in`
4. Sign up with email/password
5. After signing in, you'll be redirected to `/areas`

## Troubleshooting

### "Clerk publishable key not found"
- Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is in `.env.local`
- Restart your dev server after adding env variables

### "Unauthorized" errors in Convex
- Ensure Clerk and Convex are properly synced
- Check that `ConvexProviderWithClerk` is wrapping your app
- Verify your Convex deployment is running (`npx convex dev`)

### Users not being created in Convex
- Convex automatically creates user records when they first authenticate
- Check your Convex dashboard to see user data

## Security Best Practices

✅ **Do:**
- Keep your `CLERK_SECRET_KEY` in `.env.local` (never commit)
- Use Clerk's built-in components for auth UI
- Let Clerk middleware handle route protection

❌ **Don't:**
- Store API keys in code or version control
- Build custom auth flows (use Clerk components)
- Manually check auth state (middleware does this)

## Learn More

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [Convex Documentation](https://docs.convex.dev)

## Support

If you encounter issues:
1. Check Clerk dashboard for API key validity
2. Verify environment variables are set
3. Check browser console for errors
4. Review Convex logs in dashboard
