import { NextRequest, NextResponse } from 'next/server'

async function fetchTop(endpoint: string, league: string, season: string, key: string) {
  const res = await fetch(
    `https://v3.football.api-sports.io/players/${endpoint}?league=${league}&season=${season}`,
    { headers: { 'x-apisports-key': key } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.response || []
}

function processPlayer(p: any) {
  const stats = p.statistics[0]
  const goals = stats?.goals?.total || 0
  const assists = stats?.goals?.assists || 0
  const minutes = stats?.games?.minutes || 0
  const appearances = stats?.games?.appearences || 0
  const rating = parseFloat(stats?.games?.rating || '0')
  const efficiency = minutes > 0 ? ((goals + assists) / minutes) * 90 : 0

  return {
    id: p.player.id,
    name: p.player.name,
    age: p.player.age,
    nationality: p.player.nationality,
    photo: p.player.photo,
    injured: p.player.injured,
    team: stats?.team?.name || 'Unknown',
    teamLogo: stats?.team?.logo || '',
    league: stats?.league?.name || '',
    position: stats?.games?.position || 'Unknown',
    appearances,
    goals,
    assists,
    minutes,
    rating: isNaN(rating) ? 0 : rating,
    yellowCards: stats?.cards?.yellow || 0,
    redCards: stats?.cards?.red || 0,
    shots: stats?.shots?.total || 0,
    shotsOn: stats?.shots?.on || 0,
    passAccuracy: stats?.passes?.accuracy || 0,
    efficiency: Math.round(efficiency * 100) / 100,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const league = searchParams.get('league') || '39'
  const season = searchParams.get('season') || '2024'
  const position = searchParams.get('position') || 'All'
  const key = process.env.FOOTBALL_API_KEY!

  try {
    // Fetch top scorers and top assists in parallel
    const [scorers, assisters] = await Promise.all([
      fetchTop('topscorers', league, season, key),
      fetchTop('topassists', league, season, key),
    ])

    // Merge and deduplicate by player id
    const seen = new Set<number>()
    const merged: any[] = []
    for (const p of [...scorers, ...assisters]) {
      if (!seen.has(p.player.id)) {
        seen.add(p.player.id)
        merged.push(p)
      }
    }

    // Process all players
    let players = merged.map(processPlayer)

    // Filter by position
    if (position && position !== 'All') {
      players = players.filter((p) =>
        p.position.toLowerCase().includes(position.toLowerCase())
      )
    }

    // Sort by efficiency
    players.sort((a, b) => b.efficiency - a.efficiency)

    return NextResponse.json({ players, total: players.length })
  } catch {
    return NextResponse.json({ error: 'Scout data unavailable. Try again shortly.' }, { status: 500 })
  }
}
