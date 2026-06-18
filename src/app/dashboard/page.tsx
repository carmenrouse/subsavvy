import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Subsavvy</h1>
        <div className="flex items-center gap-6">
          <nav className="flex gap-4 text-sm">
            <Link href="/subs" className="text-gray-400 hover:text-white transition-colors">My Subs</Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <form>
              <button formAction={signOut} className="text-sm text-gray-400 hover:text-white transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-2">Welcome to Subsavvy</h2>
        <p className="text-gray-400 mb-6">Track your streaming subscriptions and find out where you're overpaying.</p>
        <Link
          href="/subs"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
        >
          Manage my subscriptions →
        </Link>
      </main>
    </div>
  )
}
