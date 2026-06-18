'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSubscription(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('user_subscriptions').insert({
    user_id: user.id,
    service_id: formData.get('service_id') as string,
    monthly_cost: parseFloat(formData.get('monthly_cost') as string),
    renewal_date: formData.get('renewal_date') || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/subs')
}

export async function updateSubscription(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      service_id: formData.get('service_id') as string,
      monthly_cost: parseFloat(formData.get('monthly_cost') as string),
      renewal_date: formData.get('renewal_date') || null,
    })
    .eq('id', formData.get('id') as string)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/subs')
}

export async function deleteSubscription(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  await supabase
    .from('user_subscriptions')
    .delete()
    .eq('id', formData.get('id') as string)
    .eq('user_id', user.id)

  revalidatePath('/subs')
}
