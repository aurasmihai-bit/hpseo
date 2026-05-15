import { useState } from 'react'

const NAV = [
  { id: 'overview',    label: 'Overview',        icon: '◈', section: 'Analytics' },
  { id: 'traffic',     label: 'Traffic',          icon: '↗', section: 'Analytics' },
  { id: 'conversions', label: 'Conversions',      icon: '◎', section: 'Analytics' },
  { id: 'funnel',      label: 'Funnel',           icon: '▽', section: 'Analytics' },
  { id: 'anomalies',   label: 'Anomalies',        icon: '⚡', section: 'Intelligence', badge: true },
  { id: 'ai',          label: 'AI Insights',      icon: '✦', section: 'Intelligence' },
  { id: 'sources',     label: 'Traffic Sources',  icon: '⊕', section: 'Acquisition' },
  { id: 'devices',     label: 'Devices',          icon: '□', section: 'Acquisition' },
  { id: 'cities',      label: 'Cities',           icon: '◎', section: 'Acquisition' },
  { id: 'seo',         label: 'Search Console',   icon: '⟳', section: 'Acquisition' },
  { id: 'pages',       label: 'Top Pages',        icon: '≡', section: 'Acquisition' },
  { id: 'prd',         label: 'PRD',              icon: '📋', section: 'Product' },
]

export default function Sidebar({ active, onChange, anomalyCount }) {
  const sections = [...new Set(NAV.map(n => n.section))]

  return (
    <div style={{
      width: 200, flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #E8E6DF',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px', borderBottom: '1px solid #E8E6DF' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1916' }}>
          home<span style={{ color: '#1D9E75' }}>pitch</span>.ro
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#E1F5EE', color: '#0F6E56',
          fontSize: 10, fontWeight: 700,
          padding: '2px 8px', borderRadius: 20, marginTop: 6,
        }}>
          <span style={{
            width: 5, height: 5, background: '#1D9E75', borderRadius: '50%',
            animation: 'pulse 2s infinite',
          }} />
          Live · GA4
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {sections.map(sec => (
          <div key={sec} style={{ marginBottom: 4 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#C0BEB8',
              padding: '6px 14px 2px', textTransform: 'uppercase', letterSpacing: '.06em'
            }}>{sec}</div>
            {NAV.filter(n => n.section === sec).map(item => (
              <div
                key={item.id}
                onClick={() => onChange(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 14px', cursor: 'pointer', fontSize: 12,
                  color: active === item.id ? '#0F6E56' : '#5F5E5A',
                  background: active === item.id ? '#F0FBF6' : 'transparent',
                  borderLeft: `2px solid ${active === item.id ? '#1D9E75' : 'transparent'}`,
                  fontWeight: active === item.id ? 600 : 400,
                  transition: 'all .12s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ opacity: .7 }}>{item.icon}</span>
                  {item.label}
                </span>
                {item.badge && anomalyCount > 0 && (
                  <span style={{
                    background: '#A32D2D', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    padding: '1px 5px', borderRadius: 10,
                  }}>{anomalyCount}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 14px', borderTop: '1px solid #E8E6DF',
        fontSize: 10, color: '#C0BEB8'
      }}>
        Apr 13 – May 12, 2026
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  )
}
