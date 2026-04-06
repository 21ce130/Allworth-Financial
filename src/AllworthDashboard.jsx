import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Shield, Target, Bell,
  ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight,
  Briefcase, PieChart as PieIcon, BarChart3, Clock, Eye, EyeOff,
  RefreshCw, Sun, Landmark, Percent, Layers, FileText, Download,
  Calculator, Umbrella, Heart, Home, Car, Lock, Unlock,
  CheckCircle, AlertTriangle, Info, Zap, BookOpen,
  CreditCard, Receipt, PiggyBank, Building, Wallet,
  Calendar, User, Upload, Settings, MessageSquare, ChevronDown,
  Activity, Minus, CircleDot, FileCheck, Scale,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT DATA MODEL — single source of truth
// ═══════════════════════════════════════════════════════════════════════════════

const CLIENT = {
  name: "Patricia & Gerald Whitfield",
  initials: "PG",
  advisor: { name: "Jeffrey Green", role: "Chief People Officer", office: "Allworth Financial, Texas ", initials: "JG" },
  lastSync: "Apr 05, 2026 · 9:41 AM EST",
  dataSource: "Schwab Custody · Orion Portfolio Analytics",

  // ── Net worth
  netWorth: 4820000,
  netWorthChange: 28400,
  netWorthChangePct: 0.59,
  totalAssets: 5340000,
  totalLiabilities: 520000,

  // ── Portfolio
  portfolioValue: 2846720,
  portfolioDayChange: 12847,
  portfolioDayChangePct: 0.45,
  ytdReturn: 18.4,
  benchmarkYtdReturn: 14.2,

  // ── Plan health
  retirementReadiness: 87,
  retirementTarget: 4200000,
  retirementCurrent: 3650000,
  retirementAge: 62,
  currentAge: 52,
  monteCarlo: 94,
  withdrawalSustainability: 91,
  taxEfficiency: 78,
  estateReadiness: 92,
  insuranceReadiness: 100,

  // ── Tax
  ytdTaxSavings: 37400,
  taxTarget: 48000,
  effectiveRate: 26.8,
  marginalRate: 32,
  tlhSavings: 8420,
  rothConversionOpportunity: 35000,
};

// ── Market context (point-in-time, not live)
const MARKET_CONTEXT = {
  asOf: "Apr 04, 2026 · Market Close",
  indices: [
    { name: "S&P 500", value: "5,842.31", change: "+0.47%", direction: "up" },
    { name: "10Y Treasury", value: "4.28%", change: "-14 bps", direction: "down" },
    { name: "Fed Funds", value: "4.25–4.50%", change: "Held", direction: "flat" },
    { name: "VIX", value: "14.72", change: "-3.2%", direction: "down" },
  ],
  headline: "Fed held rates steady; 10Y yield declined on dovish forward guidance. Equity markets advanced on easing financial conditions.",
};

// ── Personalized impact (the key bridge)
const IMPACT_BULLETS = [
  { icon: TrendingDown, color: "#4ADE80", text: "10Y Treasury down 14 bps → bond sleeve estimated +0.8%, improving income stability", category: "Fixed Income" },
  { icon: ArrowUpRight, color: "#4ADE80", text: "Equity rally added ~$18,200 to projected retirement surplus — plan confidence now 94%", category: "Retirement" },
  { icon: AlertTriangle, color: "#FBBF24", text: "Higher volatility increased downside exposure in concentrated tech allocation (28%)", category: "Risk" },
  { icon: DollarSign, color: "#6B8F9E", text: "Cash yield remains attractive at 5.2% vs. planned deployment schedule — no urgency to redeploy", category: "Cash" },
];

// ── Suggested actions
const ACTIONS = [
  { label: "Review allocation drift", desc: "Equity 2.1% above target — rebalance recommended", priority: "high", icon: RefreshCw },
  { label: "Schedule tax strategy session", desc: "Roth conversion window optimal before year-end", priority: "high", icon: Calculator },
  { label: "Update beneficiary designations", desc: "Last reviewed Mar 2022 — 2+ years overdue", priority: "medium", icon: AlertTriangle },
  { label: "Review Q1 portfolio report", desc: "Published Apr 01, 2026 — not yet viewed", priority: "low", icon: FileText },
];

// ── Holdings data
const HOLDINGS = [
  { name: "US Large Cap Equity", ticker: "VTI", value: 854100, weight: 30.0, targetWeight: 28.0, change: 1.24, sector: "Equity", cost: 712000, shares: 2940 },
  { name: "International Developed", ticker: "VXUS", value: 569400, weight: 20.0, targetWeight: 20.0, change: -0.38, sector: "Equity", cost: 530000, shares: 9200 },
  { name: "US Aggregate Bond", ticker: "BND", value: 427050, weight: 15.0, targetWeight: 16.0, change: 0.12, sector: "Fixed Income", cost: 420000, shares: 5800 },
  { name: "US Mid Cap Growth", ticker: "VOT", value: 341640, weight: 12.0, targetWeight: 11.0, change: 1.87, sector: "Equity", cost: 295000, shares: 1420 },
  { name: "TIPS (Inflation Protected)", ticker: "VTIP", value: 227480, weight: 8.0, targetWeight: 8.0, change: 0.05, sector: "Fixed Income", cost: 222000, shares: 4500 },
  { name: "Real Estate (REITs)", ticker: "VNQ", value: 170820, weight: 6.0, targetWeight: 6.0, change: -0.72, sector: "Alternatives", cost: 180000, shares: 1900 },
  { name: "Emerging Markets", ticker: "VWO", value: 142350, weight: 5.0, targetWeight: 5.0, change: 0.93, sector: "Equity", cost: 128000, shares: 3300 },
  { name: "Cash & Equivalents", ticker: "VMFXX", value: 113880, weight: 4.0, targetWeight: 6.0, change: 0.01, sector: "Cash", cost: 113880, shares: 113880 },
];

const ALLOCATION_DATA = [
  { name: "Equity", value: 67, target: 64, color: "#C9A55C" },
  { name: "Fixed Income", value: 23, target: 24, color: "#6B8F9E" },
  { name: "Alternatives", value: 6, target: 6, color: "#9B7E5E" },
  { name: "Cash", value: 4, target: 6, color: "#5A6270" },
];

const CONTRIBUTORS = [
  { name: "US Mid Cap Growth", ticker: "VOT", contribution: "+$6,380", pct: "+1.87%", positive: true },
  { name: "US Large Cap Equity", ticker: "VTI", contribution: "+$10,590", pct: "+1.24%", positive: true },
  { name: "Emerging Markets", ticker: "VWO", contribution: "+$1,325", pct: "+0.93%", positive: true },
  { name: "Real Estate (REITs)", ticker: "VNQ", contribution: "-$1,230", pct: "-0.72%", positive: false },
  { name: "International Developed", ticker: "VXUS", contribution: "-$2,165", pct: "-0.38%", positive: false },
];

const INCOME_PROJECTION = (() => {
  const d = [];
  for (let y = 2026; y <= 2050; y++) d.push({ year: y.toString(), social: y >= 2032 ? 42000 : 0, portfolio: Math.round(95000 + (y - 2026) * 2800 + Math.random() * 5000), pension: y >= 2030 ? 28000 : 0 });
  return d;
})();

