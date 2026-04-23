'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import AIChat from '@/components/AIChat'
import { useStore } from '@/lib/store'

const POSITIONS = ['All', 'F', 'M', 'D']

function effColor(v: number) {
  if (v >= 0.7) return '#39ffb4'
  if (v >= 0.4) return '#fbbf24'
  return '#f87171'
}
function effLabel(v: number) {
  if (v >= 0.7) return 'ELITE'
  if (v >= 0.4) return 'SOLID'
  if (v > 0) return 'LOW'
  return '—'
}

// Role colour by position string (handles 'F','M','D' and full names)
function posColor(pos: string) {
  const p = (pos || '').toLowerCase()
  if (p === 'gk' || p.includes('goalkeeper')) return '#a78bfa'
  if (p === 'd'  || p.includes('defender'))   return '#60a5fa'
  if (p === 'm'  || p.includes('midfielder')) return '#fbbf24'
  return '#39ffb4' // FW / Attacker
}

// Role-based primary stats to show (given limited scout data)
function scoutRoleStats(p: any) {
  const pos = (p.position || '').toLowerCase()

  if (pos === 'd' || pos.includes('defender')) {
    return [
      { label: 'APPS',    val: p.appearances ?? p.apps ?? '—' },
      { label: 'G+A',     val: (p.goals ?? 0) + (p.assists ?? 0) },
      { label: 'MINS',    val: p.minutes },
    ]
  }
  if (pos === 'm' || pos.includes('midfielder')) {
    return [
      { label: 'ASSISTS', val: p.assists },
      { label: 'GOALS',   val: p.goals },
      { label: 'APPS',    val: p.appearances ?? p.apps ?? '—' },
      { label: 'MINS',    val: p.minutes },
    ]
  }
  // FW / default
  return [
    { label: 'GOALS',   val: p.goals },
    { label: 'ASSISTS', val: p.assists },
    { label: 'APPS',    val: p.appearances ?? p.apps ?? '—' },
    { label: 'MINS',    val: p.minutes },
  ]
}

