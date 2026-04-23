const BASE_V2 = 'https://statpal.io/api/v2/soccer'
const BASE_V1 = 'https://statpal.io/api/v1/soccer'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

async function apiFetch(url: string): Promise<any> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`StatPal ${res.status}`)
  return res.json()
}

// ── Position normaliser ──────────────────────────────────────────────────────
export function mapPosition(pos: string): string {
  const p = (pos || '').toUpperCase()
  if (p === 'G' || p === 'GK' || p.includes('GOALKEEPER')) return 'GK'
  if (p === 'D' || p.includes('DEFENDER'))                  return 'D'
  if (p === 'M' || p.includes('MIDFIELDER'))                return 'M'
  return 'F' // Forward / Attacker / default
}

function toNum(val: any): number {
  const n = parseInt(String(val ?? ''))
  return isNaN(n) ? 0 : n
}

// ── API calls ────────────────────────────────────────────────────────────────
export async function getLiveMatches() {
  return apiFetch(`${BASE_V2}/matches/live?access_key=${process.env.STATPAL_API_KEY}`)
}

export async function getLeagueMatches(leagueId: string) {
  return apiFetch(`${BASE_V2}/leagues/${leagueId}/matches?access_key=${process.env.STATPAL_API_KEY}`)
}

export async function getTeam(teamId: string) {
  return apiFetch(`${BASE_V2}/teams/${teamId}?access_key=${process.env.STATPAL_API_KEY}`)
}

export async function getPlayer(playerId: string) {
  return apiFetch(`${BASE_V2}/players/${playerId}?access_key=${process.env.STATPAL_API_KEY}`)
}

export async function getInjuries() {
  return apiFetch(`${BASE_V1}/injuries?access_key=${process.env.STATPAL_API_KEY}`)
}

// ── Data extractors ──────────────────────────────────────────────────────────

/** Pull every unique team ID out of a league's full fixture list */
export function extractTeamIds(leagueMatchesData: any): string[] {
  const ids = new Set<string>()
  const tournament = leagueMatchesData?.matches?.tournament
  if (!tournament) return []

  const stages = Array.isArray(tournament.stage) ? tournament.stage : [tournament.stage]
  for (const stage of stages ?? []) {
    const weeks = Array.isArray(stage?.week) ? stage.week : [stage?.week]
    for (const week of weeks ?? []) {
      const matches = Array.isArray(week?.match) ? week.match : [week?.match]
      for (const match of matches ?? []) {
        if (match?.home?.id) ids.add(String(match.home.id))
        if (match?.away?.id) ids.add(String(match.away.id))
      }
    }
  }
  return [...ids]
}

/** Build a Supabase-ready player row from a StatPal /players/{id} response */
export function buildPlayerRecord(
  playerData: any,
  fallbackLeague: string,
  fallbackTeam: string,
  injuredIds: Set<string>
): object | null {
  const p = playerData?.player
  if (!p?.id) return null

  // Use most recent club season stats (first entry)
  const stats = p.club_league_statistics?.club?.[0] ?? {}

  return {
    id:           toNum(p.id),
    name:         p.name ?? '',
    position:     mapPosition(p.position ?? ''),
    age:          toNum(p.age) || null,
    nationality:  p.nationality ?? null,
    team:         stats.team_name   ?? fallbackTeam,
    league:       stats.league      ?? fallbackLeague,
    goals:        toNum(stats.goals),
    assists:      toNum(stats.assists),
    minutes:      toNum(stats.minutes_played),
    appearances:  toNum(stats.appearances),
    xg:           null,
    xa:           null,
    xg90:         null,
    xa90:         null,
    photo:        null,
    injured:      injuredIds.has(String(toNum(p.id))),
  }
}

/** Run async tasks in batches with concurrency + delay between batches */
export async function batchProcess<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 10,
  delayMs = 80
): Promise<(R | null)[]> {
  const results: (R | null)[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const settled = await Promise.allSettled(batch.map(fn))
    for (const r of settled) {
      results.push(r.status === 'fulfilled' ? r.value : null)
    }
    if (i + concurrency < items.length) await delay(delayMs)
  }
  return results
}