const PORTFOLIO_HISTORY = (() => {
  const d = []; let v = 2847000;
  for (let i = 90; i >= 0; i--) { v += (Math.random() - 0.48) * v * 0.008; d.push({ date: new Date(Date.now() - i * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: Math.round(v), benchmark: Math.round(2650000 + (90 - i) * 2100 + Math.random() * 15000) }); }
  return d;
})();

const SCENARIOS = (() => {
  const d = [];
  for (let age = 52; age <= 95; age++) d.push({ age: age.toString(), base: Math.round(4820000 * Math.pow(1.055, age - 52) - (age >= 62 ? (age - 62) * 140000 : 0)), conservative: Math.round(4820000 * Math.pow(1.035, age - 52) - (age >= 62 ? (age - 62) * 140000 : 0)), aggressive: Math.round(4820000 * Math.pow(1.075, age - 52) - (age >= 62 ? (age - 62) * 140000 : 0)) });
  return d;
})();

const PERFORMANCE_INDEXED = (() => {
  const d = []; let p = 100, b = 100;
  for (const m of ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]) { p += (Math.random() - 0.42) * 4; b += (Math.random() - 0.45) * 3.5; d.push({ month: m, portfolio: +p.toFixed(2), benchmark: +b.toFixed(2) }); }
  return d;
})();

const TAX_PROJECTION = (() => {
  const d = []; let c = 0;
  for (const m of ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]) { c += Math.round(2800 + Math.random() * 1500); d.push({ month: m, withPlanning: c, withoutPlanning: Math.round(c * 1.32) }); }
  return d;
})();

const TLH_ACTIVITY = [
  { ticker: "VXUS", date: "Mar 12", loss: 3180, replacement: "IXUS" },
  { ticker: "VNQ", date: "Jan 28", loss: 2840, replacement: "SCHH" },
  { ticker: "VWO", date: "Feb 14", loss: 1650, replacement: "IEMG" },
  { ticker: "VOT", date: "Apr 02", loss: 750, replacement: "IJK" },
];

const TAX_ACCOUNTS = [
  { name: "Joint Brokerage", type: "Taxable", value: 1420000, icon: Briefcase },
  { name: "Traditional IRA", type: "Tax-Deferred", value: 680000, icon: Lock },
  { name: "Roth IRA", type: "Tax-Free", value: 420000, icon: Unlock },
  { name: "401(k)", type: "Tax-Deferred", value: 326720, icon: Building },
];

const PLAN_INSURANCE = [
  { type: "Term Life ($2M)", status: "active", provider: "Northwestern Mutual", renewal: "2032", icon: Heart },
  { type: "Umbrella ($3M)", status: "active", provider: "Chubb", renewal: "2026", icon: Umbrella },
  { type: "Homeowners", status: "active", provider: "State Farm", renewal: "2026", icon: Home },
  { type: "Auto", status: "active", provider: "GEICO", renewal: "2026", icon: Car },
  { type: "Long-Term Care", status: "review", provider: "Not yet established", renewal: "—", icon: Shield },
];

const PLAN_ESTATE = [
  { doc: "Revocable Living Trust", status: "current", updated: "Sep 2024", icon: CheckCircle },
  { doc: "Pour-Over Will", status: "current", updated: "Sep 2024", icon: CheckCircle },
  { doc: "Healthcare Directive", status: "current", updated: "Sep 2024", icon: CheckCircle },
  { doc: "Financial Power of Attorney", status: "current", updated: "Sep 2024", icon: CheckCircle },
  { doc: "Beneficiary Designations", status: "review", updated: "Mar 2022", icon: AlertTriangle },
];

const DOCUMENTS = [
  { name: "Q1 2026 Portfolio Report", date: "Apr 01, 2026", size: "2.4 MB", icon: BarChart3, category: "Statements", viewed: false },
  { name: "Q4 2025 Portfolio Report", date: "Jan 05, 2026", size: "2.1 MB", icon: BarChart3, category: "Statements", viewed: true },
  { name: "2025 Tax Summary (1099)", date: "Feb 15, 2026", size: "1.8 MB", icon: Receipt, category: "Tax", viewed: true },
  { name: "2025 Tax-Loss Harvest Report", date: "Dec 31, 2025", size: "890 KB", icon: Calculator, category: "Tax", viewed: true },
  { name: "Financial Plan — Full Update", date: "Nov 15, 2025", size: "5.2 MB", icon: Target, category: "Planning", viewed: true },
  { name: "Retirement Income Analysis", date: "Nov 15, 2025", size: "3.1 MB", icon: Sun, category: "Planning", viewed: true },
  { name: "Revocable Living Trust", date: "Sep 10, 2024", size: "4.8 MB", icon: Shield, category: "Legal", viewed: true },
  { name: "Pour-Over Will", date: "Sep 10, 2024", size: "1.2 MB", icon: FileText, category: "Legal", viewed: true },
  { name: "Investment Policy Statement", date: "Jan 20, 2025", size: "1.4 MB", icon: BookOpen, category: "Policy", viewed: true },
  { name: "ADV Part 2 — Allworth Financial", date: "Mar 30, 2026", size: "2.0 MB", icon: Info, category: "Policy", viewed: false },
  { name: "Fee Schedule Agreement", date: "Jan 20, 2025", size: "680 KB", icon: DollarSign, category: "Policy", viewed: true },
];

const RISK_METRICS = [
  { label: "Sharpe Ratio", value: "1.42", benchmark: "1.15", better: true },
  { label: "Sortino Ratio", value: "1.87", benchmark: "1.34", better: true },
  { label: "Max Drawdown", value: "-8.3%", benchmark: "-12.1%", better: true },
  { label: "Beta", value: "0.82", benchmark: "1.00", better: true },
  { label: "Alpha (ann.)", value: "+2.4%", benchmark: "0.0%", better: true },
  { label: "Std Deviation", value: "11.2%", benchmark: "14.8%", better: true },
];

const RADAR_DATA = [
  { metric: "Return", portfolio: 88, benchmark: 72 },
  { metric: "Risk Mgmt", portfolio: 92, benchmark: 65 },
  { metric: "Tax Eff.", portfolio: 85, benchmark: 50 },
  { metric: "Diversif.", portfolio: 78, benchmark: 70 },
  { metric: "Liquidity", portfolio: 90, benchmark: 85 },
  { metric: "Income", portfolio: 75, benchmark: 68 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS & REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const ChartTooltip = ({ active, payload, label, prefix = "$" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(15,17,21,0.96)", border: "1px solid rgba(201,165,92,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "var(--f-body)" }}>
      <p style={{ color: "#8A919E", margin: 0, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || "#C9A55C", margin: 0, fontWeight: 600 }}>{p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>)}
    </div>
  );
};

const Card = ({ children, title, icon: Icon, timestamp, source, className = "", style = {} }) => (
  <div className={`aw-c ${className}`} style={style}>
    {title && (
      <div className="aw-c-head">
        <div className="aw-c-title">{Icon && <Icon size={13} />} {title}</div>
        {(timestamp || source) && <div className="aw-c-meta">{timestamp && <span>{timestamp}</span>}{source && <span> · {source}</span>}</div>}
      </div>
    )}
    {children}
  </div>
);

const StatCard = ({ label, value, sub, icon: Icon, trend, accent }) => (
  <div className="aw-stat">
    <div className="aw-stat-top">
      <div className={`aw-stat-ico ${accent || ""}`}>{Icon && <Icon size={15} />}</div>
      <span className="aw-stat-lbl">{label}</span>
    </div>
    <div className="aw-stat-val">{value}</div>
    {sub && <div className={`aw-stat-sub ${trend || ""}`}>{sub}</div>}
  </div>
);

const PlanGauge = ({ label, percent, icon: Icon, status, current, target }) => (
  <div className="aw-gauge">
    <div className="aw-gauge-top">
      <div className={`aw-gauge-ico ${status}`}><Icon size={15} /></div>
      <div className="aw-gauge-info">
        <div className="aw-gauge-lbl">{label}</div>
        <div className="aw-gauge-nums">{current} <span className="aw-gauge-of">of {target}</span></div>
      </div>
      <div className="aw-gauge-pct">{percent}%</div>
    </div>
    <div className="aw-gauge-bar"><div className={`aw-gauge-fill ${status}`} style={{ width: `${percent}%` }} /></div>
  </div>
);

const Badge = ({ status, label }) => (
  <span className={`aw-badge ${status}`}>{label}</span>
);

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW — The Private Wealth Cockpit
// ═══════════════════════════════════════════════════════════════════════════════

