import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import SubsClient from './SubsClient'

export default async function SubsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: subscriptions }, { data: services }] = await Promise.all([
    supabase
      .from('user_subscriptions')
      .select('id, monthly_cost, renewal_date, services(id, name, plan_name, monthly_price)')
      .eq('user_id', user!.id)
      .order('created_at'),
    supabase
      .from('services')
      .select('id, name, plan_name, monthly_price')
      .order('name'),
  ])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold">Subsavvy</Link>
        <div className="flex items-center gap-6">
          <nav className="flex gap-4 text-sm">
            <Link href="/subs" className="text-white font-medium">My Subs</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          </nav>
          <form>
            <button formAction={signOut} className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6">My Subscriptions</h2>
        <SubsClient
          subscriptions={(subscriptions ?? []) as any}
          services={services ?? []}
        />
      </main>
    </div>
  )
}
