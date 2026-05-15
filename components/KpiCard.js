export default function KpiCard({ label, value, sub, trend, color = 'default' }) {
  const colors = {
    green: { val: '#1D9E75', bg: '#E1F5EE', border: '#A8DFC7' },
    red:   { val: '#A32D2D', bg: '#FCEBEB', border: '#F09595' },
    amber: { val: '#854F0B', bg: '#FAEEDA', border: '#F0D68A' },
    blue:  { val: '#185FA5', bg: '#E6F1FB', border: '#9DC4EC' },
    default: { val: '#1A1916', bg: '#fff', border: '#E8E6DF' },
  }
  const c = colors[color] || colors.default

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      padding: '12px 14px',
      borderLeft: `3px solid ${c.val}`,
    }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: c.val, lineHeight: 1.1, marginBottom: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#999' }}>{sub}</div>}
      {trend && <div style={{ fontSize: 11, color: trend.startsWith('+') ? '#1D9E75' : trend.startsWith('−') ? '#A32D2D' : '#999', marginTop: 2 }}>{trend}</div>}
    </div>
  )
}
