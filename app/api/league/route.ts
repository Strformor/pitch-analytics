import { NextResponse } from 'next/server'

const API_KEY = process.env.FOOTBALL_API_KEY
const BASE = 'https://v3.football.api-sports.io'

// All 20 Premier League 2024/25 teams
export const PL_TEAMS: Record<number, string> = {
  42:  'Arsenal',
  66:  'Aston Villa',
  35:  'Bournemouth',
  55:  'Brentford',
  51:  'Brighton',
  49:  'Chelsea',
  52:  'Crystal Palace',
  45:  'Everton',
  36:  'Fulham',
  57:  'Ipswich',
  46:  'Leicester',
  40:  'Liverpool',
  50:  'Man City',
  33:  'Man United',
  34:  'Newcastle',
  65:  'Nottm Forest',
  41:  'Southampton',
  47:  'Tottenham',
  48:  'West Ham',
  39:  'Wolves',
}

function estimateValue(
  age: number,
  position: string,
  goals: number,
  assists: number,
  minutes: number,
  rating: number,
  saves: number,
): number {
  const pos = (position || '').toLowerCase()

  // Base market value (£M) by position
  let base = 35
  if (pos.includes('goalkeeper')) base = 20
  else if (pos.includes('defender')) base = 28
  else if (pos.includes('midfielder')) base = 35
  else if (pos.includes('attacker') || pos.includes('forward')) base = 50

  // Age multiplier — peaks 25–28
  let ageMult = 1.0
  if (age <= 19)      ageMult = 0.60
  else if (age <= 21) ageMult = 0.75
  else if (age <= 23) ageMult = 0.90
  else if (age <= 26) ageMult = 1.15
  else if (age <= 28) ageMult = 1.10
  else if (age <= 30) ageMult = 0.95
  else if (age <= 32) ageMult = 0.70
  else                ageMult = 0.45

  // Performance multiplier
  let perfMult = 1.0
  if (pos.includes('goalkeeper')) {
    perfMult = saves > 80 ? 1.5 : saves > 60 ? 1.3 : saves > 40 ? 1.1 : saves > 20 ? 1.0 : 0.85
  } else {
    const ga90 = minutes > 0 ? ((goals + assists) / minutes) * 90 : 0
    perfMult = Math.min(1 + ga90 * 0.7, 2.8)
  }

  // API rating bonus (6–10 scale)
  const ratingMult = rating >= 8.0 ? 1.2 : rating >= 7.5 ? 1.1 : rating >= 7.0 ? 1.0 : 0.9

  // Minutes fitness factor
  const fitnessMult =
    minutes > 2700 ? 1.1 :
    minutes > 1800 ? 1.0 :
    minutes > 900  ? 0.85 : 0.65

  return Math.max(1, Math.round(base * ageMult * perfMult * ratingMult * fitnessMult))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const teamId = Number(searchParams.get('team') || 42)
  const season = '2024'

  if (!API_KEY) return NextResponse.json({ error: 'No API key' }, { status: 500 })

  const headers = { 'x-apisports-key': API_KEY }

  try {
    // Fetch all pages for the team
    const allRaw: any[] = []
    let page = 1

    while (true) {
      const res = await fetch(
        `${BASE}/players?team=${teamId}&season=${season}&page=${page}`,
        { headers }
      )
      const data = await res.json()
      const rows = data.response || []
      if (!rows.length) break
      allRaw.push(...rows)
      if (page >= (data.paging?.total || 1)) break
      page++
    }

    const players = allRaw
      .filter(p => (p.statistics?.[0]?.games?.minutes || 0) > 0)
      .map(p => {
        const pl = p.player
        const s  = p.statistics[0]
        const g  = s.goals      || {}
        const gm = s.games      || {}
        const sh = s.shots      || {}
        const ps = s.passes     || {}
        const tk = s.tackles    || {}
        const du = s.duels      || {}
        const dr = s.dribbles   || {}
        const fo = s.fouls      || {}
        const ca = s.cards      || {}

        const position  = gm.position    || 'Unknown'
        const apps      = gm.appearences || 0
        const minutes   = gm.minutes     || 0
        const goals     = g.total        || 0
        const assists   = g.assists      || 0
        const rating    = parseFloat(gm.rating || '0') || 0
        const saves     = g.saves        || 0
        const conceded  = g.conceded     || 0

        const savePercent =
          saves + conceded > 0
            ? Math.round((saves / (saves + conceded)) * 100)
            : null

        const duelsWonPct =
          (du.total || 0) > 0
            ? Math.round(((du.won || 0) / du.total) * 100)
            : null

        const value = estimateValue(pl.age, position, goals, assists, minutes, rating, saves)

        return {
          id:           pl.id,
          name:         pl.name,
          photo:        pl.photo,
          age:          pl.age,
          nationality:  pl.nationality,
          position,
          team:         s.team?.name  || PL_TEAMS[teamId],
          teamId:       s.team?.id    || teamId,
          injured:      pl.injured,
          rating,

          // Universal
          apps, minutes, goals, assists,

          // Shooting (FW/MF)
          shots_total:   sh.total  || 0,
          shots_on:      sh.on     || 0,

          // Passing (MF/DF)
          passes_total:  ps.total    || 0,
          pass_accuracy: ps.accuracy || 0,
          key_passes:    ps.key      || 0,

          // Defending (DF/MF)
          tackles:        tk.total          || 0,
          interceptions:  tk.interceptions  || 0,
          blocks:         tk.blocks         || 0,

          // Duels
          duels_total:    du.total    || 0,
          duels_won:      du.won      || 0,
          duels_won_pct:  duelsWonPct,

          // Dribbles (FW/MF)
          dribbles:       dr.success  || 0,

          // Fouls
          fouls_committed: fo.committed || 0,
          fouls_drawn:     fo.drawn     || 0,

          // Cards
          yellow: ca.yellow || 0,
          red:    ca.red    || 0,

          // Goalkeeper
          saves,
          conceded,
          save_pct: savePercent,

          // Market value
          value,
          value_range: `£${Math.round(value * 0.8)}M – £${Math.round(value * 1.25)}M`,
        }
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))

    return NextResponse.json({ players, teamName: PL_TEAMS[teamId] })
  } catch {
    return NextResponse.json({ error: 'League data unavailable. Try again shortly.' }, { status: 500 })
  }
}