function OverviewTab({ balanceVisible, setBalanceVisible }) {
  return (
    <>
      {/* ROW 1: Executive Summary */}
      <section className="aw-section aw-anim aw-d1">
        <div className="aw-exec-row">
          <div className="aw-exec-hero">
            <div className="aw-exec-label">
              <span>Net Worth</span>
              <button className="aw-vis-btn" onClick={() => setBalanceVisible(!balanceVisible)}>{balanceVisible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
            </div>
            <div className={`aw-exec-val ${!balanceVisible ? "masked" : ""}`}>${(CLIENT.netWorth / 1e6).toFixed(2)}M</div>
            <div className="aw-exec-chg positive">
              <ArrowUpRight size={13} /> +${CLIENT.netWorthChange.toLocaleString()} (+{CLIENT.netWorthChangePct}%) today
            </div>
          </div>
          <StatCard label="Today's Impact" value={`+$${CLIENT.portfolioDayChange.toLocaleString()}`} sub="Portfolio value change" icon={Activity} trend="positive" accent="green" />
          <StatCard label="Retirement Plan" value={`${CLIENT.monteCarlo}%`} sub="Monte Carlo confidence" icon={Target} trend="positive" accent="gold" />
          <StatCard label="Tax Opportunity" value={`$${(CLIENT.ytdTaxSavings / 1000).toFixed(1)}K`} sub={`of $${CLIENT.taxTarget / 1000}K target saved`} icon={Calculator} accent="blue" />
        </div>
      </section>

      {/* ROW 2: What changed & why it matters */}
      <section className="aw-section aw-anim aw-d2">
        <div className="aw-two-col">
          {/* Left: Market & Rates */}
          <Card title="What Changed Today" icon={Activity} timestamp={MARKET_CONTEXT.asOf} source="Market data">
            <div className="aw-mkt-grid">
              {MARKET_CONTEXT.indices.map(idx => (
                <div className="aw-mkt-item" key={idx.name}>
                  <span className="aw-mkt-name">{idx.name}</span>
                  <span className="aw-mkt-val">{idx.value}</span>
                  <span className={`aw-mkt-chg ${idx.direction}`}>{idx.change}</span>
                </div>
              ))}
            </div>
            <p className="aw-mkt-note">{MARKET_CONTEXT.headline}</p>
            <div className="aw-mkt-disc">Market commentary is informational only and does not constitute personalized investment advice.</div>
          </Card>

          {/* Right: Personalized Impact */}
          <Card title="How This Affects Your Plan" icon={Zap} timestamp={CLIENT.lastSync} source="Personalized analysis">
            <div className="aw-impact-list">
              {IMPACT_BULLETS.map((b, i) => (
                <div className="aw-impact" key={i}>
                  <div className="aw-impact-ico" style={{ color: b.color }}><b.icon size={14} /></div>
                  <div className="aw-impact-body">
                    <div className="aw-impact-text">{b.text}</div>
                    <span className="aw-impact-cat">{b.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ROW 3: Client Plan Health (goals-first) */}
      <section className="aw-section aw-anim aw-d3">
        <div className="aw-section-head">
          <h3 className="aw-sh-title"><Shield size={14} /> Plan Health</h3>
          <span className="aw-sh-meta">Updated {CLIENT.lastSync}</span>
        </div>
        <div className="aw-gauge-grid">
          <PlanGauge label="Retirement Readiness" percent={CLIENT.retirementReadiness} icon={Sun} status="on-track" current={`$${(CLIENT.retirementCurrent / 1e6).toFixed(2)}M`} target={`$${(CLIENT.retirementTarget / 1e6).toFixed(1)}M`} />
          <PlanGauge label="Withdrawal Sustainability" percent={CLIENT.withdrawalSustainability} icon={Wallet} status="on-track" current="91%" target="100%" />
          <PlanGauge label="Tax Efficiency" percent={CLIENT.taxEfficiency} icon={Landmark} status="attention" current={`$${(CLIENT.ytdTaxSavings / 1000).toFixed(1)}K`} target={`$${CLIENT.taxTarget / 1000}K`} />
          <PlanGauge label="Estate & Insurance" percent={CLIENT.estateReadiness} icon={Shield} status="on-track" current="92%" target="100%" />
        </div>
      </section>

      {/* ROW 4: Portfolio Intelligence */}
      <section className="aw-section aw-anim aw-d4">
        <div className="aw-two-col">
          <Card title="Allocation vs. Target" icon={PieIcon} timestamp={CLIENT.lastSync} source="Orion">
            <div className="aw-alloc-table">
              {ALLOCATION_DATA.map(a => {
                const drift = a.value - a.target;
                return (
                  <div className="aw-alloc-row" key={a.name}>
                    <div className="aw-alloc-dot" style={{ background: a.color }} />
                    <span className="aw-alloc-name">{a.name}</span>
                    <span className="aw-alloc-pct">{a.value}%</span>
                    <span className="aw-alloc-target">target {a.target}%</span>
                    <span className={`aw-alloc-drift ${drift > 0 ? "over" : drift < 0 ? "under" : "ok"}`}>
                      {drift > 0 ? `+${drift}%` : drift < 0 ? `${drift}%` : "on target"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="aw-alloc-note"><AlertTriangle size={12} /> Equity allocation 3% above target — rebalance recommended at next review</div>
          </Card>

          <Card title="Top Contributors / Detractors" icon={BarChart3} timestamp="Today" source="Portfolio analytics">
            <div className="aw-contrib-list">
              {CONTRIBUTORS.map(c => (
                <div className="aw-contrib" key={c.ticker}>
                  <div className="aw-contrib-left">
                    <span className="aw-contrib-name">{c.name}</span>
                    <span className="aw-contrib-ticker">{c.ticker}</span>
                  </div>
                  <span className={`aw-contrib-val ${c.positive ? "pos" : "neg"}`}>{c.contribution}</span>
                  <span className={`aw-contrib-pct ${c.positive ? "pos" : "neg"}`}>{c.pct}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ROW 5: Recommended Actions */}
      <section className="aw-section aw-anim aw-d5">
        <div className="aw-section-head">
          <h3 className="aw-sh-title"><CheckCircle size={14} /> Recommended Actions</h3>
        </div>
        <div className="aw-action-grid">
          {ACTIONS.map((a, i) => (
            <div className={`aw-action aw-action-${a.priority}`} key={i}>
              <div className="aw-action-ico"><a.icon size={15} /></div>
              <div className="aw-action-body">
                <div className="aw-action-label">{a.label}</div>
                <div className="aw-action-desc">{a.desc}</div>
              </div>
              <Badge status={a.priority} label={a.priority} />
              <ChevronRight size={14} className="aw-action-arrow" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: INVESTMENTS
// ═══════════════════════════════════════════════════════════════════════════════

function InvestmentsTab() {
  const [view, setView] = useState("allocation");
  return (
    <>
      <div className="aw-sub-nav aw-anim">
        {["allocation","performance","risk","holdings"].map(v => (
          <button key={v} className={`aw-sub-tab ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
        ))}
      </div>

      {view === "allocation" && (<>
        <div className="aw-stat-grid-4 aw-anim aw-d1">
          <StatCard label="Portfolio Value" value={`$${(CLIENT.portfolioValue / 1e6).toFixed(2)}M`} sub={`+${CLIENT.portfolioDayChangePct}% today`} icon={Briefcase} trend="positive" />
          <StatCard label="YTD Return" value={`+${CLIENT.ytdReturn}%`} sub={`Benchmark +${CLIENT.benchmarkYtdReturn}%`} icon={TrendingUp} trend="positive" />
          <StatCard label="Alpha" value="+4.2%" sub="vs 60/40 benchmark" icon={Zap} trend="positive" accent="gold" />
          <StatCard label="Allocation Drift" value="3.0%" sub="Equity overweight" icon={AlertTriangle} accent="warn" />
        </div>
        <div className="aw-two-col aw-anim aw-d2">
          <Card title="Asset Allocation — Current vs. Target" icon={PieIcon} timestamp={CLIENT.lastSync}>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <div style={{ width: 160, height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={ALLOCATION_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none">{ALLOCATION_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="aw-alloc-table" style={{ flex: 1 }}>
                {ALLOCATION_DATA.map(a => { const d = a.value - a.target; return (
                  <div className="aw-alloc-row" key={a.name}><div className="aw-alloc-dot" style={{ background: a.color }} /><span className="aw-alloc-name">{a.name}</span><span className="aw-alloc-pct">{a.value}%</span><span className="aw-alloc-target">→ {a.target}%</span><span className={`aw-alloc-drift ${d > 0 ? "over" : d < 0 ? "under" : "ok"}`}>{d > 0 ? `+${d}` : d < 0 ? d : "—"}%</span></div>
                ); })}
              </div>
            </div>
          </Card>
          <Card title="Portfolio Growth (90 Days)" icon={TrendingUp} timestamp={CLIENT.lastSync} source="Orion">
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PORTFOLIO_HISTORY}>
                  <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C9A55C" stopOpacity={0.2} /><stop offset="100%" stopColor="#C9A55C" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#555B67", fontSize: 10 }} interval={14} />
                  <YAxis hide domain={["dataMin - 30000", "dataMax + 30000"]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="benchmark" name="Benchmark" stroke="#6B8F9E" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
                  <Area type="monotone" dataKey="value" name="Portfolio" stroke="#C9A55C" strokeWidth={2} fill="url(#pg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </>)}

      {view === "performance" && (<>
        <div className="aw-two-col aw-anim aw-d1">
          <Card title="Cumulative Return (Indexed)" icon={TrendingUp}>
            <div style={{ height: 300 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={PERFORMANCE_INDEXED}><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#555B67", fontSize: 10 }} /><YAxis hide /><Tooltip content={<ChartTooltip prefix="" />} /><Line type="monotone" dataKey="portfolio" name="Portfolio" stroke="#C9A55C" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#6B8F9E" strokeWidth={1.5} strokeDasharray="4 4" dot={false} /></LineChart></ResponsiveContainer></div>
          </Card>
          <Card title="Top Contributors / Detractors" icon={BarChart3}>
            <div className="aw-contrib-list">
              {CONTRIBUTORS.map(c => (<div className="aw-contrib" key={c.ticker}><div className="aw-contrib-left"><span className="aw-contrib-name">{c.name}</span><span className="aw-contrib-ticker">{c.ticker}</span></div><span className={`aw-contrib-val ${c.positive ? "pos" : "neg"}`}>{c.contribution}</span><span className={`aw-contrib-pct ${c.positive ? "pos" : "neg"}`}>{c.pct}</span></div>))}
            </div>
          </Card>
        </div>
      </>)}

      {view === "risk" && (
        <div className="aw-two-col aw-anim aw-d1">
          <Card title="Risk Analytics vs. Benchmark" icon={Shield}>
            <table className="aw-tbl"><thead><tr><th>Metric</th><th>Portfolio</th><th>Benchmark</th><th></th></tr></thead><tbody>
              {RISK_METRICS.map(m => (<tr key={m.label}><td className="aw-tbl-label">{m.label}</td><td className="aw-tbl-val">{m.value}</td><td className="aw-tbl-muted">{m.benchmark}</td><td style={{ textAlign: "right" }}>{m.better && <Badge status="on-track" label="Better" />}</td></tr>))}
            </tbody></table>
          </Card>
          <Card title="Portfolio Quality Radar" icon={Target}>
            <div style={{ height: 300 }}><ResponsiveContainer width="100%" height="100%"><RadarChart data={RADAR_DATA}><PolarGrid stroke="rgba(255,255,255,0.06)" /><PolarAngleAxis dataKey="metric" tick={{ fill: "#8A919E", fontSize: 11 }} /><PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} /><Radar name="Portfolio" dataKey="portfolio" stroke="#C9A55C" fill="#C9A55C" fillOpacity={0.15} strokeWidth={2} /><Radar name="Benchmark" dataKey="benchmark" stroke="#6B8F9E" fill="#6B8F9E" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" /></RadarChart></ResponsiveContainer></div>
          </Card>
        </div>
      )}

      {view === "holdings" && (
        <Card title="Holdings Detail" icon={Layers} className="aw-anim aw-d1" timestamp={CLIENT.lastSync} source="Schwab Custody">
          <table className="aw-tbl"><thead><tr><th>Holding</th><th>Shares</th><th>Cost</th><th>Value</th><th>Gain/Loss</th><th>Weight</th><th>Drift</th></tr></thead><tbody>
            {HOLDINGS.map(h => { const gl = h.value - h.cost; const drift = (h.weight - h.targetWeight).toFixed(1); return (
              <tr key={h.ticker}><td><span className="aw-h-name">{h.name}</span><span className="aw-h-tick">{h.ticker}</span></td><td className="aw-tbl-muted">{h.shares.toLocaleString()}</td><td className="aw-tbl-muted">${h.cost.toLocaleString()}</td><td className="aw-tbl-val">${h.value.toLocaleString()}</td><td><span className={gl >= 0 ? "aw-pos" : "aw-neg"}>{gl >= 0 ? "+" : ""}${gl.toLocaleString()}</span></td><td className="aw-tbl-val">{h.weight}%</td><td><span className={`aw-alloc-drift ${parseFloat(drift) > 0 ? "over" : parseFloat(drift) < 0 ? "under" : "ok"}`}>{parseFloat(drift) > 0 ? "+" : ""}{drift}%</span></td></tr>
            ); })}
          </tbody></table>
        </Card>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: PLANNING
// ═══════════════════════════════════════════════════════════════════════════════

function PlanningTab() {
  return (
    <>
      <div className="aw-stat-grid-4 aw-anim aw-d1">
        <StatCard label="Net Worth" value={`$${(CLIENT.netWorth / 1e6).toFixed(2)}M`} icon={Wallet} />
        <StatCard label="Retirement In" value={`${CLIENT.retirementAge - CLIENT.currentAge} years`} sub={`Age ${CLIENT.retirementAge} target`} icon={Sun} />
        <StatCard label="Monte Carlo" value={`${CLIENT.monteCarlo}%`} sub="Plan success probability" icon={Target} trend="positive" accent="gold" />
        <StatCard label="Monthly Need" value="$12,400" sub="Post-retirement income" icon={CreditCard} />
      </div>

      <Card title="Wealth Projection Scenarios" icon={BarChart3} className="aw-anim aw-d2" timestamp="Nov 2025 plan update" source="Financial plan model" style={{ marginBottom: 24 }}>
        <div className="aw-legend-row">
          <span className="aw-legend-item"><span className="aw-legend-dot" style={{ background: "#C9A55C" }} /> Base (5.5%)</span>
          <span className="aw-legend-item"><span className="aw-legend-dot" style={{ background: "#6B8F9E" }} /> Conservative (3.5%)</span>
          <span className="aw-legend-item"><span className="aw-legend-dot" style={{ background: "#4ADE80" }} /> Aggressive (7.5%)</span>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SCENARIOS}>
              <defs><linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C9A55C" stopOpacity={0.12} /><stop offset="100%" stopColor="#C9A55C" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fill: "#555B67", fontSize: 10 }} interval={5} />
              <YAxis hide /><Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="aggressive" name="Aggressive" stroke="#4ADE80" strokeWidth={1.5} fill="none" dot={false} />
              <Area type="monotone" dataKey="base" name="Base" stroke="#C9A55C" strokeWidth={2} fill="url(#bG)" dot={false} />
              <Area type="monotone" dataKey="conservative" name="Conservative" stroke="#6B8F9E" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="aw-mkt-disc">Projections are illustrative and based on assumptions from your November 2025 financial plan. Actual results may differ materially.</div>
      </Card>

      <Card title="Retirement Income Sources" icon={DollarSign} className="aw-anim aw-d3" style={{ marginBottom: 24 }}>
        <div className="aw-legend-row">
          <span className="aw-legend-item"><span className="aw-legend-dot" style={{ background: "#C9A55C" }} /> Portfolio</span>
          <span className="aw-legend-item"><span className="aw-legend-dot" style={{ background: "#6B8F9E" }} /> Social Security</span>
          <span className="aw-legend-item"><span className="aw-legend-dot" style={{ background: "#9B7E5E" }} /> Pension</span>
        </div>
        <div style={{ height: 220 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={INCOME_PROJECTION} barSize={8}><XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#555B67", fontSize: 9 }} interval={4} /><YAxis hide /><Tooltip content={<ChartTooltip />} /><Bar dataKey="portfolio" name="Portfolio" stackId="a" fill="#C9A55C" /><Bar dataKey="social" name="Social Security" stackId="a" fill="#6B8F9E" /><Bar dataKey="pension" name="Pension" stackId="a" fill="#9B7E5E" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card>

      <div className="aw-two-col aw-anim aw-d4">
        <Card title="Insurance Coverage" icon={Umbrella}>
          {PLAN_INSURANCE.map(ins => (
            <div className="aw-row-item" key={ins.type}>
              <div className={`aw-row-ico ${ins.status === "active" ? "green" : "warn"}`}><ins.icon size={15} /></div>
              <div className="aw-row-body"><div className="aw-row-title">{ins.type}</div><div className="aw-row-sub">{ins.provider}{ins.renewal !== "—" ? ` · Renews ${ins.renewal}` : ""}</div></div>
              <Badge status={ins.status === "active" ? "on-track" : "attention"} label={ins.status === "active" ? "Active" : "Review"} />
            </div>
          ))}
        </Card>
        <Card title="Estate Documents" icon={Shield}>
          {PLAN_ESTATE.map(e => (
            <div className="aw-row-item" key={e.doc}>
              <div className={`aw-row-ico ${e.status === "current" ? "green" : "warn"}`}><e.icon size={15} /></div>
              <div className="aw-row-body"><div className="aw-row-title">{e.doc}</div><div className="aw-row-sub">Updated {e.updated}</div></div>
              <Badge status={e.status === "current" ? "on-track" : "attention"} label={e.status === "current" ? "Current" : "Review"} />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: TAX CENTER
// ═══════════════════════════════════════════════════════════════════════════════

function TaxCenterTab() {
  return (
    <>
      <div className="aw-stat-grid-4 aw-anim aw-d1">
        <StatCard label="Effective Tax Rate" value={`${CLIENT.effectiveRate}%`} sub={`Marginal: ${CLIENT.marginalRate}%`} icon={Percent} />
        <StatCard label="TLH Savings YTD" value={`$${CLIENT.tlhSavings.toLocaleString()}`} sub="Tax-loss harvesting" icon={PiggyBank} trend="positive" accent="green" />
        <StatCard label="Roth Opportunity" value={`$${(CLIENT.rothConversionOpportunity / 1000).toFixed(0)}K`} sub="Conversion window open" icon={Zap} accent="gold" />
        <StatCard label="Tax Efficiency Score" value={`${CLIENT.taxEfficiency}%`} sub={`$${(CLIENT.ytdTaxSavings / 1000).toFixed(1)}K saved of $${CLIENT.taxTarget / 1000}K goal`} icon={Target} />
      </div>

      <div className="aw-two-col aw-anim aw-d2">
        <Card title="Cumulative Tax Liability — With vs. Without Planning" icon={Calculator} source="Tax model">
          <div className="aw-legend-row">
            <span className="aw-legend-item"><span className="aw-legend-dot" style={{ background: "#C9A55C" }} /> With Allworth Planning</span>
            <span className="aw-legend-item"><span className="aw-legend-dot" style={{ background: "#F87171" }} /> Without Planning</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TAX_PROJECTION}>
                <defs><linearGradient id="ts" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C9A55C" stopOpacity={0.15} /><stop offset="100%" stopColor="#C9A55C" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#555B67", fontSize: 10 }} /><YAxis hide /><Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="withoutPlanning" name="Without" stroke="#F87171" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
                <Area type="monotone" dataKey="withPlanning" name="With Planning" stroke="#C9A55C" strokeWidth={2} fill="url(#ts)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Account Tax Locations" icon={Building}>
          {TAX_ACCOUNTS.map(a => (
            <div className="aw-row-item" key={a.name}>
              <div className="aw-row-ico gold"><a.icon size={15} /></div>
              <div className="aw-row-body"><div className="aw-row-title">{a.name}</div><div className={`aw-row-sub ${a.type === "Tax-Free" ? "green-text" : a.type === "Tax-Deferred" ? "gold-text" : ""}`}>{a.type}</div></div>
              <span className="aw-row-val">${a.value.toLocaleString()}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card title="Tax-Loss Harvesting Activity" icon={Zap} className="aw-anim aw-d3" timestamp="YTD 2026">
        <table className="aw-tbl"><thead><tr><th>Sold</th><th>Date</th><th>Loss Realized</th><th>Replacement</th></tr></thead><tbody>
          {TLH_ACTIVITY.map(h => (<tr key={h.ticker + h.date}><td><span className="aw-h-tick" style={{ marginLeft: 0 }}>{h.ticker}</span></td><td className="aw-tbl-muted">{h.date}</td><td className="aw-pos">-${h.loss.toLocaleString()}</td><td><span className="aw-h-tick aw-h-tick-alt" style={{ marginLeft: 0 }}>{h.replacement}</span></td></tr>))}
        </tbody></table>
        <div className="aw-callout green"><CheckCircle size={13} /> Total harvested: ${TLH_ACTIVITY.reduce((s, h) => s + h.loss, 0).toLocaleString()} → estimated savings of ${CLIENT.tlhSavings.toLocaleString()}</div>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════════

function DocumentsTab() {
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...new Set(DOCUMENTS.map(d => d.category))];
  const list = filter === "All" ? DOCUMENTS : DOCUMENTS.filter(d => d.category === filter);
  return (
    <>
      <div className="aw-sub-nav aw-anim">{cats.map(c => (<button key={c} className={`aw-sub-tab ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>))}</div>
      <Card className="aw-anim aw-d1">
        <table className="aw-tbl"><thead><tr><th style={{ width: 28 }}></th><th>Document</th><th>Category</th><th>Date</th><th>Size</th><th></th></tr></thead><tbody>
          {list.map((d, i) => (
            <tr key={i}>
              <td><d.icon size={15} style={{ color: "var(--gold)" }} /></td>
              <td><span className="aw-h-name">{d.name}</span>{!d.viewed && <span className="aw-new-dot" />}</td>
              <td><Badge status="neutral" label={d.category} /></td>
              <td className="aw-tbl-muted">{d.date}</td>
              <td className="aw-tbl-muted" style={{ fontFamily: "var(--f-mono)", fontSize: 11 }}>{d.size}</td>
              <td style={{ textAlign: "right" }}><button className="aw-dl-btn"><Download size={12} /> Download</button></td>
            </tr>
          ))}
        </tbody></table>
      </Card>
      <div className="aw-upload-cta aw-anim aw-d2">
        <div className="aw-row-ico gold"><Upload size={16} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500, color: "var(--t1)" }}>Upload tax files or documents</div><div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>Securely share files with your advisor team</div></div>
        <button className="aw-primary-btn">Upload Files</button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL
// ═══════════════════════════════════════════════════════════════════════════════

export default function AllworthDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [balanceVisible, setBalanceVisible] = useState(false);
  const TABS = ["overview", "investments", "planning", "tax center", "documents"];

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab balanceVisible={balanceVisible} setBalanceVisible={setBalanceVisible} />;
      case "investments": return <InvestmentsTab />;
      case "planning": return <PlanningTab />;
      case "tax center": return <TaxCenterTab />;
      case "documents": return <DocumentsTab />;
      default: return null;
    }
  };

  return (
    <div className="aw">
      <style>{CSS}</style>
      <header className="aw-top">
        <div className="aw-logo">
          <div className="aw-logo-mark">A</div>
          <div><div className="aw-logo-name">Allworth Financial</div><div className="aw-logo-sub">Client Portal</div></div>
        </div>
        <nav className="aw-tabs">{TABS.map(t => (<button key={t} className={`aw-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>))}</nav>
        <div className="aw-top-right">
          <div className="aw-sync"><CircleDot size={8} className="aw-sync-dot" /> <span>Synced {CLIENT.lastSync}</span></div>
          <div style={{ position: "relative", cursor: "pointer" }}><Bell size={17} color="var(--t3)" /><div className="aw-notif-dot" /></div>
          <div className="aw-avatar">{CLIENT.initials}</div>
        </div>
      </header>

      <main className="aw-main" key={activeTab}>{renderTab()}</main>

      {/* Sticky advisor sidebar — contextual, not generic */}
      <aside className="aw-aside">
        <div className="aw-aside-section">
          <div className="aw-aside-head">Your Advisor</div>
          <div className="aw-advisor-card">
            <div className="aw-advisor-av">{CLIENT.advisor.initials}</div>
            <div><div className="aw-advisor-nm">{CLIENT.advisor.name}</div><div className="aw-advisor-rl">{CLIENT.advisor.role}</div></div>
          </div>
          <button className="aw-primary-btn" style={{ width: "100%", justifyContent: "center", marginTop: 12 }}><Calendar size={13} /> Schedule Review</button>
          <button className="aw-ghost-btn" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}><MessageSquare size={13} /> Send Message</button>
        </div>
        <div className="aw-aside-section">
          <div className="aw-aside-head">Pending Items</div>
          {ACTIONS.filter(a => a.priority === "high").map((a, i) => (
            <div className="aw-aside-task" key={i}><a.icon size={13} className="aw-aside-task-ico" /><span>{a.label}</span></div>
          ))}
        </div>
        <div className="aw-aside-section">
          <div className="aw-aside-head">Recent Documents</div>
          {DOCUMENTS.slice(0, 3).map((d, i) => (
            <div className="aw-aside-doc" key={i}><d.icon size={13} style={{ color: "var(--gold)", flexShrink: 0 }} /><div><div className="aw-aside-doc-name">{d.name}</div><div className="aw-aside-doc-date">{d.date}</div></div></div>
          ))}
        </div>
        <div className="aw-aside-disc">
          Data sourced from {CLIENT.dataSource}. Values are estimated and may not reflect real-time account balances. This portal does not constitute investment advice. Consult your advisor for personalized recommendations.
        </div>
      </aside>

      <footer className="aw-footer">
        <div className="aw-footer-text">© {new Date().getFullYear()} Allworth Financial, L.P. · SEC Registered Investment Adviser · Fiduciary Standard</div>
        <div className="aw-footer-text">Data shown is illustrative. Past performance does not guarantee future results. <a href="#" style={{ color: "var(--gold)", textDecoration: "none" }}>Full disclosures</a></div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CSS — Design Token System
// ═══════════════════════════════════════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}

:root {
  /* Surfaces */
  --s0: #0A0C10; --s1: #0F1117; --s2: #141721; --s3: #1A1E28; --s4: #222632;
  /* Borders */
  --b1: rgba(201,165,92,0.08); --b2: rgba(201,165,92,0.15); --b3: rgba(201,165,92,0.25);
  /* Text */
  --t1: #E8E6E1; --t2: #A0A5AF; --t3: #636A77; --t4: #454B57;
  /* Accent */
  --gold: #C9A55C; --gold-light: #E2CA8A; --gold-dim: rgba(201,165,92,0.1);
  --green: #4ADE80; --green-dim: rgba(74,222,128,0.1);
  --red: #F87171; --red-dim: rgba(248,113,113,0.1);
  --blue: #6B8F9E; --blue-dim: rgba(107,143,158,0.1);
  --warn: #FBBF24; --warn-dim: rgba(251,191,36,0.1);
  /* Typography */
  --f-display: 'Playfair Display', Georgia, serif;
  --f-body: 'DM Sans', -apple-system, sans-serif;
  --f-mono: 'JetBrains Mono', monospace;
  /* Spacing */
  --sp-xs: 4px; --sp-sm: 8px; --sp-md: 16px; --sp-lg: 24px; --sp-xl: 32px;
  /* Radius */
  --r-sm: 6px; --r-md: 10px; --r-lg: 14px;
  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px var(--b1);
}

.aw { font-family: var(--f-body); background: var(--s0); color: var(--t1); min-height: 100vh; display: grid; grid-template-columns: 1fr 280px; grid-template-rows: auto 1fr auto; }
.aw ::selection { background: var(--gold); color: var(--s0); }

/* ─── Top Bar ─── */
.aw-top { grid-column: 1 / -1; position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 var(--sp-xl); height: 60px; background: rgba(10,12,16,0.9); backdrop-filter: blur(16px); border-bottom: 1px solid var(--b1); }
.aw-logo { display: flex; align-items: center; gap: 10px; }
.aw-logo-mark { width: 30px; height: 30px; background: linear-gradient(135deg, var(--gold), #9B7E5E); border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; font-family: var(--f-display); font-weight: 700; font-size: 15px; color: var(--s0); }
.aw-logo-name { font-family: var(--f-display); font-size: 16px; font-weight: 600; color: var(--t1); }
.aw-logo-sub { font-size: 9px; color: var(--t4); letter-spacing: 2px; text-transform: uppercase; }
.aw-tabs { display: flex; gap: 2px; background: var(--s1); padding: 3px; border-radius: var(--r-sm); }
.aw-tab { padding: 6px 16px; border-radius: 5px; font-size: 12.5px; font-weight: 500; color: var(--t3); cursor: pointer; transition: all 0.2s; border: none; background: transparent; font-family: var(--f-body); }
.aw-tab:hover { color: var(--t2); }
.aw-tab.active { background: var(--gold-dim); color: var(--gold); }
.aw-top-right { display: flex; align-items: center; gap: 14px; }
.aw-sync { font-size: 10px; color: var(--t4); display: flex; align-items: center; gap: 6px; font-family: var(--f-mono); }
.aw-sync-dot { color: var(--green); }
.aw-notif-dot { position: absolute; top: -1px; right: -1px; width: 6px; height: 6px; background: var(--red); border-radius: 50%; border: 1.5px solid var(--s0); }
.aw-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), #9B7E5E); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px; color: var(--s0); cursor: pointer; }

/* ─── Main ─── */
.aw-main { padding: var(--sp-lg) var(--sp-xl); overflow-y: auto; }

/* ─── Sidebar ─── */
.aw-aside { background: var(--s1); border-left: 1px solid var(--b1); padding: var(--sp-lg) var(--sp-md); overflow-y: auto; display: flex; flex-direction: column; gap: 0; }
.aw-aside-section { padding: var(--sp-md) 0; border-bottom: 1px solid var(--b1); }
.aw-aside-section:first-child { padding-top: 0; }
.aw-aside-section:last-of-type { border-bottom: none; }
.aw-aside-head { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--t4); margin-bottom: 12px; }
.aw-advisor-card { display: flex; align-items: center; gap: 10px; }
.aw-advisor-av { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--blue), #4A7A8A); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; color: white; flex-shrink: 0; }
.aw-advisor-nm { font-size: 13px; font-weight: 600; color: var(--t1); }
.aw-advisor-rl { font-size: 11px; color: var(--t3); }
.aw-aside-task { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 12px; color: var(--t2); cursor: pointer; transition: color 0.2s; }
.aw-aside-task:hover { color: var(--gold); }
.aw-aside-task-ico { color: var(--warn); flex-shrink: 0; }
.aw-aside-doc { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; cursor: pointer; }
.aw-aside-doc-name { font-size: 12px; color: var(--t2); line-height: 1.3; transition: color 0.2s; }
.aw-aside-doc:hover .aw-aside-doc-name { color: var(--gold); }
.aw-aside-doc-date { font-size: 10px; color: var(--t4); margin-top: 1px; }
.aw-aside-disc { font-size: 9.5px; color: var(--t4); line-height: 1.5; margin-top: auto; padding-top: var(--sp-md); }

/* ─── Footer ─── */
.aw-footer { grid-column: 1 / -1; border-top: 1px solid var(--b1); padding: var(--sp-md) var(--sp-xl); display: flex; justify-content: space-between; }
.aw-footer-text { font-size: 10px; color: var(--t4); }

/* ─── Sections ─── */
.aw-section { margin-bottom: var(--sp-lg); }
.aw-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-md); }
.aw-sh-title { font-size: 13px; font-weight: 600; color: var(--t2); display: flex; align-items: center; gap: 8px; }
.aw-sh-title svg { color: var(--gold); }
.aw-sh-meta { font-size: 10px; color: var(--t4); font-family: var(--f-mono); }

/* ─── Executive Summary Row ─── */
.aw-exec-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: var(--sp-md); }
.aw-exec-hero { background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r-lg); padding: 22px 26px; position: relative; overflow: hidden; }
.aw-exec-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.4; }
.aw-exec-label { font-size: 12px; color: var(--t3); display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.aw-exec-val { font-family: var(--f-display); font-size: 36px; font-weight: 600; color: var(--t1); letter-spacing: -0.5px; line-height: 1.1; margin-bottom: 6px; transition: filter 0.3s; }
.aw-exec-val.masked { filter: blur(12px); user-select: none; }
.aw-exec-chg { font-family: var(--f-mono); font-size: 12px; display: flex; align-items: center; gap: 4px; }
.aw-exec-chg.positive { color: var(--green); }
.aw-exec-chg.negative { color: var(--red); }
.aw-vis-btn { background: none; border: 1px solid var(--b1); border-radius: 5px; padding: 3px 5px; color: var(--t3); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; }
.aw-vis-btn:hover { border-color: var(--gold); color: var(--gold); }

/* ─── Stat Cards ─── */
.aw-stat-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-md); margin-bottom: var(--sp-lg); }
.aw-stat { background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r-lg); padding: 18px 20px; transition: border-color 0.2s; }
.aw-stat:hover { border-color: var(--b2); }
.aw-stat-top { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.aw-stat-ico { width: 32px; height: 32px; border-radius: var(--r-sm); background: var(--gold-dim); color: var(--gold); display: flex; align-items: center; justify-content: center; }
.aw-stat-ico.green { background: var(--green-dim); color: var(--green); }
.aw-stat-ico.blue { background: var(--blue-dim); color: var(--blue); }
.aw-stat-ico.warn { background: var(--warn-dim); color: var(--warn); }
.aw-stat-lbl { font-size: 11px; font-weight: 500; color: var(--t3); text-transform: uppercase; letter-spacing: 0.8px; }
.aw-stat-val { font-family: var(--f-display); font-size: 24px; font-weight: 600; color: var(--t1); line-height: 1.1; }
.aw-stat-sub { font-size: 11px; color: var(--t3); margin-top: 4px; font-family: var(--f-mono); }
.aw-stat-sub.positive { color: var(--green); }

/* ─── Two Column ─── */
.aw-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-lg); margin-bottom: var(--sp-lg); }

/* ─── Cards ─── */
.aw-c { background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r-lg); padding: 20px 22px; transition: border-color 0.2s; }
.aw-c:hover { border-color: var(--b2); }
.aw-c-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.aw-c-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--t4); display: flex; align-items: center; gap: 7px; }
.aw-c-title svg { color: var(--gold); }
.aw-c-meta { font-size: 9px; color: var(--t4); font-family: var(--f-mono); text-align: right; max-width: 180px; line-height: 1.4; }

/* ─── Market Context ─── */
.aw-mkt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.aw-mkt-item { padding: 10px 12px; background: var(--s1); border-radius: var(--r-sm); }
.aw-mkt-name { font-size: 10px; color: var(--t4); text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 4px; }
.aw-mkt-val { font-family: var(--f-mono); font-size: 14px; color: var(--t1); font-weight: 500; }
.aw-mkt-chg { font-family: var(--f-mono); font-size: 11px; margin-left: 8px; }
.aw-mkt-chg.up { color: var(--green); }
.aw-mkt-chg.down { color: var(--green); }
.aw-mkt-chg.flat { color: var(--t3); }
.aw-mkt-note { font-size: 12px; color: var(--t2); line-height: 1.5; margin-bottom: 10px; }
.aw-mkt-disc { font-size: 9.5px; color: var(--t4); font-style: italic; line-height: 1.4; padding-top: 10px; border-top: 1px solid var(--b1); }

/* ─── Personalized Impact ─── */
.aw-impact-list { display: flex; flex-direction: column; gap: 12px; }
.aw-impact { display: flex; gap: 12px; padding: 12px 14px; background: var(--s1); border-radius: var(--r-md); border-left: 3px solid transparent; transition: border-color 0.2s; }
.aw-impact:hover { border-left-color: var(--gold); }
.aw-impact-ico { width: 28px; height: 28px; border-radius: var(--r-sm); background: var(--s3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.aw-impact-text { font-size: 12.5px; color: var(--t1); line-height: 1.45; }
.aw-impact-cat { font-size: 9.5px; color: var(--t4); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; display: inline-block; }

/* ─── Plan Gauges ─── */
.aw-gauge-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-md); }
.aw-gauge { background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r-lg); padding: 18px 20px; }
.aw-gauge-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.aw-gauge-ico { width: 34px; height: 34px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.aw-gauge-ico.on-track { background: var(--green-dim); color: var(--green); }
.aw-gauge-ico.attention { background: var(--warn-dim); color: var(--warn); }
.aw-gauge-ico.complete { background: var(--gold-dim); color: var(--gold); }
.aw-gauge-info { flex: 1; min-width: 0; }
.aw-gauge-lbl { font-size: 12px; font-weight: 500; color: var(--t1); }
.aw-gauge-nums { font-size: 11px; color: var(--t3); margin-top: 2px; font-family: var(--f-mono); }
.aw-gauge-of { color: var(--t4); }
.aw-gauge-pct { font-family: var(--f-display); font-size: 22px; font-weight: 600; color: var(--t1); }
.aw-gauge-bar { height: 4px; background: var(--s4); border-radius: 2px; overflow: hidden; }
.aw-gauge-fill { height: 100%; border-radius: 2px; transition: width 1s ease; }
.aw-gauge-fill.on-track { background: var(--green); }
.aw-gauge-fill.attention { background: var(--warn); }
.aw-gauge-fill.complete { background: var(--gold); }

/* ─── Allocation ─── */
.aw-alloc-table { display: flex; flex-direction: column; gap: 8px; }
.aw-alloc-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.aw-alloc-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.aw-alloc-name { font-size: 12.5px; color: var(--t2); flex: 1; }
.aw-alloc-pct { font-family: var(--f-mono); font-size: 13px; color: var(--t1); font-weight: 500; width: 40px; text-align: right; }
.aw-alloc-target { font-family: var(--f-mono); font-size: 11px; color: var(--t4); width: 60px; }
.aw-alloc-drift { font-family: var(--f-mono); font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 3px; }
.aw-alloc-drift.over { color: var(--warn); background: var(--warn-dim); }
.aw-alloc-drift.under { color: var(--blue); background: var(--blue-dim); }
.aw-alloc-drift.ok { color: var(--t4); }
.aw-alloc-note { display: flex; align-items: center; gap: 6px; margin-top: 12px; padding: 10px 12px; background: var(--warn-dim); border-radius: var(--r-sm); font-size: 11.5px; color: var(--warn); }

/* ─── Contributors ─── */
.aw-contrib-list { display: flex; flex-direction: column; gap: 2px; }
.aw-contrib { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--r-sm); transition: background 0.15s; }
.aw-contrib:hover { background: var(--s1); }
.aw-contrib-left { flex: 1; min-width: 0; }
.aw-contrib-name { font-size: 12.5px; color: var(--t1); }
.aw-contrib-ticker { font-family: var(--f-mono); font-size: 10px; color: var(--gold); background: var(--gold-dim); padding: 1px 5px; border-radius: 3px; margin-left: 6px; }
.aw-contrib-val { font-family: var(--f-mono); font-size: 12.5px; font-weight: 500; width: 80px; text-align: right; }
.aw-contrib-pct { font-family: var(--f-mono); font-size: 11px; width: 50px; text-align: right; }
.aw-contrib-val.pos, .aw-contrib-pct.pos { color: var(--green); }
.aw-contrib-val.neg, .aw-contrib-pct.neg { color: var(--red); }

/* ─── Actions ─── */
.aw-action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.aw-action { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r-md); cursor: pointer; transition: all 0.2s; }
.aw-action:hover { border-color: var(--b3); background: var(--s3); }
.aw-action-ico { width: 32px; height: 32px; border-radius: var(--r-sm); background: var(--gold-dim); color: var(--gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.aw-action-high .aw-action-ico { background: var(--warn-dim); color: var(--warn); }
.aw-action-body { flex: 1; min-width: 0; }
.aw-action-label { font-size: 13px; font-weight: 500; color: var(--t1); }
.aw-action-desc { font-size: 11px; color: var(--t3); margin-top: 2px; }
.aw-action-arrow { color: var(--t4); flex-shrink: 0; }

/* ─── Badges ─── */
.aw-badge { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; padding: 3px 7px; border-radius: 3px; flex-shrink: 0; }
.aw-badge.high { background: var(--red-dim); color: var(--red); }
.aw-badge.medium { background: var(--warn-dim); color: var(--warn); }
.aw-badge.low { background: var(--blue-dim); color: var(--blue); }
.aw-badge.on-track { background: var(--green-dim); color: var(--green); }
.aw-badge.attention { background: var(--warn-dim); color: var(--warn); }
.aw-badge.neutral { background: var(--gold-dim); color: var(--gold); }

/* ─── Sub-nav ─── */
.aw-sub-nav { display: flex; gap: 2px; background: var(--s1); padding: 3px; border-radius: var(--r-sm); margin-bottom: var(--sp-lg); width: fit-content; }
.aw-sub-tab { padding: 6px 16px; border-radius: 5px; font-size: 12.5px; font-weight: 500; color: var(--t3); cursor: pointer; transition: all 0.2s; border: none; background: transparent; font-family: var(--f-body); }
.aw-sub-tab:hover { color: var(--t2); }
.aw-sub-tab.active { background: var(--gold-dim); color: var(--gold); }

/* ─── Tables ─── */
.aw-tbl { width: 100%; border-collapse: collapse; }
.aw-tbl th { text-align: left; font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--t4); padding: 0 0 10px; border-bottom: 1px solid var(--b1); }
.aw-tbl th:last-child, .aw-tbl td:last-child { text-align: right; }
.aw-tbl td { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 12.5px; vertical-align: middle; }
.aw-tbl tr:last-child td { border-bottom: none; }
.aw-tbl tr:hover td { background: rgba(201,165,92,0.015); }
.aw-tbl-label { color: var(--t2); }
.aw-tbl-val { font-family: var(--f-mono); font-weight: 500; color: var(--t1); }
.aw-tbl-muted { font-family: var(--f-mono); font-size: 12px; color: var(--t3); }
.aw-h-name { font-weight: 500; color: var(--t1); }
.aw-h-tick { font-family: var(--f-mono); font-size: 10px; color: var(--gold); background: var(--gold-dim); padding: 2px 5px; border-radius: 3px; margin-left: 6px; }
.aw-h-tick-alt { background: var(--blue-dim); color: var(--blue); }
.aw-pos { color: var(--green); font-family: var(--f-mono); }
.aw-neg { color: var(--red); font-family: var(--f-mono); }
.aw-new-dot { display: inline-block; width: 6px; height: 6px; background: var(--gold); border-radius: 50%; margin-left: 6px; vertical-align: middle; }

/* ─── Row Items ─── */
.aw-row-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--s1); border-radius: var(--r-md); margin-bottom: 6px; }
.aw-row-ico { width: 34px; height: 34px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.aw-row-ico.green { background: var(--green-dim); color: var(--green); }
.aw-row-ico.warn { background: var(--warn-dim); color: var(--warn); }
.aw-row-ico.gold { background: var(--gold-dim); color: var(--gold); }
.aw-row-body { flex: 1; min-width: 0; }
.aw-row-title { font-size: 13px; font-weight: 500; color: var(--t1); }
.aw-row-sub { font-size: 11px; color: var(--t3); margin-top: 1px; }
.aw-row-sub.green-text { color: var(--green); font-weight: 600; }
.aw-row-sub.gold-text { color: var(--gold); font-weight: 600; }
.aw-row-val { font-family: var(--f-mono); font-size: 14px; font-weight: 500; color: var(--t1); }

/* ─── Callouts ─── */
.aw-callout { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding: 10px 14px; border-radius: var(--r-sm); font-size: 12px; }
.aw-callout.green { background: var(--green-dim); color: var(--green); }

/* ─── Legends ─── */
.aw-legend-row { display: flex; gap: 18px; margin-bottom: 10px; }
.aw-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--t3); }
.aw-legend-dot { width: 7px; height: 7px; border-radius: 2px; }

/* ─── Buttons ─── */
.aw-primary-btn { padding: 9px 18px; border-radius: var(--r-sm); background: var(--gold); color: var(--s0); font-weight: 600; font-size: 12px; border: none; cursor: pointer; font-family: var(--f-body); transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.aw-primary-btn:hover { background: var(--gold-light); }
.aw-ghost-btn { padding: 9px 18px; border-radius: var(--r-sm); background: transparent; color: var(--t2); font-weight: 500; font-size: 12px; border: 1px solid var(--b2); cursor: pointer; font-family: var(--f-body); transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.aw-ghost-btn:hover { border-color: var(--gold); color: var(--gold); }
.aw-dl-btn { background: none; border: 1px solid var(--b1); border-radius: 5px; padding: 4px 9px; color: var(--t3); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-family: var(--f-body); transition: all 0.2s; }
.aw-dl-btn:hover { border-color: var(--gold); color: var(--gold); }
.aw-upload-cta { display: flex; align-items: center; gap: 14px; padding: 18px 22px; background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r-lg); margin-top: var(--sp-lg); }

/* ─── Animations ─── */
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.aw-anim { animation: fadeUp 0.4s ease both; }
.aw-d1 { animation-delay: 0.03s; }
.aw-d2 { animation-delay: 0.08s; }
.aw-d3 { animation-delay: 0.13s; }
.aw-d4 { animation-delay: 0.18s; }
.aw-d5 { animation-delay: 0.23s; }

/* ─── Responsive ─── */
@media (max-width: 1200px) {
  .aw { grid-template-columns: 1fr; }
  .aw-aside { display: none; }
}
@media (max-width: 1024px) {
  .aw-exec-row { grid-template-columns: 1fr 1fr; }
  .aw-two-col { grid-template-columns: 1fr; }
  .aw-stat-grid-4 { grid-template-columns: 1fr 1fr; }
  .aw-gauge-grid { grid-template-columns: 1fr 1fr; }
  .aw-action-grid { grid-template-columns: 1fr; }
  .aw-tabs { display: none; }
  .aw-main { padding: var(--sp-md); }
  .aw-exec-val { font-size: 28px; }
}
`;
