'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'

const PL_TEAMS: Record<number, string> = {
  42:  'Arsenal',         66:  'Aston Villa',
  35:  'Bournemouth',     55:  'Brentford',
  51:  'Brighton',        49:  'Chelsea',
  52:  'Crystal Palace',  45:  'Everton',
  36:  'Fulham',          57:  'Ipswich',
  46:  'Leicester',       40:  'Liverpool',
  50:  'Man City',        33:  'Man United',
  34:  'Newcastle',       65:  'Nottm Forest',
  41:  'Southampton',     47:  'Tottenham',
  48:  'West Ham',        39:  'Wolves',
}

const SORT_OPTIONS = [
  { val: 'rating',   label: 'Rating' },
  { val: 'value',    label: 'Market Value' },
  { val: 'goals',    label: 'Goals' },
  { val: 'assists',  label: 'Assists' },
  { val: 'tackles',  label: 'Tackles' },
  { val: 'saves',    label: 'Saves' },
]

type Pos = 'All' | 'Attacker' | 'Midfielder' | 'Defender' | 'Goalkeeper'
const POSITIONS: Pos[] = ['All', 'Attacker', 'Midfielder', 'Defender', 'Goalkeeper']

// ── Role-based stat blocks ─────────────────────────────────────────────────

function roleStats(p: any) {
  const pos = (p.position || '').toLowerCase()

  if (pos.includes('goalkeeper')) {
    return [
      { label: 'SAVES',       val: p.saves,        accent: true },
      { label: 'CONCEDED',    val: p.conceded,      accent: false },
      { label: 'SAVE %',      val: p.save_pct != null ? `${p.save_pct}%` : '—', accent: true },
      { label: 'PASS ACC',    val: p.pass_accuracy ? `${p.pass_accuracy}%` : '—', accent: false },
      { label: 'APPS',        val: p.apps,          accent: false },
    ]
  }

  if (pos.includes('defender')) {
    return [
      { label: 'TACKLES',     val: p.tackles,        accent: true },
      { label: 'INTERCEPT',   val: p.interceptions,  accent: true },
      { label: 'BLOCKS',      val: p.blocks,         accent: false },
      { label: 'DUELS W%',    val: p.duels_won_pct != null ? `${p.duels_won_pct}%` : '—', accent: false },
      { label: 'KEY PASSES',  val: p.key_passes,     accent: false },
      { label: 'FOULS',       val: p.fouls_committed, accent: false },
    ]
  }

  if (pos.includes('midfielder')) {
    return [
      { label: 'KEY PASSES',  val: p.key_passes,     accent: true },
      { label: 'PASS ACC',    val: p.pass_accuracy ? `${p.pass_accuracy}%` : '—', accent: true },
      { label: 'DRIBBLES',    val: p.dribbles,       accent: false },
      { label: 'TACKLES',     val: p.tackles,        accent: false },
      { label: 'GOALS',       val: p.goals,          accent: false },
      { label: 'ASSISTS',     val: p.assists,        accent: false },
    ]
  }

  // Attacker / Forward (default)
  return [
    { label: 'GOALS',         val: p.goals,          accent: true },
    { label: 'ASSISTS',       val: p.assists,        accent: true },
    { label: 'SHOTS',         val: p.shots_total,    accent: false },
    { label: 'ON TARGET',     val: p.shots_on,       accent: false },
    { label: 'DRIBBLES',      val: p.dribbles,       accent: false },
    { label: 'FOULS DRAWN',   val: p.fouls_drawn,    accent: false },
  ]
}

function posColor(pos: string) {
  const p = (pos || '').toLowerCase()
  if (p.includes('goalkeeper')) return '#a78bfa'
  if (p.includes('defender'))   return '#60a5fa'
  if (p.includes('midfielder')) return '#fbbf24'
  return '#39ffb4'
}

function ratingColor(r: number) {
  if (r >= 8.0) return '#39ffb4'
  if (r >= 7.0) return '#fbbf24'
  return 'var(--text-dim)'
}

function posShort(pos: string) {
  const p = (pos || '').toLowerCase()
  if (p.includes('goalkeeper')) return 'GK'
  if (p.includes('defender'))   return 'DF'
  if (p.includes('midfielder')) return 'MF'
  return 'FW'
}

// ── Player Card ────────────────────────────────────────────────────────────

