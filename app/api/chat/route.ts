import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Simple in-memory rate limiter (per serverless instance — not cross-instance,
// but limits burst abuse within a single cold-start window)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT = 10      // max requests
const WINDOW_MS  = 60_000  // per 60 seconds

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  // Body size guard — reject anything over 50 KB
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 50_000) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }

  try {
    const body = await request.json()
    const { message, myPlayers, scoutedPlayers } = body

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }
    const safeMessage = message.slice(0, 500) // cap user input
    const safePlayers  = Array.isArray(myPlayers)      ? myPlayers.slice(0, 50)      : []
    const safeScouts   = Array.isArray(scoutedPlayers) ? scoutedPlayers.slice(0, 50) : []

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
      return NextResponse.json({
        reply: '⚠️ AI chat requires an Anthropic API key. Add ANTHROPIC_API_KEY to your Vercel environment variables.'
      })
    }

    const mySquadContext = safePlayers.length
      ? `MY CURRENT SQUAD:\n${safePlayers.map((p: any) =>
          `- ${String(p.Name).slice(0,40)} | ${p.Position} | Age:${p.Age} | G:${p.Goals} A:${p.Assists} | Eff:${
            p.MinutesPlayed > 0 ? (((p.Goals + p.Assists) / p.MinutesPlayed) * 90).toFixed(2) : '0.00'
          } G+A/90`
        ).join('\n')}`
      : 'No squad uploaded yet.'

    const scoutContext = safeScouts.length
      ? `SCOUTED PLAYERS:\n${safeScouts.map((p: any) =>
          `- ${String(p.name).slice(0,40)} | ${p.team} | ${p.position} | G:${p.goals} A:${p.assists} | xG:${p.xg} xA:${p.xa}`
        ).join('\n')}`
      : 'No scouted players loaded.'

    const systemPrompt = `You are an expert football scout and analyst for PITCH, a professional analytics platform. Be direct, data-driven, and concise.

${mySquadContext}

${scoutContext}

Rules:
- Always cite specific stats (G+A/90, goals, assists, xG)
- 3-5 sentences max per response
- Be bold with recommendations — no hedging
- Use football analytics language (xG, pressing, etc.)
- If comparing players, declare a clear winner`

    const response = await client.messages.create({
      model:      'claude-haiku-4-5',  // haiku: 50× cheaper than opus, fast, sufficient for this use case
      max_tokens: 300,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: safeMessage }],
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch {
    // Never leak internal error details to the client
    return NextResponse.json({ error: 'Scout unavailable. Try again shortly.' }, { status: 500 })
  }
}
