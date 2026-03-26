'use client'

import { useState } from "react";
import { Zap, TrendingUp, Shield, AlertTriangle, Target, Clock, BarChart3, ArrowRight, Radio, Globe, ChevronDown, ChevronUp, Newspaper, Search, Users, MessageSquare, FileText, Activity, Layers, BrainCircuit } from "lucide-react";

// ─── THREAT EVENT DATABASE ─────────────────────────────────────
const THREAT_EVENTS = [
  {
    id: "lockbit-dach-mfg",
    date: "2026-03-18",
    daysAgo: 8,
    title: "LockBit 4.0 Ransomware Hits 3 German Manufacturers",
    severity: "critical",
    category: "Ransomware",
    region: "DACH",
    affectedIndustry: "Manufacturing",
    summary: "LockBit 4.0 successor group compromised three mid-size German manufacturers in Nordrhein-Westfalen within 72 hours, encrypting production control systems and demanding €4.2M combined ransom. BSI issued an urgent advisory. The attack exploited unpatched Fortinet VPN appliances (CVE-2024-47575).",
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
      window: "NOW — next 5 days (demand peak decays ~40%/week)",
      audience: {
        primary: "CISOs and IT Security Leads at manufacturing companies (500-5000 employees) in DACH",
        secondary: "CFOs and COOs at NIS2-affected manufacturers (board-level liability)",
        size: "~8,200 targetable profiles on LinkedIn (DACH manufacturing, security titles)",
      },
      messaging: {
        hook: "Your Fortinet VPN is the same model LockBit 4.0 just used to shut down 3 German factories.",
        value: "Mercury detected this campaign 72 hours before the first public report. Here's the IOC package our manufacturing clients received.",
        cta: "Request the LockBit 4.0 Manufacturing Threat Brief — includes specific CVEs, IOCs, and mitigation steps for your OT environment.",
        compliance: "NIS2 Article 21 requires 'appropriate and proportionate' cybersecurity risk-management measures. Board members are personally liable. This attack is your compliance audit in real-time.",
      },
      channels: [
        { channel: "LinkedIn Ads", action: "Sponsored content targeting DACH manufacturing security titles. Lead gen form with threat brief download.", budget: "€2,500", expectedLeads: "45-60", cpl: "€42-56" },
        { channel: "Email (existing list)", action: "Threat alert email to manufacturing segment. Subject: 'LockBit 4.0 is targeting German manufacturers — here's what we know.'", budget: "€0", expectedLeads: "15-25", cpl: "€0" },
        { channel: "SDR outbound", action: "Personalized outreach to 200 target accounts using Fortinet CVE as relevance trigger. 'Your VPN vendor is the entry point.'", budget: "€0 (SDR time)", expectedLeads: "8-12", cpl: "SDR cost" },
        { channel: "Webinar (fast-turn)", action: "48-hour turnaround threat briefing webinar. 'LockBit 4.0: What German Manufacturers Need to Know Now.' Co-host with intelligence analyst.", budget: "€500", expectedLeads: "80-120 registrants", cpl: "€4-6" },
      ],
      expectedPipeline: "€180K-€320K influenced pipeline within 30 days",
      kpis: ["Threat brief downloads", "Webinar registrants → MQL conversion", "SDR meeting rate on LockBit sequence", "Pipeline created within 30-day attribution window"],
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
        secondary: "Legal counsel and board members at companies >€10M revenue in NIS2-affected sectors",
        size: "~14,500 targetable profiles on LinkedIn",
      },
      messaging: {
        hook: "The EU just sued 4 countries for NIS2 failures. Your board is personally liable under Article 20. Are you compliant?",
        value: "QuoIntelligence's Mercury platform maps NIS2 requirements to active threat intelligence — so your compliance reporting is backed by real-time risk data, not checkbox exercises.",
        cta: "Download our NIS2 Compliance Intelligence Guide — maps every Article 21 requirement to specific threat intelligence capabilities.",
        compliance: "This IS the compliance message. Position QuoIntelligence as the bridge between threat intelligence and regulatory compliance.",
      },
      channels: [
        { channel: "LinkedIn Ads", action: "Thought leadership campaign: 'NIS2 Enforcement Is Here' series. Board-level messaging. Lead gen to compliance guide.", budget: "€4,000", expectedLeads: "90-130", cpl: "€31-44" },
        { channel: "Content syndication", action: "Place NIS2 compliance article on Handelsblatt, Wirtschaftswoche, or equivalent DACH business media.", budget: "€3,000", expectedLeads: "40-60", cpl: "€50-75" },
        { channel: "Partner co-marketing", action: "Joint webinar with legal/compliance partner (e.g., law firm specializing in NIS2). Cross-audience.", budget: "€1,000", expectedLeads: "120-180 registrants", cpl: "€6-8" },
        { channel: "ABM email sequence", action: "Multi-threaded sequence targeting NIS2-essential entities. CISO + Legal + Board. Different messaging per persona.", budget: "€0", expectedLeads: "20-35", cpl: "€0" },
      ],
      expectedPipeline: "€350K-€600K influenced pipeline within 45 days",
      kpis: ["Guide downloads", "Webinar registrant → opportunity conversion", "ABM sequence reply rate", "Pipeline created with NIS2-compliance trigger"],
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
      linkedin: "+6,100 posts in 48h — highest engagement in cybersecurity this quarter",
      twitter: "#VoltTyphoon trending globally for 36 hours",
      reddit: "Multiple front-page posts across r/cybersecurity, r/netsec, r/europe",
    },
    campaignBrief: {
      window: "URGENT — 24-72 hour peak. Act immediately.",
      audience: {
        primary: "CISOs and OT Security Managers at energy companies, grid operators, and utilities in EU",
        secondary: "Government cybersecurity agencies and critical infrastructure oversight bodies",
        size: "~4,800 targetable profiles on LinkedIn (EU energy, security titles)",
      },
      messaging: {
        hook: "Volt Typhoon is inside European energy infrastructure. ENISA just confirmed it. Your grid operator may already be compromised.",
        value: "Mercury's intelligence team tracked Volt Typhoon's EU pivot 3 months before the public disclosure. Our energy sector clients had IOCs and hunting guides deployed before the ENISA advisory.",
        cta: "Request our Volt Typhoon EU Energy Threat Package — includes IOCs, YARA rules, Living-off-the-Land detection playbook, and OT-specific hunting guidance.",
        compliance: "CER Directive resilience plans are due July 2026. This disclosure is the stress test. Document your response for regulators.",
      },
      channels: [
        { channel: "Instant threat alert", action: "Emergency email blast to energy segment + full prospect list. 'ENISA Advisory: Volt Typhoon in EU Energy — What We Know.' Link to gated threat package.", budget: "€0", expectedLeads: "60-90", cpl: "€0" },
        { channel: "LinkedIn — organic + paid", action: "CEO or Head of Intel publishes urgent analysis post (organic). Boost with paid to energy security audience.", budget: "€1,500", expectedLeads: "35-50", cpl: "€30-43" },
        { channel: "Press/media outreach", action: "Offer QuoIntelligence analyst as expert source to Reuters, Bloomberg, Handelsblatt on Volt Typhoon EU implications.", budget: "€0", expectedLeads: "Brand — not directly measurable", cpl: "N/A" },
        { channel: "SDR — 24h blitz", action: "100 calls to energy sector target accounts in 24 hours. 'Have you seen the ENISA advisory? We have the threat package your SOC needs.'", budget: "€0 (SDR time)", expectedLeads: "12-18", cpl: "SDR cost" },
      ],
      expectedPipeline: "€250K-€450K influenced pipeline within 21 days",
      kpis: ["Threat package downloads within 72h", "Media mentions / share of voice", "SDR blitz → meeting conversion rate", "Pipeline velocity (time from threat alert → opportunity created)"],
    },
  },
];

