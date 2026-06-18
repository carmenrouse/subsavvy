// Run with: node --env-file=.env.local scripts/seed-tmdb.mjs
import { createClient } from '@supabase/supabase-js'

const TMDB_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// TMDB provider ID → service name (must match names in the services table)
const PROVIDER_NAME_MAP = {
  8:   'Netflix',
  9:   'Amazon Prime Video',
  15:  'Hulu',
  337: 'Disney+',
  386: 'Peacock',
  387: 'Max',
  531: 'Paramount+',
  350: 'Apple TV+',
}

async function tmdbFetch(path) {
  const res = await fetch(`https://api.themoviedb.org/3${path}`, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
  })
  if (!res.ok) throw new Error(`TMDB ${path} → ${res.status}`)
  return res.json()
}

async function fetchPopular(type, pages = 10) {
  const results = []
  for (let page = 1; page <= pages; page++) {
    const data = await tmdbFetch(`/${type}/popular?language=en-US&page=${page}`)
    results.push(...data.results)
  }
  return results
}

async function getUSFlatrate(type, tmdbId) {
  const data = await tmdbFetch(`/${type}/${tmdbId}/watch/providers`)
  return data.results?.US?.flatrate ?? []
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function run() {
  if (!TMDB_TOKEN) { console.error('Missing TMDB_READ_ACCESS_TOKEN in .env.local'); process.exit(1) }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1) }

  // Build service name → id map (keep first entry per name so all plans share one availability row)
  const { data: services, error: svcErr } = await supabase.from('services').select('id, name').order('monthly_price')
  if (svcErr) { console.error('Could not load services:', svcErr.message); process.exit(1) }
  const serviceByName = {}
  for (const s of services) {
    if (!serviceByName[s.name]) serviceByName[s.name] = s.id
  }

  // Fetch popular titles from TMDB
  console.log('Fetching popular movies (10 pages)…')
  const movies = await fetchPopular('movie', 10)

  console.log('Fetching popular TV shows (10 pages)…')
  const shows = await fetchPopular('tv', 10)

  const allTitles = [
    ...movies.map(m => ({ tmdb_id: m.id, name: m.title,  type: 'movie', genre_ids: m.genre_ids })),
    ...shows.map(s =>  ({ tmdb_id: s.id, name: s.name,   type: 'show',  genre_ids: s.genre_ids })),
  ]

  // Upsert titles in chunks
  console.log(`Upserting ${allTitles.length} titles…`)
  const CHUNK = 100
  const upsertedTitles = []
  for (let i = 0; i < allTitles.length; i += CHUNK) {
    const { data, error } = await supabase
      .from('titles')
      .upsert(allTitles.slice(i, i + CHUNK), { onConflict: 'tmdb_id' })
      .select('id, tmdb_id')
    if (error) { console.error('Title upsert error:', error.message); process.exit(1) }
    upsertedTitles.push(...data)
  }
  const titleByTmdbId = Object.fromEntries(upsertedTitles.map(t => [t.tmdb_id, t.id]))

  // Fetch watch providers for every title
  console.log('Fetching watch providers (this takes a minute)…')
  const availabilities = []
  for (let i = 0; i < allTitles.length; i++) {
    const title = allTitles[i]
    const tmdbType = title.type === 'movie' ? 'movie' : 'tv'
    try {
      const providers = await getUSFlatrate(tmdbType, title.tmdb_id)
      for (const p of providers) {
        const svcName = PROVIDER_NAME_MAP[p.provider_id]
        const serviceId = svcName ? serviceByName[svcName] : null
        const titleId = titleByTmdbId[title.tmdb_id]
        if (serviceId && titleId) {
          availabilities.push({ title_id: titleId, service_id: serviceId, region: 'US' })
        }
      }
    } catch (e) {
      console.warn(`  skipped ${title.name}: ${e.message}`)
    }
    if (i % 50 === 0) console.log(`  ${i}/${allTitles.length}`)
    await sleep(50)
  }

  // Upsert availabilities in chunks
  console.log(`Upserting ${availabilities.length} availability records…`)
  for (let i = 0; i < availabilities.length; i += CHUNK) {
    const { error } = await supabase
      .from('title_availability')
      .upsert(availabilities.slice(i, i + CHUNK), { onConflict: 'title_id,service_id,region' })
    if (error) { console.error('Availability upsert error:', error.message); process.exit(1) }
  }

  console.log('Done!')
}

run().catch(e => { console.error(e); process.exit(1) })
