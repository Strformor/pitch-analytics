import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  getLiveMatches,
  getLeagueMatches,
  getTeam,
  getPlayer,
  getInjuries,
  extractTeamIds,
  buildPlayerRecord,
  batchProcess,
} from '@/lib/statpal'

// Allow up to 5 minutes — needed for bulk sync (Vercel Pro)
export const maxDuration = 300

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isAuthorised(req: NextRequest): boolean {
  const bearer = req.headers.get('authorization')?.replace('Bearer ', '')
  const header = req.headers.get('x-cron-secret')
  const param  = req.nextUrl.searchParams.get('secret')
  const secret = process.env.CRON_SECRET
  return !!(secret && (bearer === secret || header === secret || param === secret))
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const log: string[] = []
  let playersUpserted = 0
  let errors = 0

  try {
    // ── Step 1: Discover active leagues ─────────────────────────────────────
    log.push('→ Fetching live matches...')
    const liveData   = await getLiveMatches()
    const rawLeagues = liveData?.live_matches?.league ?? []
    const leagues    = rawLeagues
      .filter((l: any) => l.cup === 'False')
      .map((l: any) => ({ id: String(l.id), name: String(l.name) }))
    log.push(`→ ${leagues.length} non-cup leagues found`)

    // ── Step 2: Collect every team ID across all league fixtures ─────────────
    log.push('→ Resolving team rosters per league...')
    const teamLeague = new Map<string, string>() // teamId → leagueName

    for (const league of leagues) {
      try {
        const data    = await getLeagueMatches(league.id)
        const teamIds = extractTeamIds(data)
        for (const id of teamIds) {
          if (!teamLeague.has(id)) teamLeague.set(id, league.name)
        }
      } catch {
        errors++
      }
    }
    log.push(`→ ${teamLeague.size} unique teams to sync`)

    // ── Step 3: Build injured player ID set ──────────────────────────────────
    log.push('→ Fetching injury data...')
    const injuredIds = new Set<string>()
    try {
      const injData = await getInjuries()
      const injLeagues: any[] = injData?.injuries_suspensions?.league ?? []
      for (const l of injLeagues) {
        const matches = Array.isArray(l.match) ? l.match : [l.match]
        for (const m of matches ?? []) {
          for (const side of [m?.home, m?.away]) {
            const players = side?.sidelined?.to_miss?.player ?? []
            const list = Array.isArray(players) ? players : [players]
            for (const p of list) {
              if (p?.id) injuredIds.add(String(p.id))
            }
          }
        }
      }
    } catch {
      log.push('→ Warning: injury data unavailable, skipping')
    }
    log.push(`→ ${injuredIds.size} injured players identified`)

    // ── Step 4: Fetch squads + player stats, build records ───────────────────
    log.push('→ Syncing player data...')
    const allRecords: object[] = []

    for (const [teamId, leagueName] of teamLeague) {
      try {
        const teamData = await getTeam(teamId)
        const teamName = teamData?.team?.name ?? ''
        const squad: any[] = (teamData?.team?.squad?.player ?? []).filter((p: any) => p?.id)

        const records = await batchProcess(
          squad,
          async (sp) => {
            const pd = await getPlayer(String(sp.id))
            const rec = buildPlayerRecord(pd, leagueName, teamName, injuredIds)
            // Honour injury flag from squad data too
            if (rec && sp.injured === 'True') (rec as any).injured = true
            return rec
          },
          10, 80
        )

        for (const r of records) {
          if (r) allRecords.push(r)
        }
      } catch {
        errors++
      }
    }

    // ── Step 5: Upsert to Supabase in batches of 100 ────────────────────────
    log.push(`→ Upserting ${allRecords.length} player records...`)
    for (let i = 0; i < allRecords.length; i += 100) {
      const { error } = await supabase
        .from('players_2526')
        .upsert(allRecords.slice(i, i + 100), { onConflict: 'id' })
      if (error) {
        errors++
        log.push(`Upsert error at batch ${i}: ${error.message}`)
      } else {
        playersUpserted += Math.min(100, allRecords.length - i)
      }
    }

    log.push(`✓ Done — ${playersUpserted} players synced, ${errors} errors`)
    return NextResponse.json({ success: true, playersUpserted, errors, log })

  } catch (err: any) {
    log.push(`✗ Fatal: ${err.message}`)
    return NextResponse.json({ success: false, error: err.message, log }, { status: 500 })
  }
}
