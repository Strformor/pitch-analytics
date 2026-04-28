import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const position = searchParams.get('position') || 'All'
  const team     = searchParams.get('team')     || 'All'
  const league   = searchParams.get('league')   || 'All'

  let query = supabase
    .from('players_2526')
    .select('*')
    .order('goals', { ascending: false })

  if (position !== 'All') {
    query = query.eq('position', position.toUpperCase())
  }
  if (team !== 'All') {
    query = query.eq('team', team)
  }
  if (league !== 'All') {
    query = query.eq('league', league)
  }

  const { data, error } = await query

  if (error) {
    console.error('[scout-2526] query error:', error.code)
    return NextResponse.json({ error: 'Data unavailable. Try again shortly.' }, { status: 500 })
  }

  const players = (data || []).map((p) => ({
    ...p,
    efficiency: p.minutes > 0
      ? Math.round(((p.goals + p.assists) / p.minutes) * 90 * 100) / 100
      : 0,
  }))

  players.sort((a, b) => b.efficiency - a.efficiency)

  return NextResponse.json({ players, total: players.length })
}
