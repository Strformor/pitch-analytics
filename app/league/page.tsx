'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'

const SORT_OPTIONS = [
  { val: 'efficiency', label: 'G+A/90' },
  { val: 'goals',      label: 'Goals' },
  { val: 'assists',    label: 'Assists' },
  { val: 'xg',        label: 'xG' },
  { val: 'xa',        label: 'xA' },
  { val: 'minutes',   label: 'Minutes' },
]

type Pos = 'All' | 'F' | 'M' | 'D' | 'GK'
const POSITIONS: Pos[] = ['All', 'F', 'M', 'D', 'GK']

function posColor(pos: string) {
  const p = (pos || '').toUpperCase()
  if (p === 'GK') return '#a78bfa'
  if (p === 'D')  return '#60a5fa'
  if (p === 'M')  return '#fbbf24'
  return '#39ffb4'
}

function posLabel(pos: string) {
  const p = (pos || '').toUpperCase()
  if (p === 'GK') return 'GK'
  if (p === 'D')  return 'DEF'
  if (p === 'M')  return 'MID'
  return 'FWD'
}

function effColor(v: number) {
  if (v >= 0.7) return '#39ffb4'
  if (v >= 0.4) return '#fbbf24'
  return '#f87171'
}

function roleStats(p: any) {
  const pos = (p.position || '').toUpperCase()

  if (pos === 'GK') {
    return [
      { label: 'SAVED',    val: p.shots_saved  ?? '—', key: true  },
      { label: 'CLEANSH',  val: p.clean_sheets ?? '—', key: true  },
      { label: 'PASS%',    val: p.pass_accuracy != null ? `${p.pass_accuracy}%` : '—', key: false },
      { label: 'APPS',     val: p.apps,                key: false },
    ]
  }
  if (pos === 'D') {
    return [
      { label: 'FOULS',    val: p.fouls_committed ?? '—', key: false },
      { label: 'DUEL W',   val: p.challenges_won  ?? '—', key: true  },
      { label: 'KEY PASS', val: p.key_passes      ?? '—', key: true  },
      { label: 'APPS',     val: p.apps,                   key: false },
    ]
  }
  if (pos === 'M') {
    return [
      { label: 'ASSISTS', val: p.assists, key: true  },
      { label: 'GOALS',   val: p.goals,   key: true  },
      { label: 'xA',      val: p.xa,      key: false },
      { label: 'xG',      val: p.xg,      key: false },
    ]
  }
  // FW / default
  return [
    { label: 'GOALS',   val: p.goals,   key: true  },
    { label: 'ASSISTS', val: p.assists,  key: true  },
    { label: 'xG',      val: p.xg,      key: false },
    { label: 'xA',      val: p.xa,      key: false },
  ]
}

