'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import AuthGuard from '@/components/AuthGuard'
import { useStore } from '@/lib/store'

const LEAGUES = [
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

function efficiencyColor(val: number) {
  if (val >= 0.6) return 'text-[#39ffb4]'
  if (val >= 0.3) return 'text-yellow-400'
  return 'text-red-400'
}

function efficiencyLabel(val: number) {
  if (val >= 0.6) return 'ELITE'
  if (val >= 0.3) return 'SOLID'
  if (val > 0) return 'LOW'
  return 'N/A'
}

export default function ScoutPage() {
  const { players: myPlayers } = useStore()
  const [league, setLeague] = useState(39)
  const [position, setPosition] = useState('All')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [comparePlayer, setComparePlayer] = useState<any>(null)

  async function search() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/scout?league=${league}&season=2024&position=${position}`
      )
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

  const myTeamAvgEfficiency =
    myPlayers.length > 0
      ? myPlayers.reduce((sum, p) => {
          const eff =
            p.MinutesPlayed > 0
              ? ((p.Goals + p.Assists) / p.MinutesPlayed) * 90
              : 0
          return sum + eff
        }, 0) / myPlayers.length
      : null

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0e0a] text-white">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-mono text-[#39ffb4] text-lg tracking-widest">
              [ GLOBAL SCOUT ]
            </h1>
            {myTeamAvgEfficiency !== null && (
              <div className="font-mono text-xs text-gray-400 border border-[#1a3a1a] px-4 py-2 rounded">
                YOUR TEAM AVG EFFICIENCY:{' '}
                <span className={efficiencyColor(myTeamAvgEfficiency)}>
                  {myTeamAvgEfficiency.toFixed(2)} G+A/90
                </span>
              </div>
            )}
          </div>

          {/* Search Controls */}
          <div className="bg-[#0f1a0f] border border-[#1a3a1a] rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* League */}
              <div>
                <label className="font-mono text-xs text-gray-400 tracking-widest block mb-2">
                  LEAGUE
                </label>
                <select
                  value={league}
                  onChange={(e) => setLeague(Number(e.target.value))}
                  className="w-full bg-[#0a0e0a] border border-[#1a3a1a] text-white font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-[#39ffb4]"
                >
                  {LEAGUES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="font-mono text-xs text-gray-400 tracking-widest block mb-2">
                  POSITION
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-[#0a0e0a] border border-[#1a3a1a] text-white font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-[#39ffb4]"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season (fixed for now) */}
              <div>
                <label className="font-mono text-xs text-gray-400 tracking-widest block mb-2">
                  SEASON
                </label>
                <div className="w-full bg-[#0a0e0a] border border-[#1a3a1a] text-gray-400 font-mono text-sm px-3 py-2 rounded">
                  2024 / 2025
                </div>
              </div>
            </div>

            <button
              onClick={() => search()}
              disabled={loading}
              className="w-full bg-[#39ffb4] text-black font-mono font-bold tracking-widest py-3 rounded hover:bg-[#00e09a] transition-colors disabled:opacity-50"
            >
              {loading ? 'SEARCHING...' : '⚡ SEARCH PLAYERS'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-400 font-mono text-sm px-4 py-3 rounded mb-6">
              ERROR: {error}
            </div>
          )}

          {/* Results */}
          {searched && !loading && results.length === 0 && (
            <div className="text-center font-mono text-gray-500 py-16">
              NO PLAYERS FOUND FOR THIS FILTER.
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="font-mono text-xs text-gray-500 mb-4 tracking-widest">
                {results.length} PLAYERS · SORTED BY EFFICIENCY (G+A PER 90 MIN)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {results.map((player) => (
                  <div
                    key={player.id}
                    className={`bg-[#0f1a0f] border rounded-lg p-4 hover:border-[#39ffb4] transition-all cursor-pointer ${
                      comparePlayer?.id === player.id
                        ? 'border-[#39ffb4]'
                        : 'border-[#1a3a1a]'
                    }`}
                    onClick={() =>
                      setComparePlayer(
                        comparePlayer?.id === player.id ? null : player
                      )
                    }
                  >
                    {/* Player Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-12 h-12 rounded-full bg-[#1a3a1a] object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'https://media.api-sports.io/football/players/0.png'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono font-bold text-white text-sm truncate">
                          {player.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <img
                            src={player.teamLogo}
                            alt={player.team}
                            className="w-4 h-4 object-contain"
                          />
                          <span className="font-mono text-xs text-gray-400 truncate">
                            {player.team}
                          </span>
                        </div>
                      </div>
                      {player.injured && (
                        <span className="text-xs bg-red-900/50 text-red-400 font-mono px-2 py-0.5 rounded border border-red-800">
                          INJ
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mb-3">
                      <span className="font-mono text-xs bg-[#0a1a0a] border border-[#1a3a1a] px-2 py-0.5 rounded text-gray-400">
                        {player.position?.toUpperCase() || 'N/A'}
                      </span>
                      <span className="font-mono text-xs bg-[#0a1a0a] border border-[#1a3a1a] px-2 py-0.5 rounded text-gray-400">
                        AGE {player.age}
                      </span>
                      <span className="font-mono text-xs bg-[#0a1a0a] border border-[#1a3a1a] px-2 py-0.5 rounded text-gray-400">
                        {player.nationality}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label: 'APPS', val: player.appearances },
                        { label: 'G', val: player.goals },
                        { label: 'A', val: player.assists },
                        { label: 'MINS', val: player.minutes },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <div className="font-mono text-xs text-gray-500">
                            {s.label}
                          </div>
                          <div className="font-mono text-sm text-white font-bold">
                            {s.val}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Efficiency Bar */}
                    <div className="border-t border-[#1a3a1a] pt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-xs text-gray-500">
                          EFFICIENCY (G+A/90)
                        </span>
                        <span
                          className={`font-mono text-xs font-bold ${efficiencyColor(player.efficiency)}`}
                        >
                          {efficiencyLabel(player.efficiency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#0a1a0a] rounded-full h-1.5">
                          <div
                            className="bg-[#39ffb4] h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.min((player.efficiency / 1.2) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`font-mono text-xs font-bold ${efficiencyColor(player.efficiency)}`}
                        >
                          {player.efficiency}
                        </span>
                      </div>
                    </div>

                    {/* Compare hint */}
                    <div className="mt-2 text-center">
                      <span className="font-mono text-xs text-gray-600">
                        {comparePlayer?.id === player.id
                          ? '✓ SELECTED FOR COMPARISON'
                          : 'CLICK TO COMPARE'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </>
          )}

          {/* Comparison Panel */}
          {comparePlayer && myPlayers.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#0a0e0a] border-t border-[#39ffb4] p-4 z-50">
              <div className="max-w-7xl mx-auto">
                <div className="font-mono text-xs text-[#39ffb4] tracking-widest mb-3">
                  [ COMPARING: {comparePlayer.name.toUpperCase()} VS YOUR SQUAD ]
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {myPlayers.map((mp) => {
                    const myEff =
                      mp.MinutesPlayed > 0
                        ? ((mp.Goals + mp.Assists) / mp.MinutesPlayed) * 90
                        : 0
                    const better = comparePlayer.efficiency > myEff
                    return (
                      <div
                        key={mp.PlayerID}
                        className="bg-[#0f1a0f] border border-[#1a3a1a] rounded p-3"
                      >
                        <div className="font-mono text-xs text-gray-400 mb-1 truncate">
                          vs {mp.Name}
                        </div>
                        <div className="flex justify-between font-mono text-xs">
                          <span
                            className={efficiencyColor(
                              comparePlayer.efficiency
                            )}
                          >
                            {comparePlayer.efficiency} G+A/90
                          </span>
                          <span className="text-gray-600">vs</span>
                          <span className={efficiencyColor(myEff)}>
                            {myEff.toFixed(2)} G+A/90
                          </span>
                        </div>
                        <div
                          className={`font-mono text-xs mt-1 text-center ${better ? 'text-[#39ffb4]' : 'text-red-400'}`}
                        >
                          {better
                            ? `▲ +${(comparePlayer.efficiency - myEff).toFixed(2)} UPGRADE`
                            : `▼ ${(myEff - comparePlayer.efficiency).toFixed(2)} DOWNGRADE`}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => setComparePlayer(null)}
                  className="mt-3 font-mono text-xs text-gray-500 hover:text-white"
                >
                  CLOSE ✕
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