// ─── SUB-COMPONENTS ─────────────────────────────────────────────

function SeverityDot({ level }: { level: string }) {
  const colors: Record<string, string> = { critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-green-500" };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[level]} mr-2`} />;
}

function SparkBar({ before, after, maxVal }: { before: number; after: number; maxVal?: number }) {
  const max = maxVal || Math.max(before, after);
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gray-400 rounded-full" style={{ width: `${(before / max) * 100}%` }} />
      </div>
      <span className="text-gray-400 w-8 text-right">{before}</span>
      <ArrowRight size={10} className="text-gray-400" />
      <div className="w-16 h-2 bg-red-100 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(after / max) * 100}%` }} />
      </div>
      <span className="font-bold text-red-600 w-8">{after}</span>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color = "blue" }: any) {
  const bg: Record<string, string> = { blue: "bg-blue-50 border-blue-200", red: "bg-red-50 border-red-200", green: "bg-green-50 border-green-200", orange: "bg-orange-50 border-orange-200" };
  const text: Record<string, string> = { blue: "text-blue-700", red: "text-red-700", green: "text-green-700", orange: "text-orange-700" };
  return (
    <div className={`p-4 rounded-xl border ${bg[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={text[color]} />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className={`text-xl font-bold ${text[color]}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function ChannelRow({ ch, idx }: { ch: any; idx: number }) {
  return (
    <div className={`p-4 rounded-xl ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} border border-gray-100`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold text-sm text-gray-800">{ch.channel}</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{ch.budget}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-green-700">{ch.expectedLeads}</div>
          <div className="text-xs text-gray-500">est. leads | CPL: {ch.cpl}</div>
        </div>
      </div>
      <p className="text-xs text-gray-600">{ch.action}</p>
    </div>
  );
}

// ─── CAMPAIGN BRIEF PANEL (right side) ──────────────────────────

function CampaignPanel({ selectedEvent, expandedSection, toggleSection, animating }: any) {
  if (!selectedEvent && !animating) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-600">
        <Target size={40} className="mb-4 text-gray-700" />
        <p className="text-lg font-medium">Select a threat event</p>
        <p className="text-sm">to view the demand analysis and campaign brief</p>
      </div>
    );
  }

  if (animating) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 rounded-full border-2 border-gray-700 border-t-red-500 animate-spin" />
        <p className="mt-4 text-sm text-gray-500 animate-pulse">Correlating threat data with demand signals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Event Header */}
      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <SeverityDot level={selectedEvent.severity} />
          <span className="text-xs font-semibold text-red-400 uppercase">{selectedEvent.severity} — {selectedEvent.category}</span>
          <span className="text-xs text-gray-600 ml-auto">{selectedEvent.date}</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-3">{selectedEvent.title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{selectedEvent.summary}</p>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <MetricCard icon={Search} label="Peak keyword spike" value={selectedEvent.searchSpike.keywords[0].change} sub={selectedEvent.searchSpike.keywords[0].term} color="red" />
          <MetricCard icon={Newspaper} label="News volume" value={`${selectedEvent.newsVolume.before} → ${selectedEvent.newsVolume.after}`} sub="articles in 72h" color="orange" />
          <MetricCard icon={Clock} label="Demand window" value={selectedEvent.searchSpike.peakWindow} sub={`Decay: ${selectedEvent.searchSpike.decayRate}`} color="blue" />
          <MetricCard icon={Target} label="Expected pipeline" value={selectedEvent.campaignBrief.expectedPipeline.split(" ")[0]} sub="influenced within 30-45 days" color="green" />
        </div>
      </div>

      {/* Search Demand Spike */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        <button onClick={() => toggleSection("search")} className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-red-400" />
            <span className="font-semibold text-sm text-white">Search Demand Analysis</span>
          </div>
          {expandedSection === "search" ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </button>
        {expandedSection === "search" && (
          <div className="px-4 pb-4">
            <div className="space-y-3">
              {selectedEvent.searchSpike.keywords.map((kw: any, i: number) => {
                const maxVal = Math.max(...selectedEvent.searchSpike.keywords.map((k: any) => k.after));
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <span className="text-sm text-gray-300 w-56 truncate">{kw.term}</span>
                    <SparkBar before={kw.before} after={kw.after} maxVal={maxVal} />
                    <span className="text-sm font-bold text-red-400 w-16 text-right">{kw.change}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>Peak: {selectedEvent.searchSpike.peakWindow}</span>
              <span>Decay: {selectedEvent.searchSpike.decayRate}</span>
            </div>
          </div>
        )}
      </div>

      {/* Social & News Signals */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        <button onClick={() => toggleSection("social")} className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-400" />
            <span className="font-semibold text-sm text-white">Social & News Signals</span>
          </div>
          {expandedSection === "social" ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </button>
        {expandedSection === "social" && (
          <div className="px-4 pb-4 space-y-2">
            {Object.entries(selectedEvent.socialSignals).map(([platform, signal]) => (
              <div key={platform} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 bg-opacity-50">
                <span className="text-xs font-semibold text-gray-400 uppercase w-16 flex-shrink-0 pt-0.5">{platform}</span>
                <span className="text-sm text-gray-300">{signal as string}</span>
              </div>
            ))}
            <div className="p-3 rounded-lg bg-gray-800 bg-opacity-50">
              <span className="text-xs font-semibold text-gray-400 uppercase">News volume: </span>
              <span className="text-sm text-gray-300">{selectedEvent.newsVolume.before} → {selectedEvent.newsVolume.after} articles ({selectedEvent.newsVolume.source})</span>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Brief */}
      <div className="rounded-xl bg-gray-900 border border-red-500 border-opacity-30 overflow-hidden">
        <button onClick={() => toggleSection("campaign")} className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-green-400" />
            <span className="font-semibold text-sm text-white">Auto-Generated Campaign Brief</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30">Ready to execute</span>
          </div>
          {expandedSection === "campaign" ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </button>
        {expandedSection === "campaign" && (
          <div className="px-4 pb-5">
            {/* Window */}
            <div className="mb-4 p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-red-400" />
                <span className="text-sm font-semibold text-red-300">Demand Window: {selectedEvent.campaignBrief.window}</span>
              </div>
            </div>

            {/* Audience */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1"><Users size={12} /> Target Audience</h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-lg bg-gray-800 bg-opacity-50">
                  <span className="text-xs text-blue-400 font-medium">PRIMARY: </span>
                  <span className="text-gray-300">{selectedEvent.campaignBrief.audience.primary}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-800 bg-opacity-50">
                  <span className="text-xs text-gray-500 font-medium">SECONDARY: </span>
                  <span className="text-gray-300">{selectedEvent.campaignBrief.audience.secondary}</span>
                </div>
                <div className="text-xs text-gray-500">Addressable: {selectedEvent.campaignBrief.audience.size}</div>
              </div>
            </div>

            {/* Messaging */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1"><MessageSquare size={12} /> Messaging Framework</h4>
              <div className="space-y-2">
                {[
                  { label: "HOOK", text: selectedEvent.campaignBrief.messaging.hook, color: "text-red-400" },
                  { label: "VALUE", text: selectedEvent.campaignBrief.messaging.value, color: "text-blue-400" },
                  { label: "CTA", text: selectedEvent.campaignBrief.messaging.cta, color: "text-green-400" },
                  { label: "COMPLIANCE ANGLE", text: selectedEvent.campaignBrief.messaging.compliance, color: "text-orange-400" },
                ].map((msg, i) => (
                  <div key={i} className="p-3 rounded-lg bg-gray-800 bg-opacity-50">
                    <span className={`text-xs font-bold ${msg.color}`}>{msg.label}: </span>
                    <span className="text-sm text-gray-300">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Channels */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1"><Layers size={12} /> Channel Execution Plan</h4>
              <div className="space-y-2">
                {selectedEvent.campaignBrief.channels.map((ch: any, i: number) => <ChannelRow key={i} ch={ch} idx={i} />)}
              </div>
            </div>

            {/* KPIs */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1"><BarChart3 size={12} /> Success Metrics</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedEvent.campaignBrief.kpis.map((kpi: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 bg-opacity-50 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {kpi}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline estimate */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500 border-opacity-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Estimated Influenced Pipeline</div>
            <div className="text-2xl font-bold text-green-400">{selectedEvent.campaignBrief.expectedPipeline}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">From a single threat event</div>
            <div className="text-sm text-gray-400">Repeatable. Scalable. Measurable.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────

export default function CyberPulse({ embedded = false }: { embedded?: boolean }) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState("search");
  const [animating, setAnimating] = useState(false);

  const selectEvent = (ev: any) => {
    setAnimating(true);
    setSelectedEvent(null);
    setTimeout(() => {
      setSelectedEvent(ev);
      setExpandedSection("search");
      setAnimating(false);
    }, 300);
  };

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? "" : s);

  const grid = (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Event Feed */}
      <div className="col-span-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-red-400" />
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Threat Events</h2>
        </div>
        <div className="space-y-3">
          {THREAT_EVENTS.map(ev => (
            <button
              key={ev.id}
              onClick={() => selectEvent(ev)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedEvent?.id === ev.id
                  ? "bg-gray-800 border-red-500 border-opacity-50 shadow-lg shadow-red-500/5"
                  : "bg-gray-900 border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <SeverityDot level={ev.severity} />
                  <span className="text-xs font-medium text-gray-500">{ev.category}</span>
                </div>
                <span className="text-xs text-gray-600">{ev.daysAgo}d ago</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-200 leading-snug mb-2">{ev.title}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Globe size={10} />{ev.region}</span>
                <span className="flex items-center gap-1"><Shield size={10} />{ev.affectedIndustry}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp size={12} className="text-red-400" />
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full" style={{ width: `${Math.min(95, parseInt(ev.searchSpike.keywords[0].change) / 5)}%` }} />
                </div>
                <span className="text-xs font-bold text-red-400">{ev.searchSpike.keywords[0].change}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Campaign Brief */}
      <div className="col-span-8">
        <CampaignPanel selectedEvent={selectedEvent} expandedSection={expandedSection} toggleSection={toggleSection} animating={animating} />
      </div>
    </div>
  );

  // Embedded mode: just the grid, no shell
  if (embedded) return grid;

  // Standalone mode: full page with header + footer
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <Zap size={22} className="text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">CyberPulse</h1>
                <p className="text-xs text-gray-500">Threat-to-Demand Intelligence Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Radio size={11} className="text-red-400 animate-pulse" /> Monitoring 2,400+ threat feeds</span>
              <span className="flex items-center gap-1.5"><Activity size={11} className="text-green-400" /> 3 active demand windows</span>
              <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 border border-gray-700">DACH + EU</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-6 p-4 rounded-xl bg-gray-900 border border-gray-800">
          <div className="flex items-start gap-3">
            <BrainCircuit size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">How it works:</span> CyberPulse monitors global threat intelligence feeds, correlates them with real-time search demand data, news velocity, and social signals. When a threat event creates a demand spike in your target market, it generates an actionable campaign brief within hours — turning threat events into qualified pipeline.
            </div>
          </div>
        </div>
        {grid}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600">CyberPulse — Threat-to-Demand Intelligence Engine — Concept by Mohamed Ali Mohamed</p>
          <p className="text-xs text-gray-700 mt-1">Connects threat intelligence + demand prediction + geopolitical analysis → actionable marketing pipeline</p>
        </div>
      </div>
    </div>
  );
}
