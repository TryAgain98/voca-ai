import { useQuery } from '@tanstack/react-query'

import type { Post } from '~/types'

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3')
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export function usePosts(enabled = false) {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    enabled,
  })
}