function PlayerCard({ p, rank }: { p: any; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  const stats = roleStats(p)
  const pColor = posColor(p.position)

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: 'var(--bg2)',
        borderLeft: `3px solid ${pColor}`,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'background 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg2)' }}
    >
      {/* Rank watermark */}
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 36,
        letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none',
      }}>
        {String(rank).padStart(2, '0')}
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
        {p.photo && (
          <img src={p.photo} alt={p.name}
            style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${pColor}33`, flexShrink: 0 }}
            onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.name}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.1em', padding: '1px 6px', background: `${pColor}18`, border: `1px solid ${pColor}44`, color: pColor }}>
              {posShort(p.position)}
            </span>
            {p.age && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                {p.age}Y
              </span>
            )}
            {p.nationality && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.05em' }}>
                {p.nationality}
              </span>
            )}
            {p.injured && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--accent2)', border: '1px solid var(--accent2)', padding: '1px 4px', letterSpacing: '0.1em' }}>
                INJ
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        {p.rating > 0 && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: ratingColor(p.rating), lineHeight: 1 }}>
              {p.rating.toFixed(1)}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em' }}>RATING</div>
          </div>
        )}
      </div>

      {/* Role-based stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`,
        gap: 6,
        marginBottom: 14,
        paddingTop: 12,
        borderTop: '1px solid var(--border)',
      }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 7, letterSpacing: '0.12em', color: s.accent ? pColor : 'var(--muted)', marginBottom: 3, textTransform: 'uppercase' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: s.accent ? 20 : 16, letterSpacing: '-0.02em', color: s.accent ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1 }}>
              {s.val ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Market value strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 7, letterSpacing: '0.15em', color: 'var(--muted)', marginBottom: 2 }}>EST. MARKET VALUE</div>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--accent)', lineHeight: 1 }}>
            {p.value_range}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '0.1em' }}>MIN</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{p.minutes?.toLocaleString()}</div>
          </div>
          {(p.yellow > 0 || p.red > 0) && (
            <div style={{ display: 'flex', gap: 4 }}>
              {p.yellow > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#fbbf24' }}>{p.yellow}Y</span>}
              {p.red > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent2)' }}>{p.red}R</span>}
            </div>
          )}
        </div>
      </div>

      {/* Expanded: full breakdown */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.2em', color: pColor, marginBottom: 10 }}>FULL STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { l: 'APPS',        v: p.apps },
              { l: 'MINUTES',     v: p.minutes?.toLocaleString() },
              { l: 'GOALS',       v: p.goals },
              { l: 'ASSISTS',     v: p.assists },
              { l: 'SHOTS',       v: p.shots_total },
              { l: 'ON TARGET',   v: p.shots_on },
              { l: 'KEY PASSES',  v: p.key_passes },
              { l: 'PASS ACC',    v: p.pass_accuracy ? `${p.pass_accuracy}%` : '—' },
              { l: 'TACKLES',     v: p.tackles },
              { l: 'INTERCEPT',   v: p.interceptions },
              { l: 'BLOCKS',      v: p.blocks },
              { l: 'DRIBBLES',    v: p.dribbles },
              { l: 'DUELS W%',    v: p.duels_won_pct != null ? `${p.duels_won_pct}%` : '—' },
              { l: 'FOULS COM',   v: p.fouls_committed },
              { l: 'FOULS DRAW',  v: p.fouls_drawn },
              ...(p.saves > 0 ? [
                { l: 'SAVES',     v: p.saves },
                { l: 'CONCEDED',  v: p.conceded },
                { l: 'SAVE %',    v: p.save_pct != null ? `${p.save_pct}%` : '—' },
              ] : []),
            ].map(({ l, v }) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 2 }}>{l}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>{v ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--muted)', textAlign: 'center', letterSpacing: '0.1em', opacity: 0.5 }}>
        {expanded ? 'CLICK TO COLLAPSE' : 'CLICK FOR FULL BREAKDOWN'}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function LeaguePage() {
  const [teamId, setTeamId]       = useState<number>(42)
  const [posFilter, setPosFilter] = useState<Pos>('All')
  const [sortBy, setSortBy]       = useState('rating')
  const [players, setPlayers]     = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [searched, setSearched]   = useState(false)
  const [teamName, setTeamName]   = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/league?team=${teamId}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlayers(data.players || [])
      setTeamName(data.teamName || '')
      setSearched(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = players
    .filter(p => posFilter === 'All' || (p.position || '').toLowerCase().includes(posFilter.toLowerCase()))
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))

  const stats = players.length > 0 ? {
    totalGoals:   players.reduce((s, p) => s + (p.goals || 0), 0),
    totalAssists: players.reduce((s, p) => s + (p.assists || 0), 0),
    avgRating:    (players.reduce((s, p) => s + (p.rating || 0), 0) / players.filter(p => p.rating > 0).length || 0).toFixed(2),
    avgValue:     Math.round(players.reduce((s, p) => s + (p.value || 0), 0) / players.length),
  } : null

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* Page header */}
        <div style={{ borderBottom: '1px solid var(--border)', padding: '28px 40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 6 }}>04 / PREMIER LEAGUE</div>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1 }}>
              Squad <span style={{ color: 'var(--accent)' }}>Intelligence</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'FW — Goals, Shots, xG',          color: '#39ffb4' },
              { label: 'MF — Key Passes, Creativity',    color: '#fbbf24' },
              { label: 'DF — Tackles, Interceptions',    color: '#60a5fa' },
              { label: 'GK — Saves, Prevented Goals',    color: '#a78bfa' },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 3, height: 14, background: color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)', padding: '18px 40px', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Team picker */}
          <div style={{ flex: '1 1 220px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>TEAM</label>
            <select
              value={teamId}
              onChange={e => { setTeamId(Number(e.target.value)); setSearched(false); setPlayers([]) }}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11, outline: 'none', cursor: 'pointer' }}
            >
              {Object.entries(PL_TEAMS).sort((a, b) => a[1].localeCompare(b[1])).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>SORT BY</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11, outline: 'none', cursor: 'pointer' }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.val} value={o.val}>{o.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: '10px 32px', height: 42,
              background: loading ? 'var(--bg3)' : 'var(--accent)',
              color: loading ? 'var(--muted)' : '#050505',
              fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.15em', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 24px var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
          >
            {loading ? 'LOADING...' : '⚡ LOAD SQUAD'}
          </button>
        </div>

        {/* Position filter tabs */}
        {searched && players.length > 0 && (
          <div style={{ borderBottom: '1px solid var(--border)', padding: '0 40px', display: 'flex', gap: 0 }}>
            {POSITIONS.map(pos => {
              const count = pos === 'All'
                ? players.length
                : players.filter(p => (p.position || '').toLowerCase().includes(pos.toLowerCase())).length
              const active = posFilter === pos
              const col = pos === 'All' ? 'var(--accent)' : posColor(pos)
              return (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  style={{
                    padding: '14px 20px', background: 'transparent',
                    border: 'none', borderBottom: active ? `2px solid ${col}` : '2px solid transparent',
                    color: active ? col : 'var(--muted)',
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em',
                    cursor: 'pointer', transition: 'all 0.15s', fontWeight: active ? 700 : 400,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {pos === 'All' ? 'ALL' : pos.slice(0, 2).toUpperCase()}
                  <span style={{ opacity: 0.5, fontSize: 9 }}>{count}</span>
                </button>
              )
            })}

            {/* Squad KPIs */}
            {stats && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, alignItems: 'center', paddingRight: 0 }}>
                {[
                  { l: 'SQUAD GOALS',   v: stats.totalGoals },
                  { l: 'SQUAD ASSISTS', v: stats.totalAssists },
                  { l: 'AVG RATING',    v: stats.avgRating },
                  { l: 'AVG VALUE',     v: `£${stats.avgValue}M` },
                ].map(({ l, v }) => (
                  <div key={l} style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 7, letterSpacing: '0.15em', color: 'var(--muted)' }}>{l}</div>
                    <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--accent)', lineHeight: 1 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '14px 40px', borderBottom: '1px solid var(--border)', background: 'rgba(255,61,90,0.06)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent2)', letterSpacing: '0.1em' }}>
            ⚠ {error}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, padding: '32px 40px 80px' }}>

          {/* Empty / initial */}
          {!searched && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16, opacity: 0.4 }}>
              <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 72, letterSpacing: '-0.04em', color: 'var(--border-strong)', lineHeight: 1 }}>PL</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--muted)' }}>SELECT A TEAM AND HIT ⚡ LOAD SQUAD</div>
            </div>
          )}

          {/* Results header */}
          {searched && !loading && filtered.length > 0 && (
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 2, height: 24, background: 'var(--accent)' }} />
              <span style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: 'var(--text)' }}>
                {teamName}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--muted)', marginLeft: 4 }}>
                · {filtered.length} {posFilter === 'All' ? 'PLAYERS' : posFilter.toUpperCase() + 'S'}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)', border: '1px solid var(--border)', padding: '3px 8px', marginLeft: 8 }}>
                2024/25
              </span>
            </div>
          )}

          {/* Player cards grid */}
          {filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: 'var(--border)' }}>
              {filtered.map((p, i) => (
                <div key={p.id || p.name} style={{ background: 'var(--bg)' }}>
                  <PlayerCard p={p} rank={i + 1} />
                </div>
              ))}
            </div>
          )}

          {searched && !loading && filtered.length === 0 && players.length > 0 && (
            <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', padding: '80px 0', letterSpacing: '0.15em' }}>
              NO {posFilter.toUpperCase()}S IN THIS SQUAD
            </div>
          )}
        </div>

        {/* Note on market values */}
        {searched && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 40px' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)' }}>
              ⚠ Market value estimates are algorithmic (age × performance × rating). For verified values, cross-reference Transfermarkt. Cards are sorted by {SORT_OPTIONS.find(o => o.val === sortBy)?.label}.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
