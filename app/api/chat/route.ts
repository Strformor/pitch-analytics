import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { message, myPlayers, scoutedPlayers } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
      return NextResponse.json({
        reply: '⚠️ AI chat requires an Anthropic API key. Add ANTHROPIC_API_KEY to your environment variables on Vercel to enable this feature.'
      })
    }

    const mySquadContext = myPlayers?.length
      ? `MY CURRENT SQUAD:\n${myPlayers.map((p: any) =>
          `- ${p.Name} | ${p.Position} | Age:${p.Age} | Apps:${p.Appearances} | G:${p.Goals} A:${p.Assists} | Mins:${p.MinutesPlayed} | Cards:${p.YellowCards}Y ${p.RedCards}R`
        ).join('\n')}`
      : 'No squad uploaded yet.'

    const scoutContext = scoutedPlayers?.length
      ? `AVAILABLE PLAYERS (2025/26 Premier League):\n${scoutedPlayers.map((p: any) =>
          `- ${p.name} | ${p.team} | ${p.position} | G:${p.goals} A:${p.assists} | xG:${p.xg} xA:${p.xa} | Eff:${p.efficiency} G+A/90`
        ).join('\n')}`
      : 'No scouted players loaded.'

    const systemPrompt = `You are an expert football scout and analyst for PITCH, a professional analytics platform. You are direct, insightful, and data-driven.

${mySquadContext}

${scoutContext}

Your job:
1. Recommend players to SIGN based on position needs, efficiency, age, and value
2. Identify players to SELL or MOVE ON from based on underperformance (low efficiency, high cards, age)
3. Compare players head-to-head using stats
4. Answer tactical questions about squad balance

Rules:
- Always cite specific stats (G+A/90, goals, assists, xG)
- Be concise — 3-5 sentences max per response
- Be bold with recommendations — don't hedge
- Use football analytics language naturally (xG, pressing metrics, etc.)
- If comparing, always declare a clear winner`

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
