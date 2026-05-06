import { useQuery } from '@tanstack/react-query'

import type { AdminUser } from '~/app/api/admin/users/route'

export type { AdminUser }

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/users')
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json() as Promise<AdminUser[]>
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    staleTime: 60_000,
  })
}
