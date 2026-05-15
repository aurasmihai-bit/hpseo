import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Sidebar from '../components/Sidebar'
import KpiCard from '../components/KpiCard'
import { DAU_DATA, CONV_DATA, CITY_DATA, DEVICE_DATA, SOURCE_DATA, SC_DATA, PAGE_DATA, getStats } from '../lib/data'
import { detectAnomalies } from '../lib/anomalies'

const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line), { ssr: false })
const Bar = dynamic(() => import('react-chartjs-2').then(m => m.Bar), { ssr: false })
const Doughnut = dynamic(() => import('react-chartjs-2').then(m => m.Doughnut), { ssr: false })

const GC = 'rgba(0,0,0,0.05)'
const TC = '#bbb'
const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: TC, font: { size: 9 }, maxTicksLimit: 8 }, grid: { color: GC } },
    y: { ticks: { color: TC, font: { size: 9 } }, grid: { color: GC } },
  }
}

function Card({ title, sub, children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E6DF', borderRadius: 10, padding: 14, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1916' }}>{title}</div>
        {sub && <div style={{ fontSize: 10, color: '#bbb' }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

function Table({ headers, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr>{headers.map((h,i) => (
          <th key={i} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid #F0EEE8', background: '#FAFAF8' }}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>{rows.map((row,i) => (
        <tr key={i}>{row.map((cell,j) => (
          <td key={j} style={{ padding: '7px 10px', borderBottom: i<rows.length-1?'1px solid #F0EEE8':'none', verticalAlign: 'middle' }}>{cell}</td>
        ))}</tr>
      ))}</tbody>
    </table>
  )
}

function Pill({ label, color = 'green' }) {
  const colors = {
    green: { bg: '#E1F5EE', c: '#0F6E56' },
    blue:  { bg: '#E6F1FB', c: '#185FA5' },
    amber: { bg: '#FAEEDA', c: '#854F0B' },
    red:   { bg: '#FCEBEB', c: '#A32D2D' },
    gray:  { bg: '#F1EFE8', c: '#5F5E5A' },
  }
  const col = colors[color]
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: col.bg, color: col.c }}>{label}</span>
}

function Grid({ cols = 4, gap = 10, mb = 14, children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap, marginBottom: mb }}>{children}</div>
}

function Row({ cols = '2fr 1fr', gap = 12, mb = 12, children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: cols, gap, marginBottom: mb }}>{children}</div>
}

function Insight({ children }) {
  return (
    <div style={{ background: '#F5F4F0', borderRadius: 8, padding: '10px 12px', marginTop: 10, fontSize: 11, color: '#666', lineHeight: 1.6 }}>
      <strong style={{ color: '#1A1916' }}>💡 Insight: </strong>{children}
    </div>
  )
}

