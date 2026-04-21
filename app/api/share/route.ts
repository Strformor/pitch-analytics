import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const MAX_PLAYERS = 100
const MAX_LABEL_LEN = 120

// Simple burst guard — max 5 share actions per IP per minute
const shareRateMap = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = shareRateMap.get(ip)
  if (!entry || now - entry.windowStart > 60_000) {
    shareRateMap.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count++
  return entry.count > 5
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  // Body size guard (100 KB max)
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 100_000) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { players, label } = body

  // Validate players array
  if (!Array.isArray(players) || players.length === 0) {
    return NextResponse.json({ error: 'No players provided.' }, { status: 400 })
  }
  if (players.length > MAX_PLAYERS) {
    return NextResponse.json({ error: `Max ${MAX_PLAYERS} players per snapshot.` }, { status: 400 })
  }

  // Sanitise label
  const safeLabel = typeof label === 'string'
    ? label.slice(0, MAX_LABEL_LEN).replace(/[<>"']/g, '')
    : 'Unnamed Squad'

  const { data, error } = await supabaseServer
    .from("snapshots")
    .insert({ players: players.slice(0, MAX_PLAYERS), label: safeLabel })
    .select("id")
    .single()

  if (error) {
    console.error('[share] Supabase error:', error.code)
    return NextResponse.json({ error: 'Could not save snapshot. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
