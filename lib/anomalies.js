import { DAU_DATA } from './data'

function mean(arr) { return arr.reduce((s,v)=>s+v,0)/arr.length }
function std(arr) { const m=mean(arr); return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length) }
function zscore(v,m,s) { return s===0?0:(v-m)/s }

export function detectAnomalies(thresholds = {}) {
  const {
    dauDropPct = 40,
    dauSpikePct = 60,
    bounceThresh = 25,
    durThresh = 700,
    engThresh = 50,
  } = thresholds

  const users = DAU_DATA.map(d=>d.u)
  const avgU = mean(users), stdU = std(users)
  const anomalies = []

  // May traffic cliff
  const aprAvg = mean(DAU_DATA.filter(d=>d.d.startsWith('Apr')).map(d=>d.u))
  const mayAvg = mean(DAU_DATA.filter(d=>d.d.startsWith('May')).map(d=>d.u))
  const dropPct = Math.round((1-mayAvg/aprAvg)*100)
  if (dropPct > dauDropPct) {
    anomalies.push({
      id:'may-cliff', type:'Sustained Traffic Decline', sev:'critical',
      date:'May vs April', metric:`−${dropPct}%`,
      detail:`May daily avg (${Math.round(mayAvg)}) is ${dropPct}% below April avg (${Math.round(aprAvg)}). A channel likely went quiet — check Facebook campaigns and any email/push from late April.`,
      icon:'🔻', color:'red'
    })
  }

  // Zero offer_accepted
  anomalies.push({
    id:'zero-accepted', type:'Zero Accepted Offers', sev:'critical',
    date:'Full 30 days', metric:'0 events',
    detail:'offer_accepted fired 0 times in 30 days. Either the GA4 event is not tagged, or no buyer has accepted an offer yet. This is your most critical business metric — verify tracking immediately.',
    icon:'🚨', color:'red'
  })

  // Daily anomalies
  DAU_DATA.forEach(d => {
    const z = zscore(d.u, avgU, stdU)
    if (z > 1.5) anomalies.push({
      id:`spike-${d.d}`, type:'DAU Spike', sev:'info',
      date:d.d, metric:`${d.u} users`,
      detail:`${Math.round(z*10)/10}σ above mean (avg: ${Math.round(avgU)}). Likely campaign or viral moment. Investigate source to replicate.`,
      icon:'📈', color:'blue'
    })
    if (z < -1.5) anomalies.push({
      id:`drop-${d.d}`, type:'DAU Drop', sev:'critical',
      date:d.d, metric:`${d.u} users`,
      detail:`${Math.round(Math.abs(z)*10)/10}σ below mean (avg: ${Math.round(avgU)}). Traffic dropped significantly — check for outages or campaign pauses.`,
      icon:'📉', color:'red'
    })
    if (d.b > bounceThresh/100) anomalies.push({
      id:`bounce-${d.d}`, type:'High Bounce Rate', sev: d.b>0.4?'critical':'warning',
      date:d.d, metric:`${Math.round(d.b*100)}%`,
      detail:`Exceeded ${bounceThresh}% threshold. ${d.b>0.9?'Near-total bounce — possible broken page or bad ad landing.':'Check landing page or traffic quality.'}`,
      icon:'↩️', color: d.b>0.4?'red':'amber'
    })
    if (d.dur > durThresh) anomalies.push({
      id:`dur-${d.d}`, type:'Session Duration Spike', sev:'info',
      date:d.d, metric:`${Math.round(d.dur)}s`,
      detail:`Avg duration ${Math.round(d.dur/60)}min — likely power users or admin activity. Normal range: 100–600s.`,
      icon:'⏱️', color:'blue'
    })
    const eng = d.e/Math.max(d.s,1)
    if (eng < engThresh/100 && d.s > 5) anomalies.push({
      id:`eng-${d.d}`, type:'Low Engagement Rate', sev:'warning',
      date:d.d, metric:`${Math.round(eng*100)}%`,
      detail:`Only ${d.e} of ${d.s} sessions were engaged. Traffic may be low-quality or users landing on wrong page.`,
      icon:'😴', color:'amber'
    })
  })

  const order = {critical:0,warning:1,info:2}
  return anomalies.sort((a,b)=>(order[a.sev]||9)-(order[b.sev]||9))
}