export default function Dashboard() {
  const [view, setView] = useState('overview')
  const [anomalies] = useState(() => detectAnomalies())
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const stats = getStats()
  const labels = DAU_DATA.map(d => d.d)

  // AI call
  async function runAI(question) {
    if (!question.trim()) return
    setAiLoading(true)
    setAiResponse('')
    const ctx = `homepitch.ro GA4 data (Apr 13–May 12 2026): ${stats.totU} users, ${stats.totS} sessions. April avg DAU: ${stats.aprAvg}, May avg DAU: ${stats.mayAvg} (−${Math.round((1-stats.mayAvg/stats.aprAvg)*100)}%). Owners onboarded: ${stats.totProp}. Buyers onboarded: ${stats.totCum}. Briefs posted: ${stats.totCer}. Offer accepted: 0. Mobile: 68% (10% bounce). Top city: Bucharest 55%. Facebook = biggest channel. SEO = 100% branded only.`
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'You are a senior growth analyst for homepitch.ro, a Romanian reverse real estate marketplace. Give sharp, specific, actionable advice in bullet points. Use emoji section headers. Be direct and concise.',
          messages: [{ role: 'user', content: ctx + '\n\nQuestion: ' + question }]
        })
      })
      const data = await res.json()
      setAiResponse(data.content?.[0]?.text || 'No response.')
    } catch (e) {
      setAiResponse('Error connecting to Claude API: ' + e.message)
    }
    setAiLoading(false)
  }

  const QUICK_PROMPTS = [
    { label: '📉 May traffic cliff', q: 'Why did traffic drop 75% from April to May and what are the top 3 actions to recover?' },
    { label: '🚨 Zero accepted offers', q: 'offer_accepted = 0 in 30 days. Give me a checklist to diagnose if this is a tracking bug or a product issue.' },
    { label: '🏙️ City expansion', q: 'Focsani has 87% buyer conv rate from 8 users. Where should I expand next and why?' },
    { label: '🔍 SEO strategy', q: 'Only branded queries ranking. Give me a 30-day SEO plan to rank for Romanian real estate buyer keywords.' },
    { label: '📱 Mobile UX', q: '68% mobile traffic, 97% drop-off before onboarding. What 3 UX changes would have the highest impact?' },
    { label: '⚡ Apr 28 spike', q: 'On Apr 28, bun_venit_proprietar fired 42 times (10x normal). How do I find the cause and replicate it?' },
  ]

  const panels = {
    overview: (
      <>
        <Grid cols={4}>
          <KpiCard label="Active Users (30d)" value={stats.totU.toLocaleString()} sub="unique visitors" color="green" />
          <KpiCard label="Sessions" value={stats.totS.toLocaleString()} sub={`${Math.round(stats.totS/30)} avg/day`} />
          <KpiCard label="Avg Engagement Rate" value={Math.round(stats.totE/stats.totS*100)+'%'} sub="engaged sessions" color="green" />
          <KpiCard label="May vs April DAU" value={`−${Math.round((1-stats.mayAvg/stats.aprAvg)*100)}%`} sub={`Apr ${stats.aprAvg} → May ${stats.mayAvg} avg`} color="red" />
        </Grid>
        <Row cols="2fr 1fr">
          <Card title="Daily Active Users" sub="Apr 13 – May 12 · real GA4">
            <div style={{ height: 180 }}><Line data={{ labels, datasets: [{ data: DAU_DATA.map(d=>d.u), borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,0.07)', fill: true, tension: .35, pointRadius: 0, borderWidth: 2 }] }} options={chartDefaults} /></div>
          </Card>
          <Card title="Engagement Rate" sub="daily">
            <div style={{ height: 180 }}><Bar data={{ labels, datasets: [{ data: DAU_DATA.map(d=>Math.round(d.e/Math.max(d.s,1)*100)), backgroundColor: DAU_DATA.map(d=>d.e/Math.max(d.s,1)>.7?'rgba(29,158,117,.75)':'rgba(186,117,23,.55)') }] }} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, max: 100, ticks: { color: TC, font: { size: 9 }, callback: v=>v+'%' }, grid: { color: GC } } } }} /></div>
          </Card>
        </Row>
        <Row cols="1fr 1fr">
          <Card title="Sessions vs New Users" sub="daily">
            <div style={{ height: 150 }}><Bar data={{ labels, datasets: [{ label:'Sessions', data: DAU_DATA.map(d=>d.s), backgroundColor:'rgba(24,95,165,.55)', stack:'s' }, { label:'New', data: DAU_DATA.map(d=>d.n), backgroundColor:'rgba(29,158,117,.7)', stack:'n' }] }} options={chartDefaults} /></div>
          </Card>
          <Card title="Conversion Mix" sub="30-day totals">
            <div style={{ height: 150 }}><Doughnut data={{ labels:['Owners','Buyers','Briefs','Agents','Rejected'], datasets:[{ data:[stats.totProp,stats.totCum,stats.totCer,stats.totAg,stats.totRej], backgroundColor:['#185FA5','#1D9E75','#BA7517','#533AB7','#E24B4A'], borderWidth:0 }] }} options={{ responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:10, color:'#888' } } } }} /></div>
          </Card>
        </Row>
        <Insight>Traffic peaked Apr 23 (102 DAU) then fell sharply. The <strong>bun_venit_proprietar</strong> spike on Apr 28 (42 events) is your biggest unresolved growth signal. May average is only {stats.mayAvg} DAU — a channel went quiet. Find it.</Insight>
      </>
    ),

    anomalies: (
      <>
        <Grid cols={4}>
          <KpiCard label="Critical Alerts" value={anomalies.filter(a=>a.sev==='critical').length} sub="require immediate action" color="red" />
          <KpiCard label="Warnings" value={anomalies.filter(a=>a.sev==='warning').length} sub="monitor closely" color="amber" />
          <KpiCard label="Info Events" value={anomalies.filter(a=>a.sev==='info').length} sub="notable, not urgent" color="blue" />
          <KpiCard label="Total Detected" value={anomalies.length} sub="last 30 days" />
        </Grid>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {anomalies.map(a => (
            <div key={a.id} style={{ background:'#fff', border:`1px solid ${a.sev==='critical'?'#F09595':a.sev==='warning'?'#F0D68A':'#9DC4EC'}`, borderLeft:`3px solid ${a.sev==='critical'?'#A32D2D':a.sev==='warning'?'#BA7517':'#185FA5'}`, borderRadius:10, padding:'12px 14px', display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ fontSize:20 }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <strong style={{ fontSize:12 }}>{a.type}</strong>
                  <Pill label={a.sev.toUpperCase()} color={a.sev==='critical'?'red':a.sev==='warning'?'amber':'blue'} />
                  <span style={{ fontSize:10, color:'#bbb', marginLeft:'auto' }}>{a.date} · {a.metric}</span>
                </div>
                <div style={{ fontSize:11, color:'#666', lineHeight:1.5 }}>{a.detail}</div>
                <button onClick={()=>{ setView('ai'); setAiInput(`Anomaly detected: ${a.type} on ${a.date} (${a.metric}). ${a.detail.slice(0,80)}... Give me 3 concrete actions.`); runAI(`Anomaly: ${a.type} on ${a.date}: ${a.metric}. Give me 3 concrete action steps.`) }} style={{ marginTop:6, padding:'3px 9px', border:'1px solid #E8E6DF', borderRadius:6, fontSize:10, fontWeight:600, cursor:'pointer', background:'#F9F8F5', color:'#444' }}>✦ Ask Claude</button>
              </div>
            </div>
          ))}
        </div>
      </>
    ),

    ai: (
      <div style={{ background:'#fff', border:'1px solid #E8E6DF', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#0F1923,#1A2E3B)', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>✦</span>
          <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>AI Insights — powered by Claude</div>
          <div style={{ marginLeft:'auto', background:'rgba(29,158,117,.2)', color:'#5DCAA5', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>claude-sonnet-4-20250514</div>
        </div>
        <div style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#888', marginBottom:8 }}>Quick analysis prompts</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:10 }}>
            {QUICK_PROMPTS.map((p,i) => (
              <div key={i} onClick={()=>{ setAiInput(p.q); runAI(p.q) }} style={{ padding:'8px 10px', border:'1px solid #E8E6DF', borderRadius:8, fontSize:11, color:'#444', cursor:'pointer', background:'#F9F8F5', lineHeight:1.3, transition:'all .12s' }}>{p.label}</div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runAI(aiInput)} placeholder="Ask anything about your homepitch.ro data..." style={{ flex:1, padding:'8px 12px', border:'1px solid #E8E6DF', borderRadius:8, fontSize:12, outline:'none', fontFamily:'inherit' }} />
            <button onClick={()=>runAI(aiInput)} disabled={aiLoading} style={{ padding:'8px 18px', background:'#1A1916', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>{aiLoading?'Analyzing...':'▶ Analyze'}</button>
          </div>
          <div style={{ border:'1px solid #E8E6DF', borderRadius:10, overflow:'hidden' }}>
            <div style={{ padding:'8px 12px', background:'#F9F8F5', borderBottom:'1px solid #F0EEE8', fontSize:11, color:'#888', display:'flex', alignItems:'center', gap:6 }}>
              <span>✦</span> Claude's analysis
              {aiLoading && <span style={{ marginLeft:'auto', color:'#1D9E75', fontSize:10 }}>Thinking…</span>}
            </div>
            <div style={{ padding:14, fontSize:12, color:'#1A1916', lineHeight:1.7, minHeight:100, maxHeight:400, overflowY:'auto', whiteSpace:'pre-wrap' }}>
              {aiLoading ? <span style={{ color:'#bbb', fontStyle:'italic' }}>Analyzing your real GA4 data…</span>
               : aiResponse ? aiResponse
               : <span style={{ color:'#bbb', fontStyle:'italic' }}>Select a prompt or type a question above.</span>}
            </div>
          </div>
        </div>
      </div>
    ),

    funnel: (
      <>
        <Card title="Full Activation Funnel" sub="real GA4 data · 30 days">
          {[
            { l:'Visited site', n:stats.totU, c:'#185FA5' },
            { l:'Engaged session', n:stats.totE, c:'#1D9E75' },
            { l:'Onboarded (any role)', n:stats.totCum+stats.totProp+stats.totAg, c:'#BA7517' },
            { l:'Posted brief', n:stats.totCer, c:'#854F0B' },
            { l:'Offer accepted', n:0, c:'#A32D2D' },
          ].map((step, i, arr) => {
            const pct = Math.round(step.n/arr[0].n*100)
            const drop = i>0 ? Math.round((1-step.n/arr[i-1].n)*100) : null
            return (
              <div key={i}>
                {drop !== null && <div style={{ fontSize:10, color:'#bbb', padding:'0 0 4px 140px' }}>▼ −{drop}% drop-off</div>}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ width:130, fontSize:11, color:'#666', textAlign:'right', flexShrink:0 }}>{step.l}</div>
                  <div style={{ flex:1, height:28, background:'#F5F4F0', borderRadius:6, overflow:'hidden' }}>
                    <div style={{ width:`${Math.max(pct,1)}%`, height:'100%', background:step.c, display:'flex', alignItems:'center', paddingLeft:8, fontSize:11, fontWeight:700, color:'#fff', borderRadius:6 }}>{pct}%</div>
                  </div>
                  <div style={{ width:80, fontSize:11, fontWeight:700 }}>{step.n.toLocaleString()}</div>
                </div>
              </div>
            )
          })}
        </Card>
        <Insight>97% of users never complete onboarding. The biggest drop is <strong>engaged session → onboarded user</strong>. Fix the signup flow before spending any money on ads. <strong>offer_accepted = 0</strong> is your P0 bug.</Insight>
      </>
    ),

    cities: (
      <>
        <Card title="Top Cities" sub="real GA4 · 30 days">
          <div style={{ height: 220 }}>
            <Bar data={{ labels: CITY_DATA.map(c=>c.c), datasets: [{ data: CITY_DATA.map(c=>c.u), backgroundColor:'rgba(29,158,117,.7)' }] }} options={{ ...chartDefaults, indexAxis:'y' }} />
          </div>
        </Card>
        <div style={{ marginTop:12 }}>
          <Card title="City Breakdown">
            <Table
              headers={['City','Users','Sessions','Buyers','Owners','Conv Rate']}
              rows={CITY_DATA.map(c => [
                <strong key={c.c}>{c.c}</strong>,
                c.u, c.s,
                c.cum||'—', c.prop||'—',
                <strong key="cr">{c.s>0?Math.round((c.cum+c.prop+c.ag)/c.s*100)+'%':'—'}</strong>
              ])}
            />
          </Card>
        </div>
        <Insight>Focșani: 8 users → 7 buyer conversions = <strong>87.5% conversion rate</strong>. This is your word-of-mouth signal. Find out who shared the platform there and build a referral program around it. Bucharest dominates (55%) but has much lower conv rates — the product-market fit is stronger in smaller cities.</Insight>
      </>
    ),

    seo: (
      <>
        <Grid cols={4}>
          <KpiCard label="Total Clicks (30d)" value={SC_DATA.reduce((s,d)=>s+d.cl,0)} sub="from Google search" color="blue" />
          <KpiCard label="Impressions" value={SC_DATA.reduce((s,d)=>s+d.im,0)} sub="times shown" />
          <KpiCard label="Avg CTR" value={Math.round(SC_DATA.filter(d=>d.im>0).reduce((s,d)=>s+d.ctr,0)/SC_DATA.filter(d=>d.im>0).length)+'%'} sub="clicks / impressions" color="green" />
          <KpiCard label="SEO Traffic %" value="2.5%" sub="of total sessions · very low" color="red" />
        </Grid>
        <Row>
          <Card title="Clicks & Impressions" sub="daily · Search Console">
            <div style={{ height:180 }}><Bar data={{ labels: SC_DATA.map(d=>d.d), datasets:[{ label:'Clicks', data:SC_DATA.map(d=>d.cl), backgroundColor:'rgba(29,158,117,.75)', yAxisID:'y' }, { type:'line', label:'Impressions', data:SC_DATA.map(d=>d.im), borderColor:'#185FA5', pointRadius:0, borderWidth:2, fill:false, yAxisID:'y1' }] }} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{font:{size:10},boxWidth:10}}}, scales:{ x:{ticks:{color:TC,font:{size:9},maxTicksLimit:8},grid:{display:false}}, y:{ticks:{color:TC,font:{size:9}},grid:{color:GC}}, y1:{position:'right',ticks:{color:TC,font:{size:9}},grid:{display:false}} } }} /></div>
          </Card>
          <Card title="Avg Position" sub="lower = better">
            <div style={{ height:180 }}><Line data={{ labels: SC_DATA.map(d=>d.d), datasets:[{ data:SC_DATA.map(d=>d.pos), borderColor:'#BA7517', backgroundColor:'rgba(186,117,23,.06)', fill:true, tension:.35, pointRadius:2, borderWidth:2, spanGaps:true }] }} options={{ ...chartDefaults, scales:{ x:{ticks:{color:TC,font:{size:9},maxTicksLimit:8},grid:{color:GC}}, y:{reverse:true,ticks:{color:TC,font:{size:9}},grid:{color:GC}} } }} /></div>
          </Card>
        </Row>
        <Card title="Top Queries">
          <Table
            headers={['Query','Clicks','Impressions','CTR','Position','Note']}
            rows={[
              ['homepitch', 25, 36, '69.4%', '1.8', <Pill key="1" label="Branded ✓" color="green" />],
              ['home pitch', 8, 13, '61.5%', '1.2', <Pill key="2" label="Branded ✓" color="green" />],
              ['apartament 2 camere salajan', 0, 1, '0%', '34', <Pill key="3" label="⚠ Page 4" color="red" />],
              ['oferte proprietari', 0, 1, '0%', '32', <Pill key="4" label="Opportunity" color="amber" />],
            ]}
          />
        </Card>
        <Insight>100% of search traffic is branded. Zero non-branded real estate keywords rank. Build 5 city pages targeting <em>"vreau să cumpăr apartament [oraș]"</em> — estimated 500–2000 organic visits/month within 6 months at near-zero cost.</Insight>
      </>
    ),

    prd: (
      <div style={{ maxWidth:800 }}>
        <div style={{ background:'#fff', border:'1px solid #E8E6DF', borderRadius:10, padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, paddingBottom:16, borderBottom:'1px solid #F0EEE8' }}>
            <div>
              <h1 style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>Product Requirements Document</h1>
              <div style={{ fontSize:12, color:'#888' }}>homepitch.ro · Version 1.1 · Based on real GA4 data · May 2026</div>
            </div>
            <a href="/api/prd" download="homepitch-PRD.md" style={{ padding:'6px 14px', background:'#1A1916', color:'#fff', borderRadius:8, fontSize:12, fontWeight:600 }}>⬇ Download PRD</a>
          </div>

          {[
            { title:'🚨 P0 — Fix Before Any Growth', items:[
              'offer_accepted = 0 events in 30 days — tag the event or build the acceptance UI',
              '97% drop-off between session and onboarding — audit and simplify signup flow',
              'May traffic −75% vs April — identify which channel stopped and reactivate',
            ]},
            { title:'📊 Key Metrics (30-day real data)', items:[
              `${getStats().totU} total users · ${getStats().totS} sessions · ${getStats().totN} new users`,
              `${getStats().totProp} owners onboarded · ${getStats().totCum} buyers · ${getStats().totCer} briefs posted`,
              '68% mobile traffic · 10% mobile bounce rate (very healthy)',
              'Bucharest 55% · Focșani anomaly: 87% buyer conv rate from 8 users',
            ]},
            { title:'🎯 90-Day Success Metrics', items:[
              '150 DAU (currently 15 in May)',
              '100 briefs/month (currently 10)',
              '40 offer_accepted events (currently 0)',
              '30 paying agent subscriptions → €2,000 MRR',
            ]},
            { title:'⚡ MoSCoW V1 Must-Haves', items:[
              '✅ Brief posting flow (/cerere-noua — 128 users already using)',
              '✅ Brief listing for agents (/cereri — 238 users)',
              '✅ User onboarding (buyer/owner/agent split)',
              '❌ Offer acceptance flow — BUILD THIS NOW',
              '❌ Agent subscription paywall',
              '❌ Push/email notifications on new offer',
            ]},
            { title:'🔍 SEO Opportunity', items:[
              '100% branded queries only ("homepitch") — massive untapped intent',
              'Create: /cauta-apartament-bucuresti · /cauta-apartament-cluj etc.',
              'Target: "vreau să cumpăr apartament", "vând fără agent"',
              'Expected: 500–2000 organic visits/month within 6 months',
            ]},
          ].map(section => (
            <div key={section.title} style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:10, paddingBottom:6, borderBottom:'1px solid #F0EEE8' }}>{section.title}</h3>
              <ul style={{ paddingLeft:18, display:'flex', flexDirection:'column', gap:6 }}>
                {section.items.map((item,i) => <li key={i} style={{ fontSize:12, color:'#444', lineHeight:1.5 }}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  }

  // Default panels for remaining views
  const defaultPanel = (title) => (
    <Card title={title}>
      <div style={{ color:'#888', fontSize:12, padding:'20px 0' }}>Content for {title}</div>
    </Card>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar active={view} onChange={setView} anomalyCount={anomalies.filter(a=>a.sev==='critical').length} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Topbar */}
        <div style={{ height:44, background:'#fff', borderBottom:'1px solid #E8E6DF', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px', flexShrink:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1A1916', textTransform:'capitalize' }}>{view === 'ai' ? 'AI Insights' : view === 'seo' ? 'Search Console' : view.replace(/_/g,' ')}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color:'#bbb' }}>Apr 13 – May 12, 2026 · GA4 live</span>
            <div style={{ width:26, height:26, borderRadius:'50%', background:'#E6F1FB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#185FA5' }}>HP</div>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          {panels[view] || defaultPanel(view)}
        </div>
      </div>
    </div>
  )
}
