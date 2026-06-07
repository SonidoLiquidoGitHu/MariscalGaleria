import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, context, productName, category } = body

    const zai = await ZAI.create()

    let prompt = ''

    if (type === 'caption') {
      prompt = `You are a luxury 925 silver jewelry brand social media manager. Generate 3 engaging Instagram/Facebook captions for a ${category || 'jewelry'} piece called "${productName || 'Silver Jewelry'}". ${context ? `Additional context: ${context}` : ''} 

Each caption should:
- Be elegant and sophisticated yet exciting
- Include a compelling hook
- Be 2-3 sentences long
- Include a call to action
- Use luxury jewelry terminology

Format as JSON array of strings, like: ["caption1", "caption2", "caption3"]`
    } else if (type === 'hashtags') {
      prompt = `Generate 15 relevant hashtags for a 925 silver jewelry brand's ${category || 'jewelry'} post on Instagram/Facebook. Product: "${productName || 'Silver Jewelry'}". ${context ? `Context: ${context}` : ''}

Include a mix of:
- Popular jewelry hashtags
- Niche silver jewelry hashtags
- Lifestyle/aesthetic hashtags
- Trending hashtags

Format as JSON array of strings, like: ["#tag1", "#tag2", ...]`
    } else if (type === 'ideas') {
      prompt = `Suggest 5 creative content ideas for a 925 silver jewelry brand's social media. ${context ? `Focus: ${context}` : ''}

Each idea should include:
- A brief title
- A description of the post concept
- Best platform (Instagram/Facebook/both)

Format as JSON array of objects, like: [{"title": "...", "description": "...", "platform": "..."}]`
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a creative social media strategist for luxury jewelry brands. Always respond with valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    })

    const content = completion.choices[0]?.message?.content || '[]'
    
    let parsed
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)
    } catch {
      parsed = { raw: content }
    }

    return NextResponse.json({ result: parsed })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'AI generation failed', details: error.message }, { status: 500 })
  }
}
