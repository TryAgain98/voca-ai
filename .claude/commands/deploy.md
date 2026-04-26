# Deploy Command

Deploy the voca-ai application.

## Pre-deploy Checklist

1. Run type check: `npx tsc --noEmit`
2. Run lint: `npm run lint`
3. Run build: `npm run build`
4. Check for missing env vars (compare `.env.local` with required keys)
5. Apply pending migrations: `npm run db:push`

## Steps

```bash
# 1. Ensure clean working tree
git status

# 2. Type check
npx tsc --noEmit

# 3. Build
npm run build

# 4. Push DB migrations (if any pending)
npm run db:push

# 5. Deploy (update with your platform)
# Vercel: git push origin main  (auto-deploys via CI)
# Manual: vercel --prod
```

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

## Post-deploy Verification

- [ ] Auth flow works (sign-in, sign-up, redirect)
- [ ] Admin routes are protected
- [ ] Supabase queries return data (RLS not blocking)
- [ ] i18n locale switching works (`/en/`, `/vi/`)
