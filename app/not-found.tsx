import { redirect } from 'next/navigation'

export default function NotFound() {
  redirect('/en/admin/lessons')
}
