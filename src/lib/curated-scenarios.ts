export interface CuratedThreatEvent {
  id: string
  date: string
  daysAgo: number
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  region: string
  affectedIndustry: string
  summary: string
  searchSpike: {
    keywords: { term: string; before: number; after: number; change: string }[]
    peakWindow: string
    decayRate: string
  }
  newsVolume: { before: number; after: number; source: string }
  socialSignals: Record<string, string>
  campaignBrief: {
    window: string
    audience: { primary: string; secondary: string; size: string }
    messaging: { hook: string; value: string; cta: string; compliance: string }
    channels: { channel: string; action: string; budget: string; expectedLeads: string; cpl: string }[]
    expectedPipeline: string
    kpis: string[]
  }
}

export const CURATED_THREAT_EVENTS: CuratedThreatEvent[] = [
  {
    id: "lockbit-dach-mfg",
    date: "2026-03-18",
    daysAgo: 8,
    title: "LockBit 4.0 Ransomware Hits 3 German Manufacturers",
    severity: "critical",
    category: "Ransomware",
    region: "DACH",
    affectedIndustry: "Manufacturing",
    summary: "LockBit 4.0 successor group compromised three mid-size German manufacturers in Nordrhein-Westfalen within 72 hours, encrypting production control systems and demanding \u20ac4.2M combined ransom. BSI issued an urgent advisory. The attack exploited unpatched Fortinet VPN appliances (CVE-2024-47575).",
    searchSpike: {
      keywords: [
        { term: "threat intelligence platform", before: 320, after: 1240, change: "+288%" },
        { term: "ransomware schutz unternehmen", before: 180, after: 890, change: "+394%" },
        { term: "cyber threat intelligence Germany", before: 140, after: 620, change: "+343%" },
        { term: "NIS2 compliance manufacturing", before: 90, after: 410, change: "+356%" },
        { term: "OT security monitoring", before: 210, after: 780, change: "+271%" },
      ],
      peakWindow: "48-96 hours post-event",
      decayRate: "~40% per week",
    },
    newsVolume: { before: 12, after: 347, source: "DACH tech/business media" },
    socialSignals: {
      linkedin: "+1,840 posts mentioning LockBit + manufacturing in 48h",
      twitter: "#LockBit4 trending in DE for 18 hours",
      reddit: "r/cybersecurity: 3 posts in top 25 within 6 hours",
    },
    campaignBrief: {
      window: "NOW \u2014 next 5 days (demand peak decays ~40%/week)",
      audience: {
        primary: "CISOs and IT Security Leads at manufacturing companies (500-5000 employees) in DACH",
        secondary: "CFOs and COOs at NIS2-affected manufacturers (board-level liability)",
        size: "~8,200 targetable profiles on LinkedIn (DACH manufacturing, security titles)",
      },
      messaging: {
        hook: "Your Fortinet VPN is the same model LockBit 4.0 just used to shut down 3 German factories.",
        value: "Mercury detected this campaign 72 hours before the first public report. Here\u2019s the IOC package our manufacturing clients received.",
        cta: "Request the LockBit 4.0 Manufacturing Threat Brief \u2014 includes specific CVEs, IOCs, and mitigation steps for your OT environment.",
        compliance: "NIS2 Article 21 requires \u2018appropriate and proportionate\u2019 cybersecurity risk-management measures. Board members are personally liable. This attack is your compliance audit in real-time.",
      },
      channels: [
        { channel: "LinkedIn Ads", action: "Sponsored content targeting DACH manufacturing security titles. Lead gen form with threat brief download.", budget: "\u20ac2,500", expectedLeads: "45-60", cpl: "\u20ac42-56" },
        { channel: "Email (existing list)", action: "Threat alert email to manufacturing segment.", budget: "\u20ac0", expectedLeads: "15-25", cpl: "\u20ac0" },
        { channel: "SDR outbound", action: "Personalized outreach to 200 target accounts using Fortinet CVE as relevance trigger.", budget: "\u20ac0 (SDR time)", expectedLeads: "8-12", cpl: "SDR cost" },
        { channel: "Webinar (fast-turn)", action: "48-hour turnaround threat briefing webinar. Co-host with intelligence analyst.", budget: "\u20ac500", expectedLeads: "80-120 registrants", cpl: "\u20ac4-6" },
      ],
      expectedPipeline: "\u20ac180K-\u20ac320K influenced pipeline within 30 days",
      kpis: ["Threat brief downloads", "Webinar registrants \u2192 MQL conversion", "SDR meeting rate on LockBit sequence", "Pipeline created within 30-day attribution window"],
    },
  },
  {
    id: "nis2-enforcement-wave",
    date: "2026-03-10",
    daysAgo: 16,
    title: "EU Commission Launches NIS2 Enforcement Actions Against 4 Member States",
    severity: "high",
    category: "Regulatory",
    region: "EU-wide",
    affectedIndustry: "All regulated sectors",
    summary: "The European Commission initiated infringement proceedings against 4 member states for inadequate NIS2 transposition. This signals regulatory enforcement is real, not theoretical. Compliance anxiety spikes across essential and important entities.",
    searchSpike: {
      keywords: [
        { term: "NIS2 compliance requirements", before: 520, after: 2180, change: "+319%" },
        { term: "NIS2 Umsetzung Deutschland", before: 290, after: 1340, change: "+362%" },
        { term: "cyber risk management NIS2", before: 160, after: 890, change: "+456%" },
        { term: "NIS2 board liability", before: 80, after: 670, change: "+738%" },
        { term: "threat intelligence compliance", before: 110, after: 480, change: "+336%" },
      ],
      peakWindow: "72 hours post-announcement, sustained 2-3 weeks",
      decayRate: "~15% per week (regulatory = slower decay)",
    },
    newsVolume: { before: 28, after: 892, source: "EU regulatory/legal/business media" },
    socialSignals: {
      linkedin: "+4,200 posts mentioning NIS2 enforcement in 72h",
      twitter: "#NIS2 top 10 trending in tech circles across EU",
      reddit: "r/europeanlaw, r/cybersecurity: multiple front-page posts",
    },
    campaignBrief: {
      window: "2-3 week window (regulatory events decay slower than threat events)",
      audience: {
        primary: "CISOs, CIOs, and Compliance Officers at essential entities (energy, transport, banking, health) in DACH + Benelux",
        secondary: "Legal counsel and board members at companies >\u20ac10M revenue in NIS2-affected sectors",
        size: "~14,500 targetable profiles on LinkedIn",
      },
      messaging: {
        hook: "The EU just sued 4 countries for NIS2 failures. Your board is personally liable under Article 20. Are you compliant?",
        value: "Mercury platform maps NIS2 requirements to active threat intelligence \u2014 so your compliance reporting is backed by real-time risk data, not checkbox exercises.",
        cta: "Download our NIS2 Compliance Intelligence Guide \u2014 maps every Article 21 requirement to specific threat intelligence capabilities.",
        compliance: "This IS the compliance message. Position as the bridge between threat intelligence and regulatory compliance.",
      },
      channels: [
        { channel: "LinkedIn Ads", action: "Thought leadership campaign: \u2018NIS2 Enforcement Is Here\u2019 series. Board-level messaging. Lead gen to compliance guide.", budget: "\u20ac4,000", expectedLeads: "90-130", cpl: "\u20ac31-44" },
        { channel: "Content syndication", action: "Place NIS2 compliance article on DACH business media.", budget: "\u20ac3,000", expectedLeads: "40-60", cpl: "\u20ac50-75" },
        { channel: "Partner co-marketing", action: "Joint webinar with legal/compliance partner. Cross-audience.", budget: "\u20ac1,000", expectedLeads: "120-180 registrants", cpl: "\u20ac6-8" },
        { channel: "ABM email sequence", action: "Multi-threaded sequence targeting NIS2-essential entities. CISO + Legal + Board.", budget: "\u20ac0", expectedLeads: "20-35", cpl: "\u20ac0" },
      ],
      expectedPipeline: "\u20ac350K-\u20ac600K influenced pipeline within 45 days",
      kpis: ["Guide downloads", "Webinar registrant \u2192 opportunity conversion", "ABM sequence reply rate", "Pipeline created with NIS2-compliance trigger"],
    },
  },
  {
    id: "volt-typhoon-eu",
    date: "2026-03-22",
    daysAgo: 4,
    title: "Volt Typhoon Pre-Positioning Detected in EU Energy Infrastructure",
    severity: "critical",
    category: "Nation-State",
    region: "EU-wide (focus: Nordics, DACH)",
    affectedIndustry: "Energy & Utilities",
    summary: "ENISA and national CERTs jointly disclosed that Volt Typhoon (China/MSS) has been detected pre-positioning in European energy infrastructure, mirroring the US critical infrastructure campaign. Living-off-the-Land techniques make detection extremely difficult. Affects grid operators, LNG terminals, and renewable energy management systems.",
    searchSpike: {
      keywords: [
        { term: "Volt Typhoon Europe", before: 40, after: 2890, change: "+7125%" },
        { term: "Chinese cyber threat energy", before: 60, after: 1450, change: "+2317%" },
        { term: "critical infrastructure protection EU", before: 280, after: 1680, change: "+500%" },
        { term: "OT threat detection", before: 190, after: 920, change: "+384%" },
        { term: "ENISA threat advisory", before: 70, after: 890, change: "+1171%" },
      ],
      peakWindow: "24-72 hours (nation-state = high initial spike, fast media cycle)",
      decayRate: "~50% per week (but resurfaces with each new disclosure)",
    },
    newsVolume: { before: 5, after: 1240, source: "Global cybersecurity + mainstream media" },
    socialSignals: {
      linkedin: "+6,100 posts in 48h \u2014 highest engagement in cybersecurity this quarter",
      twitter: "#VoltTyphoon trending globally for 36 hours",
      reddit: "Multiple front-page posts across r/cybersecurity, r/netsec, r/europe",
    },
    campaignBrief: {
      window: "URGENT \u2014 24-72 hour peak. Act immediately.",
      audience: {
        primary: "CISOs and OT Security Managers at energy companies, grid operators, and utilities in EU",
        secondary: "Government cybersecurity agencies and critical infrastructure oversight bodies",
        size: "~4,800 targetable profiles on LinkedIn (EU energy, security titles)",
      },
      messaging: {
        hook: "Volt Typhoon is inside European energy infrastructure. ENISA just confirmed it. Your grid operator may already be compromised.",
        value: "Mercury\u2019s intelligence team tracked Volt Typhoon\u2019s EU pivot 3 months before the public disclosure. Our energy sector clients had IOCs and hunting guides deployed before the ENISA advisory.",
        cta: "Request our Volt Typhoon EU Energy Threat Package \u2014 includes IOCs, YARA rules, Living-off-the-Land detection playbook, and OT-specific hunting guidance.",
        compliance: "CER Directive resilience plans are due July 2026. This disclosure is the stress test. Document your response for regulators.",
      },
      channels: [
        { channel: "Instant threat alert", action: "Emergency email blast to energy segment + full prospect list. Link to gated threat package.", budget: "\u20ac0", expectedLeads: "60-90", cpl: "\u20ac0" },
        { channel: "LinkedIn \u2014 organic + paid", action: "CEO publishes urgent analysis post (organic). Boost with paid to energy security audience.", budget: "\u20ac1,500", expectedLeads: "35-50", cpl: "\u20ac30-43" },
        { channel: "Press/media outreach", action: "Offer analyst as expert source to Reuters, Bloomberg, Handelsblatt on Volt Typhoon EU implications.", budget: "\u20ac0", expectedLeads: "Brand \u2014 not directly measurable", cpl: "N/A" },
        { channel: "SDR \u2014 24h blitz", action: "100 calls to energy sector target accounts in 24 hours.", budget: "\u20ac0 (SDR time)", expectedLeads: "12-18", cpl: "SDR cost" },
      ],
      expectedPipeline: "\u20ac250K-\u20ac450K influenced pipeline within 21 days",
      kpis: ["Threat package downloads within 72h", "Media mentions / share of voice", "SDR blitz \u2192 meeting conversion rate", "Pipeline velocity (time from threat alert \u2192 opportunity created)"],
    },
  },
]
