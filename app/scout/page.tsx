'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import AIChat from '@/components/AIChat'
import { useStore } from '@/lib/store'

const LEAGUES_2425 = [
  { name: 'Premier League', id: 39, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga', id: 140, flag: '🇪🇸' },
  { name: 'Serie A', id: 135, flag: '🇮🇹' },
  { name: 'Bundesliga', id: 78, flag: '🇩🇪' },
  { name: 'Ligue 1', id: 61, flag: '🇫🇷' },
  { name: 'Primeira Liga', id: 94, flag: '🇵🇹' },
  { name: 'Eredivisie', id: 88, flag: '🇳🇱' },
  { name: 'Saudi Pro League', id: 307, flag: '🇸🇦' },
  { name: 'MLS', id: 253, flag: '🇺🇸' },
]
const POSITIONS = ['All', 'Attacker', 'Midfielder', 'Defender', 'Goalkeeper']
const POSITIONS_2526 = ['All', 'F', 'M', 'D']

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

export default function ScoutPage() {
  const { players: myPlayers } = useStore()
  const [season, setSeason] = useState<'2425' | '2526'>('2526')
  const [league, setLeague] = useState(39)
  const [position, setPosition] = useState('All')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)

  async function search() {
    setLoading(true)
    setError('')
    try {
      let url = ''
      if (season === '2526') {
        url = `/api/scout-2526?position=${position}`
      } else {
        url = `/api/scout?league=${league}&season=2024&position=${position}`
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

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 120px' }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 8 }}>
                  [ GLOBAL SCOUT ]
                </p>
                <h1 style={{ fontFamily: 'var(--sans)', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1 }}>
                  Find Your<br />
                  <span style={{ color: 'var(--accent)' }}>Next Signing</span>
                </h1>
              </div>
              {myBestEff !== null && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', border: '1px solid var(--border)', padding: '8px 16px' }}>
                  YOUR BEST EFF: <span style={{ color: effColor(myBestEff) }}>{myBestEff.toFixed(2)} G+A/90</span>
                </div>
              )}
            </div>
            <div style={{ height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)', marginTop: 24 }} />
          </div>

          {/* Season toggle */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1px solid var(--border)', width: 'fit-content' }}>
            {[
              { val: '2526', label: '2025/26  LIVE' },
              { val: '2425', label: '2024/25  ARCHIVE' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => { setSeason(val as any); setResults([]); setSearched(false); }}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  padding: '10px 20px',
                  background: season === val ? 'var(--accent)' : 'transparent',
                  color: season === val ? '#070707' : 'var(--muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {val === '2526' && <span style={{ marginRight: 6, fontSize: 8 }}>●</span>}
                {label}
              </button>
            ))}
          </div>

          {/* Search controls */}
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            padding: 24,
            marginBottom: 32,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              {season === '2425' && (
                <div>
                  <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>LEAGUE</label>
                  <select
                    value={league}
                    onChange={e => setLeague(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', fontSize: 12 }}
                  >
                    {LEAGUES_2425.map(l => (
                      <option key={l.id} value={l.id}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>POSITION</label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 12 }}
                >
                  {(season === '2526' ? POSITIONS_2526 : POSITIONS).map(p => (
                    <option key={p} value={p}>{p === 'All' ? 'ALL POSITIONS' : p.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={search}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 20px',
                    background: 'var(--accent)',
                    color: '#070707',
                    fontFamily: 'var(--mono)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.15em',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? 'SEARCHING...' : '⚡ SEARCH'}
                </button>
              </div>
            </div>

            {season === '2526' && (
              <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                ● LIVE DATA · Premier League 2025/26 · Sourced from Understat · Updated daily
              </p>
            )}
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontFamily: 'var(--mono)', fontSize: 11, padding: '12px 16px', marginBottom: 24, letterSpacing: '0.1em' }}>
              ERROR: {error}
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', padding: '80px 0', letterSpacing: '0.1em' }}>
              NO PLAYERS FOUND
            </div>
          )}

          {results.length > 0 && (
            <>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 20 }}>
                {results.length} PLAYERS · RANKED BY EFFICIENCY (G+A PER 90)
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1 }}>
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
                        background: isSelected ? 'rgba(57,255,180,0.04)' : 'var(--bg2)',
                        border: `1px solid ${isSelected ? 'var(--border-strong)' : 'var(--border)'}`,
                        padding: 20,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                      onMouseEnter={e => !isSelected && ((e.currentTarget as HTMLElement).style.background = 'var(--bg3)')}
                      onMouseLeave={e => !isSelected && ((e.currentTarget as HTMLElement).style.background = 'var(--bg2)')}
                    >
                      {/* Rank */}
                      <div style={{ position: 'absolute', top: 12, right: 12, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                        #{i + 1}
                      </div>

                      {/* Player header */}
                      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                        {p.photo && (
                          <img src={p.photo} alt={p.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', background: 'var(--bg3)' }}
                            onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                        )}
                        <div>
                          <div style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>
                            {p.name}
                          </div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                            {p.team}
                            {p.injured && <span style={{ marginLeft: 8, color: '#f87171', fontSize: 9 }}>INJ</span>}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                        {[p.position, p.age ? `AGE ${p.age}` : null, p.nationality, p.league].filter(Boolean).map(tag => (
                          <span key={tag} style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', padding: '2px 6px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14, textAlign: 'center' }}>
                        {[
                          { label: 'APPS', val: p.appearances ?? p.apps ?? '—' },
                          { label: 'G', val: p.goals },
                          { label: 'A', val: p.assists },
                          { label: 'MINS', val: p.minutes },
                        ].map(s => (
                          <div key={s.label}>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>{s.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* xG row (2526 only) */}
                      {p.xg !== undefined && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14, textAlign: 'center' }}>
                          {[
                            { label: 'xG', val: p.xg },
                            { label: 'xA', val: p.xa },
                            { label: 'xG/90', val: p.xg90 },
                            { label: 'xA/90', val: p.xa90 },
                          ].map(s => (
                            <div key={s.label}>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 2 }}>{s.label}</div>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-dim)' }}>{s.val}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Efficiency bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em' }}>G+A/90</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: effColor(p.efficiency), letterSpacing: '0.1em' }}>
                            {effLabel(p.efficiency)} · {p.efficiency}
                          </span>
                        </div>
                        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
                          <div style={{ height: 2, borderRadius: 1, background: effColor(p.efficiency), width: `${Math.min((p.efficiency / 1.5) * 100, 100)}%`, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>

                      {/* VS my squad (when selected) */}
                      {isSelected && myPlayers.length > 0 && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                          <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 8 }}>VS YOUR SQUAD</p>
                          {myComparables.map(mc => (
                            <div key={mc.name} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, marginBottom: 4 }}>
                              <span style={{ color: 'var(--muted)' }}>{mc.name}</span>
                              <span style={{ color: p.efficiency > mc.eff ? 'var(--accent)' : '#f87171' }}>
                                {p.efficiency > mc.eff ? '▲' : '▼'} {Math.abs(p.efficiency - mc.eff).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', textAlign: 'center', letterSpacing: '0.1em' }}>
                        {isSelected ? '✓ SELECTED' : 'CLICK TO COMPARE'}
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