export default function ScoutPage() {
  const { players: myPlayers } = useStore()
  const [season, setSeason] = useState<'2425' | '2526'>('2526')
  const [position, setPosition] = useState('All')
  const [league, setLeague] = useState('All')
  const [leagues, setLeagues] = useState<string[]>(['All'])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)

  // Load available leagues dynamically from whichever season is selected
  useEffect(() => {
    setLeague('All')
    setLeagues(['All'])
    fetch(`/api/league?season=${season}`)
      .then(r => r.json())
      .then(data => {
        if (data.leagueMap) {
          setLeagues(['All', ...Object.keys(data.leagueMap).sort()])
        }
      })
      .catch(() => {})
  }, [season])

  async function search() {
    setLoading(true)
    setError('')
    try {
      let url = ''
      if (season === '2526') {
        url = `/api/scout-2526?position=${position}&league=${league}`
      } else {
        url = `/api/scout-2425?position=${position}&league=${league}`
      }
      const res = await fetch(url)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResults(data.players || [])
      setSearched(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const myBestEff = myPlayers.length > 0
    ? Math.max(...myPlayers.map(p => p.MinutesPlayed > 0 ? ((p.Goals + p.Assists) / p.MinutesPlayed) * 90 : 0))
    : null

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: 11,
    padding: '10px 14px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    letterSpacing: '0.05em',
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* Page header */}
        <div style={{
          borderBottom: '1px solid var(--border)',
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 6 }}>03 / GLOBAL SCOUT</div>
            <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1 }}>
              Find Your Next <span style={{ color: 'var(--accent)' }}>Signing</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {myBestEff !== null && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', border: '1px solid var(--border)', padding: '8px 16px' }}>
                YOUR BEST: <span style={{ color: effColor(myBestEff), fontWeight: 700 }}>{myBestEff.toFixed(2)} G+A/90</span>
              </div>
            )}

            {/* Season toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border)' }}>
              {[
                { val: '2526', label: '2025/26', live: true },
                { val: '2425', label: '2024/25', live: false },
              ].map(({ val, label, live }) => (
                <button
                  key={val}
                  onClick={() => { setSeason(val as any); setResults([]); setSearched(false); setLeague('All') }}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    padding: '10px 20px',
                    background: season === val ? 'var(--accent)' : 'transparent',
                    color: season === val ? '#050505' : 'var(--muted)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: season === val ? 700 : 400,
                  }}
                >
                  {live && (
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: season === val ? '#050505' : 'var(--accent)',
                      display: 'inline-block',
                      flexShrink: 0,
                    }} />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)', padding: '20px 40px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>LEAGUE</label>
              <select value={league} onChange={e => setLeague(e.target.value)} style={selectStyle}>
                {leagues.map(l => (
                  <option key={l} value={l}>{l === 'All' ? 'ALL LEAGUES' : l}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>POSITION</label>
              <select value={position} onChange={e => setPosition(e.target.value)} style={selectStyle}>
                {POSITIONS.map(p => (
                  <option key={p} value={p}>{p === 'All' ? 'ALL POSITIONS' : p.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <button
              onClick={search}
              disabled={loading}
              style={{
                padding: '10px 32px',
                background: loading ? 'var(--bg3)' : 'var(--accent)',
                color: loading ? 'var(--muted)' : '#050505',
                fontFamily: 'var(--mono)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.15em',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                height: 42,
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 24px var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              {loading ? 'SEARCHING...' : '⚡ SEARCH'}
            </button>

            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
              {season === '2526'
                ? <><span style={{ color: 'var(--accent)' }}>●</span> 2025/26 · STATPAL · LIVE</>
                : <><span style={{ color: 'var(--muted)' }}>◆</span> 2024/25 · SUPABASE</>
              }
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '14px 40px', borderBottom: '1px solid var(--border)', background: 'rgba(255,61,90,0.06)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent2)', letterSpacing: '0.1em' }}>
            ⚠ {error}
          </div>
        )}

        {/* Results area */}
        <div style={{ flex: 1, padding: '32px 40px 120px' }}>
          {/* Empty / initial state */}
          {!searched && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16, opacity: 0.5 }}>
              <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 64, letterSpacing: '-0.04em', color: 'var(--border-strong)', lineHeight: 1 }}>
                SEARCH
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--muted)' }}>
                SELECT FILTERS AND HIT ⚡ SEARCH
              </div>
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 12 }}>
              <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 48, letterSpacing: '-0.03em', color: 'var(--muted)', lineHeight: 1 }}>
                NO RESULTS
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)' }}>Try different filters</div>
            </div>
          )}

          {results.length > 0 && (
            <>
              {/* Results meta */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 2, height: 20, background: 'var(--accent)' }} />
                  <span style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                    {results.length}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Players · Ranked by G+A/90
                  </span>
                </div>
                {selected && (
                  <button
                    onClick={() => setSelected(null)}
                    style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--muted)', background: 'transparent', border: '1px solid var(--border)', padding: '6px 12px', cursor: 'pointer' }}
                  >
                    CLEAR SELECTION ✕
                  </button>
                )}
              </div>

              {/* Cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: 'var(--border)' }}>
                {results.map((p, i) => {
                  const isSelected = selected?.id === p.id || selected?.name === p.name
                  const myComparables = myPlayers.map(mp => {
                    const eff = mp.MinutesPlayed > 0 ? ((mp.Goals + mp.Assists) / mp.MinutesPlayed) * 90 : 0
                    return { name: mp.Name, eff }
                  })

                  return (
                    <div
                      key={p.id || p.name}
                      onClick={() => setSelected(isSelected ? null : p)}
                      style={{
                        background: isSelected ? 'rgba(57,255,180,0.05)' : 'var(--bg2)',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        position: 'relative',
                        borderLeft: `3px solid ${isSelected ? 'var(--accent)' : posColor(p.position)}`,
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg3)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg2)' }}
                    >
                      {/* Rank badge */}
                      <div style={{
                        position: 'absolute', top: 16, right: 16,
                        fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 28,
                        letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.04)', lineHeight: 1,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>

                      {/* Player info */}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, paddingRight: 40 }}>
                        {p.photo && (
                          <img src={p.photo} alt={p.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: 'var(--bg3)', border: `2px solid ${posColor(p.position)}33`, flexShrink: 0 }}
                            onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                        )}
                        <div>
                          <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1.2 }}>
                            {p.name}
                          </div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                            {p.team}
                            {p.injured && <span style={{ marginLeft: 8, color: 'var(--accent2)', fontSize: 8, border: '1px solid var(--accent2)', padding: '1px 4px' }}>INJ</span>}
                          </div>
                        </div>
                      </div>

                      {/* Role badge + tags */}
                      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Role label */}
                        {p.position && (
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em', padding: '2px 8px', background: `${posColor(p.position)}18`, border: `1px solid ${posColor(p.position)}44`, color: posColor(p.position) }}>
                            {p.position === 'F' ? 'FWD' : p.position === 'M' ? 'MID' : p.position === 'D' ? 'DEF' : p.position?.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                        {[p.age ? `${p.age}Y` : null, p.nationality, p.league].filter(Boolean).map(tag => (
                          <span key={tag} style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.1em', padding: '2px 6px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Role-based primary stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scoutRoleStats(p).length}, 1fr)`, gap: 4, marginBottom: 14, textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                        {scoutRoleStats(p).map(s => (
                          <div key={s.label}>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: posColor(p.position), letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</div>
                            <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 18, color: 'var(--text)', lineHeight: 1 }}>{s.val ?? '—'}</div>
                          </div>
                        ))}
                      </div>

                      {/* xG row (2526 only) — shown for forwards/midfielders */}
                      {p.xg !== undefined && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 14, textAlign: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                          {[
                            { label: 'xG', val: p.xg },
                            { label: 'xA', val: p.xa },
                            { label: 'xG/90', val: p.xg90 },
                            { label: 'xA/90', val: p.xa90 },
                          ].map(s => (
                            <div key={s.label}>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</div>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-dim)' }}>{s.val}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Efficiency bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em' }}>G+A/90</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: effColor(p.efficiency), letterSpacing: '0.1em' }}>
                            {effLabel(p.efficiency)} · {p.efficiency}
                          </span>
                        </div>
                        <div style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{
                            height: 2,
                            background: effColor(p.efficiency),
                            width: `${Math.min((p.efficiency / 1.5) * 100, 100)}%`,
                            transition: 'width 0.6s ease',
                            boxShadow: `0 0 8px ${effColor(p.efficiency)}66`,
                          }} />
                        </div>
                      </div>

                      {/* VS my squad (when selected) */}
                      {isSelected && myPlayers.length > 0 && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', animation: 'fadeUp 0.2s ease' }}>
                          <p style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 10 }}>VS YOUR SQUAD</p>
                          {myComparables.map(mc => (
                            <div key={mc.name} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, marginBottom: 6, alignItems: 'center' }}>
                              <span style={{ color: 'var(--muted)' }}>{mc.name}</span>
                              <span style={{
                                color: p.efficiency > mc.eff ? 'var(--accent)' : 'var(--accent2)',
                                fontWeight: 700,
                                fontSize: 11,
                              }}>
                                {p.efficiency > mc.eff ? '▲' : '▼'} {Math.abs(p.efficiency - mc.eff).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Click hint */}
                      <div style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 8, color: isSelected ? 'var(--accent)' : 'var(--muted)', textAlign: 'center', letterSpacing: '0.15em', opacity: 0.7 }}>
                        {isSelected ? '✓ SELECTED · CLICK TO DESELECT' : 'CLICK TO COMPARE VS SQUAD'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <AIChat scoutedPlayers={results} />
      </div>
    </AuthGuard>
  )
}
