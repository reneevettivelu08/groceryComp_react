import { useState, useEffect } from 'react'

const UNITS = ['grams', 'kg', 'lbs', 'oz']
const BOX_SIZES = [
  { value: 'small-mixed',  label: 'Small (Mixed)' },
  { value: 'medium-mixed', label: 'Medium (Mixed)' },
  { value: 'large-mixed',  label: 'Large (Mixed)' },
  { value: 'all-veggie', label: 'All Veggie' },
  { value: 'all-fruit',  label: 'All Fruit' },
  { value: 'small-organic',  label: 'Small Organic' },
  { value: 'medium-organic', label: 'Medium Organic' }
]
const COUNTRIES = [
  { code: '',   label: 'Unknown' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'MX', label: '🇲🇽 Mexico' },
  { code: 'PE', label: '🇵🇪 Peru' },
  { code: 'CL', label: '🇨🇱 Chile' },
  { code: 'CO', label: '🇨🇴 Colombia' },
  { code: 'GT', label: '🇬🇹 Guatemala' },
  { code: 'ZA', label: '🇿🇦 South Africa' },
  { code: 'ES', label: '🇪🇸 Spain' },
  { code: 'IT', label: '🇮🇹 Italy' },
  { code: 'NL', label: '🇳🇱 Netherlands' },
]

const STORAGE_KEY = 'oddBunchMenus'
function genId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
function todayISO() { return new Date().toISOString().slice(0, 10) }
function formatDate(str) {
  const [y, m, d] = str.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[+m - 1]} ${+d}, ${y}`
}

function emptyItem() {
  return { id: genId(), name: '', qty: '', unit: 'pieces', country: '' }
}

const s = {
  card: {
    background: 'white',
    border: '1px solid #e8e8e8',
    borderRadius: 12,
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  label: { fontSize: 12, color: '#666', display: 'block', marginBottom: 4 },
  input: {
    width: '100%', height: 36, padding: '0 10px',
    border: '1px solid #ddd', borderRadius: 8,
    fontSize: 14, fontFamily: 'inherit',
    outline: 'none', background: 'white', color: '#1a1a1a',
  },
  select: {
    width: '100%', height: 36, padding: '0 8px',
    border: '1px solid #ddd', borderRadius: 8,
    fontSize: 14, fontFamily: 'inherit',
    outline: 'none', background: 'white', color: '#1a1a1a',
    cursor: 'pointer',
  },
  btn: (variant = 'secondary') => ({
    height: 36,
    padding: '0 16px',
    border: '1px solid',
    borderColor: variant === 'primary' ? '#1a1a1a' : '#ddd',
    borderRadius: 8,
    background: variant === 'primary' ? '#1a1a1a' : 'white',
    color: variant === 'primary' ? 'white' : '#444',
    fontSize: 13,
    fontWeight: variant === 'primary' ? 500 : 400,
    cursor: 'pointer',
    fontFamily: 'inherit',
  }),
}

export default function OddBunchEntry({ onCompare }) {
  const [menus, setMenus] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
    catch { return [] }
  })
  const [deliveryDate, setDeliveryDate] = useState(todayISO())
  const [boxSize, setBoxSize] = useState('small-mixed')
  const [items, setItems] = useState([emptyItem()])
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus))
  }, [menus])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function addItem() {
    setItems(prev => [...prev, emptyItem()])
  }

  function removeItem(id) {
    setItems(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev)
  }

  function updateItem(id, field, value) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  function saveMenu() {
    if (!deliveryDate) return showToast('Select a delivery date.')
    const validItems = items.filter(i => i.name.trim())
    if (validItems.length === 0) return showToast('Add at least one item with a name.')

    const menu = {
      id: genId(),
      date: deliveryDate,
      boxSize,
      items: validItems,
      savedAt: new Date().toISOString(),
    }
    setMenus(prev => [menu, ...prev])
    setItems([emptyItem()])
    setDeliveryDate(todayISO())
    showToast('Menu saved!')
  }

  function deleteMenu(id) {
    setMenus(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div>
      {/* ── Entry form ── */}
      <div style={s.card}>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          This week's delivery
        </p>

        {/* Delivery date + box size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={s.label}>Delivery date</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              style={s.input}
            />
          </div>
          <div>
            <label style={s.label}>Box size</label>
            <select value={boxSize} onChange={e => setBoxSize(e.target.value)} style={s.select}>
              {BOX_SIZES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 70px 110px 150px 28px', gap: 8, marginBottom: 6 }}>
          {['Item name', 'Qty', 'Unit', 'Country (optional)', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 11, color: '#888' }}>{h}</span>
          ))}
        </div>

        {/* Item rows */}
        {items.map(item => (
          <div
            key={item.id}
            style={{ display: 'grid', gridTemplateColumns: '2fr 70px 110px 150px 28px', gap: 8, marginBottom: 6, alignItems: 'center' }}
          >
            <input
              type="text"
              placeholder="e.g. Fresh Kale Slaw"
              value={item.name}
              onChange={e => updateItem(item.id, 'name', e.target.value)}
              style={s.input}
            />
            <input
              type="text"
              placeholder="350"
              value={item.qty}
              onChange={e => updateItem(item.id, 'qty', e.target.value)}
              style={{ ...s.input, textAlign: 'center' }}
            />
            <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} style={s.select}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={item.country} onChange={e => updateItem(item.id, 'country', e.target.value)} style={s.select}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            <button
              onClick={() => removeItem(item.id)}
              style={{ width: 28, height: 28, border: '1px solid #eee', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 16, color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>
          </div>
        ))}

        {/* Add item */}
        <button
          onClick={addItem}
          style={{ width: '100%', height: 34, border: '1px dashed #ddd', borderRadius: 8, background: 'white', color: '#888', fontSize: 13, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' }}
        >
          + Add item
        </button>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={() => { setItems([emptyItem()]); setDeliveryDate(todayISO()) }} style={s.btn('secondary')}>
            Clear
          </button>
          <button onClick={saveMenu} style={s.btn('primary')}>
            Save menu
          </button>
        </div>
      </div>

      {/* ── Saved menus ── */}
      {menus.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Saved menus
          </p>
          {menus.map(menu => (
            <div key={menu.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 500, fontSize: 15 }}>{formatDate(menu.date)}</span>
                  <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
                    {BOX_SIZES.find(b => b.value === menu.boxSize)?.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => onCompare(menu)}
                    style={{ ...s.btn('primary'), fontSize: 12, height: 30, padding: '0 12px' }}
                  >
                    Compare prices →
                  </button>
                  <button
                    onClick={() => deleteMenu(menu.id)}
                    style={{ ...s.btn('secondary'), fontSize: 12, height: 30, padding: '0 12px', color: '#c00', borderColor: '#fcc' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {menu.items.map(item => (
                  <span key={item.id} style={{ fontSize: 12, background: '#f5f4f0', border: '1px solid #eee', borderRadius: 6, padding: '3px 10px', color: '#555' }}>
                    {item.name} · {item.qty} {item.unit}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a1a', color: 'white', padding: '8px 20px',
          borderRadius: 20, fontSize: 13, zIndex: 100,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}