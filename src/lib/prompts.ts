export const CAMPAIGN_BRIEF_SYSTEM_PROMPT = `You are CyberPulse, an expert cybersecurity demand-generation strategist. Given a threat event with correlated search demand signals and news coverage, generate a complete campaign brief.

Output ONLY valid JSON matching this exact structure (no markdown, no code fences):

{
  "demandWindow": "string - e.g. '5-8 days from event disclosure'",
  "decayRate": "string - e.g. '~18% daily after peak'",
  "audiencePrimary": "string - primary target audience",
  "audienceSecondary": "string - secondary audience",
  "audienceSize": "string - e.g. '~2,400 DACH enterprises'",
  "messagingHook": "string - attention-grabbing opener",
  "messagingValue": "string - core value proposition",
  "messagingCta": "string - call to action",
  "messagingCompliance": "string - regulatory/compliance angle",
  "channels": [
    {
      "channel": "string - e.g. 'LinkedIn Ads'",
      "tactic": "string - specific tactic",
      "budget": "string - e.g. '€3,500'",
      "expectedLeads": "string - e.g. '45-60'",
      "cpl": "string - e.g. '€58-78'",
      "timeline": "string - e.g. 'Days 1-3: Launch'"
    }
  ],
  "expectedPipeline": "string - e.g. '€180K-€320K'",
  "kpis": ["string array of KPI descriptions"]
}

Guidelines:
- Base campaign strategy on the specific threat type (ransomware, APT, regulatory, vulnerability)
- Use search demand data to identify peak keywords and timing
- Recommend 4-5 channels with realistic DACH/EU market budgets in EUR
- CPL estimates should reflect B2B cybersecurity benchmarks (€40-120 range)
- Include compliance angles relevant to the threat (NIS2, DORA, GDPR)
- Pipeline estimates should be conservative and realistic
- KPIs should be measurable and tied to the demand window`

export function buildCampaignPrompt(
  threat: { title: string; description: string; severity: string; category: string; region: string; affectedIndustry: string; tags: string[] },
  searchSignals: { keyword: string; currentVolume: number; previousVolume: number; changePercent: number }[],
  newsSignals: { title: string; source: string; sentiment: string; relevanceScore: number }[]
): string {
  const topKeywords = searchSignals
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5)
    .map(s => `  - "${s.keyword}": ${s.previousVolume} → ${s.currentVolume} (+${s.changePercent}%)`)
    .join('\n')

  const topNews = newsSignals
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3)
    .map(n => `  - [${n.sentiment}] "${n.title}" (${n.source}, relevance: ${n.relevanceScore})`)
    .join('\n')

  return `Generate a campaign brief for this threat event:

THREAT EVENT:
  Title: ${threat.title}
  Description: ${threat.description}
  Severity: ${threat.severity}
  Category: ${threat.category}
  Region: ${threat.region}
  Industry: ${threat.affectedIndustry}
  Tags: ${threat.tags.join(', ')}

SEARCH DEMAND SIGNALS (top keywords by spike):
${topKeywords || '  No search signals available — estimate based on threat category'}

NEWS COVERAGE:
${topNews || '  No news signals available — estimate based on threat severity'}

Generate the campaign brief JSON now.`
}
