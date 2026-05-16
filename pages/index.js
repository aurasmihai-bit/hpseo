import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Sidebar from '../components/Sidebar'
import KpiCard from '../components/KpiCard'
import { DAU_DATA, CONV_DATA, CITY_DATA, DEVICE_DATA, SOURCE_DATA, SC_DATA, PAGE_DATA, getStats } from '../lib/data'
import { detectAnomalies } from '../lib/anomalies'

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

function Pill({ label, color = 'green' }) {
  const c = { green: ['#E1F5EE','#0F6E56'], blue: ['#E6F1FB','#185FA5'], amber: ['#FAEEDA','#854F0B'], red: ['#FCEBEB','#A32D2D'], gray: ['#F1EFE8','#5F5E5A'] }[color] || ['#E1F5EE','#0F6E56']
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600, background:c[0], color:c[1] }}>{label}</span>
}

function Grid({ cols=4, gap=10, mb=14, children }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap, marginBottom:mb }}>{children}</div>
}

function Row({ cols='2fr 1fr', gap=12, mb=12, children }) {
  return <div style={{ display:'grid', gridTemplateColumns:cols, gap, marginBottom:mb }}>{children}</div>
}

function Insight({ children }) {
  return <div style={{ background:'#F5F4F0', borderRadius:8, padding:'10px 12px', marginTop:10, fontSize:11, color:'#666', lineHeight:1.6 }}><strong style={{color:'#1A1916'}}>💡 Insight: </strong>{children}</div>
}

function ChartCanvas({ id, height = 180 }) {
  return <div style={{ position:'relative', width:'100%', height }}><canvas id={id} /></div>
}

const GC = 'rgba(0,0,0,0.05)', TC = '#bbb'
const baseOpts = (extra={}) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color:TC, font:{size:9}, maxTicksLimit:8 }, grid: { color:GC } },
    y: { ticks: { color:TC, font:{size:9} }, grid: { color:GC } },
    ...extra
  }
})

