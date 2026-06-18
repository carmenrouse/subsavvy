import { signIn } from '@/app/actions/auth'
import Link from 'next/link'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm space-y-6 p-8 bg-gray-900 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Subsavvy</h1>
          <p className="mt-1 text-sm text-gray-400">Sign in to your account</p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {searchParams.error && (
            <p className="text-sm text-red-400">{searchParams.error}</p>
          )}

          <button
            formAction={signIn}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          No account?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
