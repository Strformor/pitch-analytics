import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/league              → { leagueMap: { "Premier League": ["Arsenal", ...], ... } }
 * GET /api/league?team=X       → { players: [...], teamName: "X" }
 * GET /api/league?season=2526  → uses players_2526 table
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const team   = searchParams.get('team')   || ''
  const season = searchParams.get('season') || '2425'
  const table  = season === '2526' ? 'players_2526' : 'players_2425'

  // ── No team → return league→teams map ─────────────────────────────────────
  if (!team) {
    const { data, error } = await supabase
      .from(table)
      .select('league, team')

    if (error) {
      console.error('[league] meta error:', error.code)
      return NextResponse.json({ error: 'Data unavailable.' }, { status: 500 })
    }

    const leagueMap: Record<string, Set<string>> = {}
    for (const row of data || []) {
      if (!row.league || !row.team) continue
      if (!leagueMap[row.league]) leagueMap[row.league] = new Set()
      leagueMap[row.league].add(row.team)
    }

    const result: Record<string, string[]> = {}
    for (const [league, teams] of Object.entries(leagueMap)) {
      result[league] = [...teams].sort()
    }

    return NextResponse.json({ leagueMap: result })
  }

  // ── Team requested → return players ───────────────────────────────────────
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('team', team)

  if (error) {
    console.error('[league] player error:', error.code)
    return NextResponse.json({ error: 'Data unavailable. Try again shortly.' }, { status: 500 })
  }

  const players = (data || [])
    .map(p => ({
      ...p,
      efficiency: p.minutes > 0
        ? Math.round(((p.goals + p.assists) / p.minutes) * 90 * 100) / 100
        : 0,
    }))
    .sort((a, b) => b.efficiency - a.efficiency)

  return NextResponse.json({ players, teamName: team })
}