export default function Dashboard() {
  const [view, setView] = useState('overview')
  const [anomalies] = useState(() => detectAnomalies())
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const chartsRef = useRef({})
  const stats = getStats()
  const labels = DAU_DATA.map(d => d.d)

  function destroyChart(id) {
    if (chartsRef.current[id]) { chartsRef.current[id].destroy(); delete chartsRef.current[id] }
  }

  function mkChart(id, cfg) {
    destroyChart(id)
    const el = document.getElementById(id)
    if (!el) return
    // eslint-disable-next-line no-undef
    chartsRef.current[id] = new Chart(el, cfg)
  }

  useEffect(() => {
    if (view === 'overview') initOverview()
    if (view === 'traffic') initTraffic()
    if (view === 'conversions') initConversions()
    if (view === 'funnel') initFunnel()
    if (view === 'sources') initSources()
    if (view === 'devices') initDevices()
    if (view === 'cities') initCities()
    if (view === 'seo') initSEO()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  function initOverview() {
    mkChart('dauC', { type:'line', data:{ labels, datasets:[{ data:DAU_DATA.map(d=>d.u), borderColor:'#1D9E75', backgroundColor:'rgba(29,158,117,0.07)', fill:true, tension:.35, pointRadius:0, borderWidth:2 }] }, options: baseOpts() })
    mkChart('engC', { type:'bar', data:{ labels, datasets:[{ data:DAU_DATA.map(d=>Math.round(d.e/Math.max(d.s,1)*100)), backgroundColor:DAU_DATA.map(d=>d.e/Math.max(d.s,1)>.7?'rgba(29,158,117,.75)':'rgba(186,117,23,.55)') }] }, options: baseOpts({ y: { ticks:{ color:TC, font:{size:9}, callback:v=>v+'%' }, grid:{color:GC}, max:100 } }) })
    mkChart('sessC', { type:'bar', data:{ labels, datasets:[{ label:'Sessions', data:DAU_DATA.map(d=>d.s), backgroundColor:'rgba(24,95,165,.55)', stack:'s' }, { label:'New', data:DAU_DATA.map(d=>d.n), backgroundColor:'rgba(29,158,117,.7)', stack:'n' }] }, options: baseOpts() })
    mkChart('convMixC', { type:'doughnut', data:{ labels:['Owners','Buyers','Briefs','Agents','Rejected'], datasets:[{ data:[stats.totProp,stats.totCum,stats.totCer,stats.totAg,stats.totRej], backgroundColor:['#185FA5','#1D9E75','#BA7517','#533AB7','#E24B4A'], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:10, color:'#888' } } } } })
  }

  function initTraffic() {
    mkChart('durC', { type:'line', data:{ labels, datasets:[{ data:DAU_DATA.map(d=>Math.min(d.dur,1200)), borderColor:'#185FA5', backgroundColor:'rgba(24,95,165,0.06)', fill:true, tension:.35, pointRadius:0, borderWidth:2 }] }, options: baseOpts({ y: { ticks:{ color:TC, font:{size:9}, callback:v=>v+'s' }, grid:{color:GC} } }) })
    mkChart('bounceC', { type:'line', data:{ labels, datasets:[{ data:DAU_DATA.map(d=>Math.round(d.b*100)), borderColor:'#A32D2D', backgroundColor:'rgba(163,45,45,0.06)', fill:true, tension:.35, pointRadius:0, borderWidth:2 }] }, options: baseOpts({ y: { ticks:{ color:TC, font:{size:9}, callback:v=>v+'%' }, grid:{color:GC}, min:0, max:110 } }) })
    mkChart('fvC', { type:'bar', data:{ labels, datasets:[{ data:DAU_DATA.map(d=>d.n), backgroundColor:'rgba(83,58,183,.65)' }] }, options: baseOpts() })
  }

  function initConversions() {
    const allDates = [...new Set([...DAU_DATA.map(d=>d.d), ...CONV_DATA.map(d=>d.d)])].sort()
    function cvMap(key) { return allDates.map(dt=>{ const r=CONV_DATA.find(c=>c.d===dt); return r?r[key]:0 }) }
    mkChart('convC', { type:'bar', data:{ labels:allDates, datasets:[
      { label:'Owners', data:cvMap('prop'), backgroundColor:'rgba(24,95,165,.65)', stack:'s' },
      { label:'Buyers', data:cvMap('cum'), backgroundColor:'rgba(29,158,117,.7)', stack:'s' },
      { label:'Briefs', data:cvMap('cer'), backgroundColor:'rgba(186,117,23,.75)', stack:'s' },
      { label:'Rejected', data:cvMap('rej'), backgroundColor:'rgba(163,45,45,.55)', stack:'s' },
    ]}, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:10, color:'#888' } } }, scales:{ x:{ ticks:{color:TC,font:{size:9},maxTicksLimit:10}, grid:{display:false} }, y:{ stacked:true, ticks:{color:TC,font:{size:9}}, grid:{color:GC} } } } })
    mkChart('convPieC', { type:'doughnut', data:{ labels:['Owners','Buyers','Briefs','Agents','Rejected'], datasets:[{ data:[stats.totProp,stats.totCum,stats.totCer,stats.totAg,stats.totRej], backgroundColor:['#185FA5','#1D9E75','#BA7517','#533AB7','#E24B4A'], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:10, color:'#888' } } } } })
  }

  function initFunnel() {
    mkChart('onbC', { type:'bar', data:{ labels:['Buyers','Owners','Agents'], datasets:[{ data:[stats.totCum,stats.totProp,stats.totAg], backgroundColor:['#1D9E75','#185FA5','#BA7517'], borderWidth:0 }] }, options: baseOpts() })
    mkChart('dropC', { type:'bar', data:{ labels:['Visit→Engaged','Engaged→Onboard','Onboard→Brief'], datasets:[{ data:[37,97,69], backgroundColor:'rgba(163,45,45,.65)' }] }, options: baseOpts({ y: { max:100, ticks:{ color:TC, font:{size:9}, callback:v=>v+'%' }, grid:{color:GC} } }) })
  }

  function initSources() {
    mkChart('srcC', { type:'bar', data:{ labels:SOURCE_DATA.map(s=>s.s), datasets:[{ data:SOURCE_DATA.map(s=>s.u), backgroundColor:'rgba(29,158,117,.7)' }] }, options:{ ...baseOpts(), indexAxis:'y' } })
    mkChart('srcCvC', { type:'bar', data:{ labels:SOURCE_DATA.map(s=>s.s), datasets:[{ data:SOURCE_DATA.map(s=>s.sess>0?Math.round((s.cum+s.prop)/s.sess*100):0), backgroundColor:'rgba(24,95,165,.65)' }] }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{ max:100, ticks:{color:TC,font:{size:9},callback:v=>v+'%'}, grid:{color:GC} }, y:{ ticks:{color:TC,font:{size:10}}, grid:{display:false} } } } })
  }

  function initDevices() {
    mkChart('devC', { type:'doughnut', data:{ labels:['Mobile','Desktop','Tablet'], datasets:[{ data:[623,281,3], backgroundColor:['#1D9E75','#185FA5','#BA7517'], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:10, color:'#888' } } } } })
    mkChart('devSessC', { type:'doughnut', data:{ labels:['Mobile','Desktop','Tablet'], datasets:[{ data:[883,616,5], backgroundColor:['#1D9E75','#185FA5','#BA7517'], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:10, color:'#888' } } } } })
    mkChart('devBounceC', { type:'bar', data:{ labels:['Mobile','Desktop','Tablet'], datasets:[{ data:[10,21,20], backgroundColor:['rgba(29,158,117,.7)','rgba(163,45,45,.65)','rgba(186,117,23,.65)'] }] }, options: baseOpts({ y: { max:30, ticks:{ color:TC, font:{size:9}, callback:v=>v+'%' }, grid:{color:GC} } }) })
  }

  function initSEO() {
    mkChart('scC', { type:'bar', data:{ labels:SC_DATA.map(d=>d.d), datasets:[
      { label:'Clicks', data:SC_DATA.map(d=>d.cl), backgroundColor:'rgba(29,158,117,.75)', yAxisID:'y' },
      { type:'line', label:'Impressions', data:SC_DATA.map(d=>d.im), borderColor:'#185FA5', pointRadius:0, borderWidth:2, fill:false, yAxisID:'y1' }
    ]}, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:10 } } }, scales:{ x:{ ticks:{color:TC,font:{size:9},maxTicksLimit:8}, grid:{display:false} }, y:{ ticks:{color:TC,font:{size:9}}, grid:{color:GC} }, y1:{ position:'right', ticks:{color:TC,font:{size:9}}, grid:{display:false} } } } })
    mkChart('posC', { type:'line', data:{ labels:SC_DATA.map(d=>d.d), datasets:[{ data:SC_DATA.map(d=>d.pos), borderColor:'#BA7517', backgroundColor:'rgba(186,117,23,.06)', fill:true, tension:.35, pointRadius:2, borderWidth:2, spanGaps:true }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{ ticks:{color:TC,font:{size:9},maxTicksLimit:8}, grid:{color:GC} }, y:{ reverse:true, ticks:{color:TC,font:{size:9}}, grid:{color:GC} } } } })
  }

  async function runAI(question) {
    if (!question.trim()) return
    setAiLoading(true); setAiResponse('')
    const ctx = `homepitch.ro GA4 (Apr 13–May 12 2026): ${stats.totU} users, ${stats.totS} sessions. Apr avg DAU: ${stats.aprAvg}, May avg DAU: ${stats.mayAvg} (−${Math.round((1-stats.mayAvg/stats.aprAvg)*100)}%). Owners onboarded: ${stats.totProp}. Buyers: ${stats.totCum}. Briefs: ${stats.totCer}. Offer accepted: 0. Mobile: 68% (10% bounce). Top city: Bucharest 55%. Facebook = biggest channel. SEO = 100% branded only.`
    try {
      const res = await fetch('/api/claude', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ system:'You are a senior growth analyst for homepitch.ro, a Romanian reverse real estate marketplace. Give sharp, specific, actionable advice in bullet points. Use emoji section headers. Be direct and concise.', messages:[{ role:'user', content: ctx+'\n\nQuestion: '+question }] }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiResponse(data.content?.[0]?.text || 'No response.')
    } catch(e) { setAiResponse('❌ '+e.message) }
    setAiLoading(false)
  }

  const QUICK_PROMPTS = [
    { label:'📉 May traffic cliff', q:'Why did traffic drop 75% from April to May and what are the top 3 actions to recover?' },
    { label:'🚨 Zero accepted offers', q:'offer_accepted = 0 in 30 days. Checklist to diagnose tracking bug vs product issue.' },
    { label:'🏙️ City expansion', q:'Focsani has 87% buyer conv rate from 8 users. Where should I expand next and why?' },
    { label:'🔍 SEO strategy', q:'Only branded queries ranking. Give me a 30-day SEO plan for Romanian real estate buyer keywords.' },
    { label:'📱 Mobile UX', q:'68% mobile traffic, 97% drop-off before onboarding. What 3 UX changes have highest impact?' },
    { label:'⚡ Apr 28 spike', q:'On Apr 28, bun_venit_proprietar fired 42 times (10x normal). How do I find the cause and replicate it?' },
  ]

  const panels = {
    overview: (<>
      <Grid cols={4}>
        <KpiCard label="Active Users (30d)" value={stats.totU.toLocaleString()} sub="unique visitors" color="green"/>
        <KpiCard label="Sessions" value={stats.totS.toLocaleString()} sub={`${Math.round(stats.totS/30)} avg/day`}/>
        <KpiCard label="Avg Engagement Rate" value={Math.round(stats.totE/stats.totS*100)+'%'} sub="engaged sessions" color="green"/>
        <KpiCard label="May vs April DAU" value={`−${Math.round((1-stats.mayAvg/stats.aprAvg)*100)}%`} sub={`Apr ${stats.aprAvg} → May ${stats.mayAvg} avg`} color="red"/>
      </Grid>
      <Row cols="2fr 1fr">
        <Card title="Daily Active Users" sub="Apr 13 – May 12 · real GA4"><ChartCanvas id="dauC" height={180}/></Card>
        <Card title="Engagement Rate" sub="daily"><ChartCanvas id="engC" height={180}/></Card>
      </Row>
      <Row cols="1fr 1fr">
        <Card title="Sessions vs New Users" sub="daily"><ChartCanvas id="sessC" height={150}/></Card>
        <Card title="Conversion Mix" sub="30-day totals"><ChartCanvas id="convMixC" height={150}/></Card>
      </Row>
      <Insight>Traffic peaked Apr 23 (102 DAU) then fell sharply. The <strong>bun_venit_proprietar</strong> spike on Apr 28 (42 events) is your biggest unresolved growth signal. May average is only {stats.mayAvg} DAU — a channel went quiet. Find it.</Insight>
    </>),

    traffic: (<>
      <Grid cols={4}>
        <KpiCard label="Avg Session Duration" value={stats.avgDur+'s'} sub={`~${Math.round(stats.avgDur/60)}m avg`}/>
        <KpiCard label="Avg Bounce Rate" value={stats.avgBnc+'%'} sub={stats.avgBnc<20?'✓ Low bounce':'↑ Check'} color={stats.avgBnc<20?'green':'red'}/>
        <KpiCard label="Engaged Sessions" value={stats.totE.toLocaleString()} sub={`${Math.round(stats.totE/stats.totS*100)}% of all sessions`}/>
        <KpiCard label="New Users" value={stats.totN.toLocaleString()} sub={`${Math.round(stats.totN/stats.totU*100)}% of total`}/>
      </Grid>
      <Row cols="2fr 1fr">
        <Card title="Avg Session Duration" sub="seconds · daily"><ChartCanvas id="durC" height={180}/></Card>
        <Card title="Bounce Rate" sub="daily · lower = better"><ChartCanvas id="bounceC" height={180}/></Card>
      </Row>
      <Card title="New Users per day" sub="daily"><ChartCanvas id="fvC" height={150}/></Card>
      <Insight>Apr 15 and Apr 19 had extremely high session durations (~19 min) but low user counts — power users deeply engaged. Overall bounce rate <strong>{stats.avgBnc}%</strong> is healthy. May 11 spike to 46% bounce — something broke that day.</Insight>
    </>),

    conversions: (<>
      <Grid cols={4}>
        <KpiCard label="New Briefs (30d)" value={stats.totCer} sub="buyer requests posted" color={stats.totCer>0?'green':'red'}/>
        <KpiCard label="Buyers Welcomed" value={stats.totCum} sub="bun_venit_cumparator"/>
        <KpiCard label="Owners Welcomed" value={stats.totProp} sub="bun_venit_proprietar" color="green"/>
        <KpiCard label="Offers Rejected" value={stats.totRej} sub="track for match quality" color="red"/>
      </Grid>
      <Row cols="2fr 1fr">
        <Card title="Conversion Events Over Time" sub="stacked · daily"><ChartCanvas id="convC" height={200}/></Card>
        <Card title="Event Mix" sub="30-day totals"><ChartCanvas id="convPieC" height={200}/></Card>
      </Row>
      <Card title="All Tracked Events">
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr>{['GA4 Event','Meaning','30d Total','Status'].map(h=><th key={h} style={{textAlign:'left',padding:'6px 10px',fontSize:10,fontWeight:700,color:'#999',textTransform:'uppercase',borderBottom:'1px solid #F0EEE8',background:'#FAFAF8'}}>{h}</th>)}</tr></thead>
          <tbody>{[
            ['bun_venit_proprietar','Owner onboarded',stats.totProp,'green'],
            ['bun_venit_cumparator','Buyer onboarded',stats.totCum,'green'],
            ['bravo_cerere_noua','New brief submitted',stats.totCer,'green'],
            ['bun_venit_agent','Agent onboarded',stats.totAg,'green'],
            ['offer_rejected','Offer rejected',stats.totRej,'red'],
            ['offer_accepted','Offer accepted ⚠',0,'red'],
          ].map(([ev,m,t,c])=>(
            <tr key={ev}><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}><code style={{fontSize:10,color:'#1D9E75'}}>{ev}</code></td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8',color:'#666'}}>{m}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}><strong style={{color:t>0?'#1A1916':'#bbb'}}>{t}</strong></td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}><Pill label={t>0?'Active':'No data'} color={t>0?'green':'gray'}/></td></tr>
          ))}</tbody>
        </table>
      </Card>
      <div style={{background:'#FEF0CC',border:'1px solid #F0D68A',borderRadius:8,padding:'10px 14px',fontSize:11,color:'#854F0B',marginTop:10}}>⚠️ <strong>offer_accepted = 0</strong> over 30 days. Either the GA4 event is not tagged, or no buyer has accepted an offer yet. P0 priority — verify immediately.</div>
    </>),

    funnel: (<>
      <Card title="Full Activation Funnel" sub="real GA4 data · 30 days" style={{marginBottom:12}}>
        {[
          {l:'Visited site',n:stats.totU,c:'#185FA5'},
          {l:'Engaged session',n:stats.totE,c:'#1D9E75'},
          {l:'Onboarded (any role)',n:stats.totCum+stats.totProp+stats.totAg,c:'#BA7517'},
          {l:'Posted brief',n:stats.totCer,c:'#854F0B'},
          {l:'Offer accepted',n:0,c:'#A32D2D'},
        ].map((step,i,arr)=>{
          const pct=Math.round(step.n/arr[0].n*100)
          const drop=i>0?Math.round((1-step.n/arr[i-1].n)*100):null
          return <div key={i}>
            {drop!==null&&<div style={{fontSize:10,color:'#bbb',padding:'0 0 4px 140px'}}>▼ −{drop}% drop-off</div>}
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
              <div style={{width:130,fontSize:11,color:'#666',textAlign:'right',flexShrink:0}}>{step.l}</div>
              <div style={{flex:1,height:28,background:'#F5F4F0',borderRadius:6,overflow:'hidden'}}>
                <div style={{width:`${Math.max(pct,1)}%`,height:'100%',background:step.c,display:'flex',alignItems:'center',paddingLeft:8,fontSize:11,fontWeight:700,color:'#fff',borderRadius:6}}>{pct}%</div>
              </div>
              <div style={{width:80,fontSize:11,fontWeight:700}}>{step.n.toLocaleString()}</div>
            </div>
          </div>
        })}
      </Card>
      <Row cols="1fr 1fr">
        <Card title="User Type Onboarding"><ChartCanvas id="onbC" height={180}/></Card>
        <Card title="Drop-off at each step"><ChartCanvas id="dropC" height={180}/></Card>
      </Row>
      <Insight>97% of users never complete onboarding. Biggest drop: <strong>engaged session → onboarded user</strong>. Fix signup flow before spending on ads. <strong>offer_accepted = 0</strong> is P0.</Insight>
    </>),

    anomalies: (<>
      <Grid cols={4}>
        <KpiCard label="Critical Alerts" value={anomalies.filter(a=>a.sev==='critical').length} sub="require immediate action" color="red"/>
        <KpiCard label="Warnings" value={anomalies.filter(a=>a.sev==='warning').length} sub="monitor closely" color="amber"/>
        <KpiCard label="Info Events" value={anomalies.filter(a=>a.sev==='info').length} sub="notable, not urgent" color="blue"/>
        <KpiCard label="Total Detected" value={anomalies.length} sub="last 30 days"/>
      </Grid>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
        {anomalies.map(a=>(
          <div key={a.id} style={{background:'#fff',border:`1px solid ${a.sev==='critical'?'#F09595':a.sev==='warning'?'#F0D68A':'#9DC4EC'}`,borderLeft:`3px solid ${a.sev==='critical'?'#A32D2D':a.sev==='warning'?'#BA7517':'#185FA5'}`,borderRadius:10,padding:'12px 14px',display:'flex',gap:12}}>
            <div style={{fontSize:20}}>{a.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <strong style={{fontSize:12}}>{a.type}</strong>
                <Pill label={a.sev.toUpperCase()} color={a.sev==='critical'?'red':a.sev==='warning'?'amber':'blue'}/>
                <span style={{fontSize:10,color:'#bbb',marginLeft:'auto'}}>{a.date} · {a.metric}</span>
              </div>
              <div style={{fontSize:11,color:'#666',lineHeight:1.5}}>{a.detail}</div>
              <button onClick={()=>{ setView('ai'); setAiInput(`Anomaly: ${a.type} on ${a.date}: ${a.metric}. Give me 3 concrete action steps.`); setTimeout(()=>runAI(`Anomaly: ${a.type} on ${a.date}: ${a.metric}. Give me 3 concrete action steps.`),100) }} style={{marginTop:6,padding:'3px 9px',border:'1px solid #E8E6DF',borderRadius:6,fontSize:10,fontWeight:600,cursor:'pointer',background:'#F9F8F5',color:'#444'}}>✦ Ask Claude</button>
            </div>
          </div>
        ))}
      </div>
    </>),

    ai: (
      <div style={{background:'#fff',border:'1px solid #E8E6DF',borderRadius:12,overflow:'hidden'}}>
        <div style={{padding:'14px 16px',background:'linear-gradient(135deg,#0F1923,#1A2E3B)',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:18}}>✦</span>
          <div style={{fontSize:13,fontWeight:600,color:'#fff'}}>AI Insights — powered by Claude</div>
          <div style={{marginLeft:'auto',background:'rgba(29,158,117,.2)',color:'#5DCAA5',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20}}>claude-sonnet-4-20250514</div>
        </div>
        <div style={{padding:16}}>
          <div style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:8}}>Quick analysis prompts</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:10}}>
            {QUICK_PROMPTS.map((p,i)=>(
              <div key={i} onClick={()=>{setAiInput(p.q);runAI(p.q)}} style={{padding:'8px 10px',border:'1px solid #E8E6DF',borderRadius:8,fontSize:11,color:'#444',cursor:'pointer',background:'#F9F8F5',lineHeight:1.3}}>{p.label}</div>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:14}}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runAI(aiInput)} placeholder="Întreabă orice despre datele homepitch.ro..." style={{flex:1,padding:'8px 12px',border:'1px solid #E8E6DF',borderRadius:8,fontSize:12,outline:'none',fontFamily:'inherit'}}/>
            <button onClick={()=>runAI(aiInput)} disabled={aiLoading} style={{padding:'8px 18px',background:'#1A1916',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>{aiLoading?'Analizez...':'▶ Analizează'}</button>
          </div>
          <div style={{border:'1px solid #E8E6DF',borderRadius:10,overflow:'hidden'}}>
            <div style={{padding:'8px 12px',background:'#F9F8F5',borderBottom:'1px solid #F0EEE8',fontSize:11,color:'#888',display:'flex',alignItems:'center',gap:6}}>
              <span>✦</span> Analiza Claude
              {aiLoading&&<span style={{marginLeft:'auto',color:'#1D9E75',fontSize:10}}>Se gândește…</span>}
            </div>
            <div style={{padding:14,fontSize:12,color:'#1A1916',lineHeight:1.7,minHeight:100,maxHeight:400,overflowY:'auto',whiteSpace:'pre-wrap'}}>
              {aiLoading?<span style={{color:'#bbb',fontStyle:'italic'}}>Analizez datele tale GA4 reale…</span>
               :aiResponse?aiResponse
               :<span style={{color:'#bbb',fontStyle:'italic'}}>Selectează un prompt sau scrie o întrebare mai sus.</span>}
            </div>
          </div>
        </div>
      </div>
    ),

    sources: (<>
      <Grid cols={4}>
        <KpiCard label="Facebook Total" value="135" sub="lm+fb+l+m combined"/>
        <KpiCard label="Direct Users" value="116" sub="highest owner conv rate" color="green"/>
        <KpiCard label="Google Organic" value="23" sub="⚠ Low — SEO opportunity" color="red"/>
        <KpiCard label="Google Auth" value="6" sub="high buyer conv rate" color="green"/>
      </Grid>
      <Row cols="1fr 1fr">
        <Card title="Users by Source" sub="last 30 days"><ChartCanvas id="srcC" height={200}/></Card>
        <Card title="Conversion Rate by Source" sub="welcomed/sessions"><ChartCanvas id="srcCvC" height={200}/></Card>
      </Row>
      <Card title="Source Breakdown">
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr>{['Source','Users','Sessions','Buyers','Owners','Conv%'].map(h=><th key={h} style={{textAlign:'left',padding:'6px 10px',fontSize:10,fontWeight:700,color:'#999',textTransform:'uppercase',borderBottom:'1px solid #F0EEE8',background:'#FAFAF8'}}>{h}</th>)}</tr></thead>
          <tbody>{SOURCE_DATA.map(s=><tr key={s.s}><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}><strong>{s.s}</strong></td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{s.u}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{s.sess}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{s.cum||'—'}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{s.prop||'—'}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}><strong>{s.sess>0?Math.round((s.cum+s.prop)/s.sess*100)+'%':'—'}</strong></td></tr>)}</tbody>
        </table>
      </Card>
    </>),

    devices: (<>
      <Grid cols={4}>
        <KpiCard label="Mobile Users" value={DEVICE_DATA[0].u} sub={`${Math.round(DEVICE_DATA[0].u/stats.totU*100)}% of total`} color="green"/>
        <KpiCard label="Mobile Bounce" value={Math.round(DEVICE_DATA[0].b*100)+'%'} sub="✓ Very low" color="green"/>
        <KpiCard label="Desktop Users" value={DEVICE_DATA[1].u} sub="power users return"/>
        <KpiCard label="Desktop Bounce" value={Math.round(DEVICE_DATA[1].b*100)+'%'} sub="↑ Higher than mobile" color="red"/>
      </Grid>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
        <Card title="Users by Device"><ChartCanvas id="devC" height={180}/></Card>
        <Card title="Sessions by Device"><ChartCanvas id="devSessC" height={180}/></Card>
        <Card title="Bounce by Device"><ChartCanvas id="devBounceC" height={180}/></Card>
      </div>
      <Insight><strong>Mobile-first platform confirmed:</strong> 68% users on mobile, 10% bounce vs 21% desktop. Mobile users are far more engaged. Prioritize brief-posting flow optimization for mobile.</Insight>
    </>),

    cities: (<>
      <Row cols="2fr 1fr">
        <Card title="Top Cities by Users" sub="real GA4 · 30 days"><ChartCanvas id="cityC" height={220}/></Card>
        <Card title="Conversion Rate by City" sub="welcomed/sessions">
          <div style={{fontSize:12,marginTop:4}}>
            {CITY_DATA.filter(c=>c.cum+c.prop+c.ag>0).map(c=>(
              <div key={c.c} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #F0EEE8'}}>
                <span style={{fontWeight:600}}>{c.c}</span>
                <span style={{color:'#1D9E75',fontWeight:700}}>{c.s>0?Math.round((c.cum+c.prop+c.ag)/c.s*100)+'%':'—'}</span>
              </div>
            ))}
          </div>
        </Card>
      </Row>
      <Card title="City Detail">
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr>{['City','Users','Sessions','Buyers','Owners','Conv%'].map(h=><th key={h} style={{textAlign:'left',padding:'6px 10px',fontSize:10,fontWeight:700,color:'#999',textTransform:'uppercase',borderBottom:'1px solid #F0EEE8',background:'#FAFAF8'}}>{h}</th>)}</tr></thead>
          <tbody>{CITY_DATA.map(c=><tr key={c.c}><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}><strong>{c.c}</strong></td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{c.u}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{c.s}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{c.cum||'—'}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{c.prop||'—'}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}><strong>{c.s>0?Math.round((c.cum+c.prop+c.ag)/c.s*100)+'%':'—'}</strong></td></tr>)}</tbody>
        </table>
      </Card>
      <Insight>Focșani: 8 users → 7 buyer conversions = <strong>87.5% conv rate</strong>. Bucharest dominates (55%) but lower conv rates. Cluj, Timișoara, Iași = zero conversions — activation opportunity.</Insight>
    </>),

    seo: (<>
      <Grid cols={4}>
        <KpiCard label="Total Clicks (30d)" value={SC_DATA.reduce((s,d)=>s+d.cl,0)} sub="from Google search" color="blue"/>
        <KpiCard label="Impressions" value={SC_DATA.reduce((s,d)=>s+d.im,0)} sub="times shown"/>
        <KpiCard label="Avg CTR" value={Math.round(SC_DATA.filter(d=>d.im>0).reduce((s,d)=>s+d.ctr,0)/SC_DATA.filter(d=>d.im>0).length)+'%'} sub="clicks/impressions" color="green"/>
        <KpiCard label="SEO Traffic" value="2.5%" sub="of total sessions · very low" color="red"/>
      </Grid>
      <Row cols="2fr 1fr">
        <Card title="Clicks & Impressions" sub="daily · Search Console"><ChartCanvas id="scC" height={180}/></Card>
        <Card title="Avg Position" sub="lower = better"><ChartCanvas id="posC" height={180}/></Card>
      </Row>
      <Insight>100% branded search only. Zero non-branded real estate keywords. Build city landing pages targeting <em>"vreau să cumpăr apartament [oraș]"</em> — estimated 500–2000 organic visits/month within 6 months.</Insight>
    </>),

    pages: (
      <Card title="Top Pages by Views" sub="real GA4 · 30 days">
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr>{['Page','Views','Users','Avg Duration','Type'].map(h=><th key={h} style={{textAlign:'left',padding:'6px 10px',fontSize:10,fontWeight:700,color:'#999',textTransform:'uppercase',borderBottom:'1px solid #F0EEE8',background:'#FAFAF8'}}>{h}</th>)}</tr></thead>
          <tbody>{PAGE_DATA.map(p=><tr key={p.p}><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8',fontFamily:'monospace',fontSize:11}}>{p.p}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{p.v.toLocaleString()}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{p.u}</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}>{p.dur}s</td><td style={{padding:'7px 10px',borderBottom:'1px solid #F0EEE8'}}><Pill label={p.type} color={p.type==='Admin'?'red':p.type==='Auth'?'amber':p.type==='Convert'?'green':'blue'}/></td></tr>)}</tbody>
        </table>
      </Card>
    ),

    prd: (
      <div style={{maxWidth:800}}>
        <div style={{background:'#fff',border:'1px solid #E8E6DF',borderRadius:10,padding:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingBottom:16,borderBottom:'1px solid #F0EEE8'}}>
            <div><h1 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Product Requirements Document</h1><div style={{fontSize:12,color:'#888'}}>homepitch.ro · V1.1 · Based on real GA4 data · May 2026</div></div>
            <a href="/api/prd" download="homepitch-PRD.md" style={{padding:'6px 14px',background:'#1A1916',color:'#fff',borderRadius:8,fontSize:12,fontWeight:600,textDecoration:'none'}}>⬇ Download PRD</a>
          </div>
          {[
            {title:'🚨 P0 — Fix Before Any Growth',items:['offer_accepted = 0 events — tag the event or build the acceptance UI','97% drop-off between session and onboarding — audit and simplify signup','May traffic −75% vs April — identify which channel stopped']},
            {title:'📊 Key Metrics (real GA4)',items:[`${stats.totU} total users · ${stats.totS} sessions · ${stats.totN} new users`,`${stats.totProp} owners · ${stats.totCum} buyers · ${stats.totCer} briefs posted`,'68% mobile · 10% mobile bounce','Bucharest 55% · Focșani 87% buyer conv rate']},
            {title:'🎯 90-Day Targets',items:['150 DAU (currently '+stats.mayAvg+' in May)','100 briefs/month (currently '+stats.totCer+')','40 offer_accepted events (currently 0)','30 paying agents → €2,000 MRR']},
          ].map(s=>(
            <div key={s.title} style={{marginBottom:20}}>
              <h3 style={{fontSize:14,fontWeight:700,marginBottom:10,paddingBottom:6,borderBottom:'1px solid #F0EEE8'}}>{s.title}</h3>
              <ul style={{paddingLeft:18,display:'flex',flexDirection:'column',gap:6}}>{s.items.map((item,i)=><li key={i} style={{fontSize:12,color:'#444',lineHeight:1.5}}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    ),
  }

  useEffect(() => {
    if (view === 'cities') {
      setTimeout(() => {
        mkChart('cityC', { type:'bar', data:{ labels:CITY_DATA.map(c=>c.c), datasets:[{ data:CITY_DATA.map(c=>c.u), backgroundColor:'rgba(29,158,117,.7)' }] }, options:{ ...baseOpts(), indexAxis:'y' } })
      }, 50)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  return (
    <>
      <Head>
        <title>homepitch.ro — Admin Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" />
      </Head>
      <div style={{display:'flex',minHeight:'100vh'}}>
        <Sidebar active={view} onChange={setView} anomalyCount={anomalies.filter(a=>a.sev==='critical').length}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{height:44,background:'#fff',borderBottom:'1px solid #E8E6DF',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 18px',flexShrink:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'#1A1916',textTransform:'capitalize'}}>{view==='ai'?'AI Insights':view==='seo'?'Search Console':view==='prd'?'PRD':view}</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:11,color:'#bbb'}}>Apr 13 – May 12, 2026 · GA4 live</span>
              <div style={{width:26,height:26,borderRadius:'50%',background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#185FA5'}}>HP</div>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:16}}>
            {panels[view] || <div style={{color:'#888',padding:20}}>Coming soon</div>}
          </div>
        </div>
      </div>
    </>
  )
}