function PlayerCard({ p, rank }: { p: any; rank: number }) {
  const pColor = posColor(p.position)
  const stats  = roleStats(p)

  return (
    <div style={{
      background: 'var(--bg2)',
      borderLeft: `3px solid ${pColor}`,
      padding: '18px 20px',
      position: 'relative',
    }}>
      {/* Rank watermark */}
      <div style={{
        position: 'absolute', top: 12, right: 14,
        fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 36,
        letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none',
      }}>
        {String(rank).padStart(2, '0')}
      </div>

      {/* Name + badges */}
      <div style={{ marginBottom: 14, paddingRight: 40 }}>
        <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1.3 }}>
          {p.name}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em',
            padding: '2px 8px',
            background: `${pColor}18`, border: `1px solid ${pColor}44`, color: pColor,
          }}>
            {posLabel(p.position)}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em' }}>
            {p.apps} apps · {p.minutes?.toLocaleString()} min
          </span>
        </div>
      </div>

      {/* Role-based stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
        paddingTop: 12, borderTop: '1px solid var(--border)',
        marginBottom: 14, textAlign: 'center',
      }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 7, letterSpacing: '0.12em', color: s.key ? pColor : 'var(--muted)', marginBottom: 3 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: s.key ? 20 : 16, color: s.key ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1 }}>
              {s.val ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {/* xG90 / xA90 row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4,
        paddingBottom: 12, borderBottom: '1px solid var(--border)',
        marginBottom: 12, textAlign: 'center',
      }}>
        {[{ label: 'xG/90', val: p.xg90 }, { label: 'xA/90', val: p.xa90 }].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-dim)' }}>{s.val ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* G+A/90 bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em' }}>G+A/90</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: effColor(p.efficiency), letterSpacing: '0.1em' }}>
            {p.efficiency}
          </span>
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}>
          <div style={{
            height: 2, background: effColor(p.efficiency),
            width: `${Math.min((p.efficiency / 1.5) * 100, 100)}%`,
            boxShadow: `0 0 8px ${effColor(p.efficiency)}66`,
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function LeaguePage() {
  const [leagueMap, setLeagueMap]         = useState<Record<string, string[]>>({})
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedTeam, setSelectedTeam]   = useState('')
  const [season, setSeason]               = useState<'2425' | '2526'>('2425')
  const [posFilter, setPosFilter]         = useState<Pos>('All')
  const [sortBy, setSortBy]               = useState('efficiency')
  const [players, setPlayers]             = useState<any[]>([])
  const [loading, setLoading]             = useState(false)
  const [metaLoading, setMetaLoading]     = useState(true)
  const [error, setError]                 = useState('')
  const [searched, setSearched]           = useState(false)
  const [teamName, setTeamName]           = useState('')

  // Fetch league→team map whenever season changes
  useEffect(() => {
    setMetaLoading(true)
    setPlayers([])
    setSearched(false)
    setSelectedLeague('')
    setSelectedTeam('')

    fetch(`/api/league?season=${season}`)
      .then(r => r.json())
      .then(d => {
        if (d.leagueMap) {
          setLeagueMap(d.leagueMap)
          const firstLeague = Object.keys(d.leagueMap)[0] || ''
          setSelectedLeague(firstLeague)
          setSelectedTeam(d.leagueMap[firstLeague]?.[0] || '')
        }
      })
      .catch(() => {})
      .finally(() => setMetaLoading(false))
  }, [season])

  const teamsInLeague = leagueMap[selectedLeague] || []

  async function load() {
    if (!selectedTeam) return
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/league?team=${encodeURIComponent(selectedTeam)}&season=${season}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlayers(data.players || [])
      setTeamName(data.teamName || selectedTeam)
      setSearched(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = players
    .filter(p => posFilter === 'All' || p.position === posFilter)
    .sort((a, b) => {
      const av = typeof a[sortBy] === 'string' ? parseFloat(a[sortBy]) : (a[sortBy] || 0)
      const bv = typeof b[sortBy] === 'string' ? parseFloat(b[sortBy]) : (b[sortBy] || 0)
      return bv - av
    })

  const kpis = players.length > 0 ? {
    goals:   players.reduce((s, p) => s + (p.goals   || 0), 0),
    assists: players.reduce((s, p) => s + (p.assists  || 0), 0),
    xg:      players.reduce((s, p) => s + parseFloat(p.xg  || 0), 0).toFixed(1),
    xa:      players.reduce((s, p) => s + parseFloat(p.xa  || 0), 0).toFixed(1),
  } : null

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11,
    outline: 'none', cursor: 'pointer',
  }

  const leagues = Object.keys(leagueMap)

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* Page header */}
        <div style={{
          borderBottom: '1px solid var(--border)', padding: '28px 40px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 6 }}>04 / SQUAD INTELLIGENCE</div>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1 }}>
              Squad <span style={{ color: 'var(--accent)' }}>Intelligence</span>
            </div>
          </div>

          {/* Season toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)' }}>
            {([
              { val: '2526', label: '2025/26', live: true },
              { val: '2425', label: '2024/25', live: false },
            ] as const).map(({ val, label, live }) => (
              <button
                key={val}
                onClick={() => setSeason(val)}
                style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em',
                  padding: '10px 20px',
                  background: season === val ? 'var(--accent)' : 'transparent',
                  color: season === val ? '#050505' : 'var(--muted)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontWeight: season === val ? 700 : 400,
                }}
              >
                {live && (
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: season === val ? '#050505' : 'var(--accent)',
                    display: 'inline-block', flexShrink: 0,
                  }} />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{
          borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
          padding: '18px 40px', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap',
        }}>
          {/* League picker */}
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>LEAGUE</label>
            <select
              value={selectedLeague}
              onChange={e => {
                const l = e.target.value
                setSelectedLeague(l)
                setSelectedTeam(leagueMap[l]?.[0] || '')
                setPlayers([]); setSearched(false)
              }}
              style={selectStyle}
              disabled={metaLoading}
            >
              {leagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Team picker */}
          <div style={{ flex: '1 1 220px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>TEAM</label>
            <select
              value={selectedTeam}
              onChange={e => { setSelectedTeam(e.target.value); setPlayers([]); setSearched(false) }}
              style={selectStyle}
              disabled={metaLoading || !selectedLeague}
            >
              {teamsInLeague.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>SORT BY</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
              {SORT_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
          </div>

          <button
            onClick={load}
            disabled={loading || !selectedTeam}
            style={{
              padding: '10px 32px', height: 42,
              background: (loading || !selectedTeam) ? 'var(--bg3)' : 'var(--accent)',
              color: (loading || !selectedTeam) ? 'var(--muted)' : '#050505',
              fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.15em', border: 'none',
              cursor: (loading || !selectedTeam) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { if (!loading && selectedTeam) e.currentTarget.style.boxShadow = '0 0 24px var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
          >
            {loading ? 'LOADING...' : '⚡ LOAD SQUAD'}
          </button>

          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
            {season === '2526'
              ? <><span style={{ color: 'var(--accent)' }}>●</span> UNDERSTAT · LIVE</>
              : <><span style={{ color: 'var(--muted)' }}>◆</span> UNDERSTAT · 2024/25</>
            }
          </div>
        </div>

        {/* Position filter tabs + squad KPIs */}
        {searched && players.length > 0 && (
          <div style={{ borderBottom: '1px solid var(--border)', padding: '0 40px', display: 'flex', gap: 0, overflowX: 'auto' }}>
            {POSITIONS.map(pos => {
              const count  = pos === 'All' ? players.length : players.filter(p => p.position === pos).length
              const active = posFilter === pos
              const col    = pos === 'All' ? 'var(--accent)' : posColor(pos)
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
                    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                  }}
                >
                  {pos === 'All' ? 'ALL' : posLabel(pos)}
                  <span style={{ opacity: 0.5, fontSize: 9 }}>{count}</span>
                </button>
              )
            })}

            {kpis && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, alignItems: 'center', paddingLeft: 20 }}>
                {[
                  { l: 'GOALS',   v: kpis.goals },
                  { l: 'ASSISTS', v: kpis.assists },
                  { l: 'TOTAL xG', v: kpis.xg },
                  { l: 'TOTAL xA', v: kpis.xa },
                ].map(({ l, v }) => (
                  <div key={l} style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
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
          {!searched && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16, opacity: 0.4 }}>
              <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 72, letterSpacing: '-0.04em', color: 'var(--border-strong)', lineHeight: 1 }}>
                {metaLoading ? '···' : 'SQUAD'}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--muted)' }}>
                SELECT A TEAM AND HIT ⚡ LOAD SQUAD
              </div>
            </div>
          )}

          {searched && !loading && filtered.length > 0 && (
            <>
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ width: 2, height: 24, background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: 'var(--text)' }}>
                  {teamName}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--muted)' }}>
                  · {filtered.length} {posFilter === 'All' ? 'PLAYERS' : posLabel(posFilter) + 'S'}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)', border: '1px solid var(--border)', padding: '3px 8px' }}>
                  {season === '2526' ? '2025/26' : '2024/25'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: 'var(--border)' }}>
                {filtered.map((p, i) => (
                  <div key={p.id || p.name} style={{ background: 'var(--bg)' }}>
                    <PlayerCard p={p} rank={i + 1} />
                  </div>
                ))}
              </div>
            </>
          )}

          {searched && !loading && filtered.length === 0 && players.length > 0 && (
            <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', padding: '80px 0', letterSpacing: '0.15em' }}>
              NO {posFilter}S IN THIS SQUAD
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 40px' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)' }}>
            ◆ Stats sourced from Understat · Sorted by {SORT_OPTIONS.find(o => o.val === sortBy)?.label}
          </p>
        </div>
      </div>
    </AuthGuard>
  )
}
