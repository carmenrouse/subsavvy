'use client'

import { useState } from 'react'
import { addSubscription, updateSubscription, deleteSubscription } from '@/app/actions/subscriptions'

type Service = { id: string; name: string; plan_name: string | null; monthly_price: number }
type Subscription = {
  id: string
  monthly_cost: number
  renewal_date: string | null
  services: Service
}

export default function SubsClient({
  subscriptions,
  services,
}: {
  subscriptions: Subscription[]
  services: Service[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const total = subscriptions.reduce((sum, s) => sum + s.monthly_cost, 0)

  return (
    <div className="space-y-6">
      {/* Monthly spend */}
      <div className="bg-gray-900 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Monthly spend</p>
          <p className="text-3xl font-bold text-white">${total.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add subscription
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form
          action={async (fd) => { await addSubscription(fd); setShowAdd(false) }}
          className="bg-gray-900 rounded-xl p-5 space-y-4"
        >
          <h3 className="font-medium text-white">New subscription</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              name="service_id"
              required
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select service…</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.plan_name ? ` — ${s.plan_name}` : ''} (${s.monthly_price}/mo)
                </option>
              ))}
            </select>
            <input
              name="monthly_cost"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Your price/mo"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              name="renewal_date"
              type="date"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              Save
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Subscriptions list */}
      {subscriptions.length === 0 && !showAdd ? (
        <p className="text-gray-500 text-sm">No subscriptions yet. Add one above.</p>
      ) : (
        <ul className="space-y-3">
          {subscriptions.map(sub => (
            <li key={sub.id} className="bg-gray-900 rounded-xl p-5">
              {editingId === sub.id ? (
                <form
                  action={async (fd) => { await updateSubscription(fd); setEditingId(null) }}
                  className="space-y-3"
                >
                  <input type="hidden" name="id" value={sub.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      name="service_id"
                      defaultValue={sub.services.id}
                      required
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.plan_name ? ` — ${s.plan_name}` : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      name="monthly_cost"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={sub.monthly_cost}
                      required
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      name="renewal_date"
                      type="date"
                      defaultValue={sub.renewal_date ?? ''}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {sub.services.name}
                      {sub.services.plan_name && (
                        <span className="text-gray-400 font-normal"> — {sub.services.plan_name}</span>
                      )}
                    </p>
                    {sub.renewal_date && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Renews {new Date(sub.renewal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">${sub.monthly_cost.toFixed(2)}/mo</span>
                    <button
                      onClick={() => setEditingId(sub.id)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <form action={deleteSubscription}>
                      <input type="hidden" name="id" value={sub.id} />
                      <button type="submit" className="text-sm text-red-500 hover:text-red-400 transition-colors">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
