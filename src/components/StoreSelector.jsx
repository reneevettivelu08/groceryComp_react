import { useState } from 'react'

const s = {
  card: { background: 'white', border: '1px solid #e8e8e8', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
  label: { fontSize: 12, color: '#666', display: 'block', marginBottom: 4 },
  input: { width: '100%', height: 36, padding: '0 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' },
}

const STORE_INFO = {
  nofrills:   { label: 'No Frills',               color: '#f5c518', textColor: '#1a1a1a', emoji: '🟡' },
  loblaws:    { label: 'Loblaws',                  color: '#c8102e', textColor: 'white',   emoji: '🔴' },
  superstore: { label: 'Real Canadian Superstore', color: '#d62828', textColor: 'white',   emoji: '🔴' },
}

// Hamilton, ON store IDs — update these to match your nearest location
const HAMILTON_STORES = {
  nofrills: [
    { id: '3643', name: "Giorgio's NOFRILLS — Hamilton" },
    { id: '0723', name: "Tony's NOFRILLS — Hamilton" },
    { id: '3687', name: "Kenny & Cindy's NOFRILLS — Hamilton" },
    { id: '3623', name: "Frank's NOFRILLS — Hamilton" },
    { id: '3666', name: "Franco's NOFRILLS — Hamilton" },
  ],
  loblaws: [
    { id: '1038', name: 'Loblaws — Upper James St, Hamilton' },
    { id: '1039', name: 'Loblaws — Stone Church Rd, Hamilton' },
  ],
  superstore: [
    { id: '1057', name: 'Real Canadian Superstore — Queenston Rd, Hamilton' },
  ],
}

export default function StoreSelector({ stores, onChange }) {
  const [saved, setSaved] = useState(false)

  function toggle(key) {
    onChange(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }))
  }

  function updateStoreId(key, value) {
    onChange(prev => ({ ...prev, [key]: { ...prev[key], storeId: value } }))
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: '1.25rem' }}>
        Select which stores to compare against and set your nearest store location.
        Store IDs affect pricing — a store in Hamilton may differ from one in Mississauga.
      </p>

      {Object.entries(stores).map(([key, config]) => {
        const info = STORE_INFO[key]
        const presets = HAMILTON_STORES[key] || []

        return (
          <div key={key} style={{ ...s.card, opacity: config.enabled ? 1 : 0.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: config.enabled ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{info.emoji}</span>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{info.label}</span>
              </div>
              {/* Toggle */}
              <button
                onClick={() => toggle(key)}
                style={{
                  height: 26, padding: '0 12px',
                  border: '1px solid',
                  borderColor: config.enabled ? '#1a1a1a' : '#ddd',
                  borderRadius: 20,
                  background: config.enabled ? '#1a1a1a' : 'white',
                  color: config.enabled ? 'white' : '#888',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {config.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {config.enabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={s.label}>Store ID</label>
                  <input
                    type="text"
                    value={config.storeId}
                    onChange={e => updateStoreId(key, e.target.value)}
                    placeholder="e.g. 3643"
                    style={s.input}
                  />
                  <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                    Find yours: browse the store site → DevTools → Network → any API request → storeId param
                  </p>
                </div>
                <div>
                  <label style={s.label}>Quick select (Hamilton, ON)</label>
                  <select
                    value={config.storeId}
                    onChange={e => updateStoreId(key, e.target.value)}
                    style={{ ...s.input, cursor: 'pointer' }}
                  >
                    {presets.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                    <option value="">— Enter custom ID —</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          onClick={save}
          style={{
            height: 36, padding: '0 20px',
            border: '1px solid #1a1a1a',
            borderRadius: 8,
            background: saved ? '#2d8a4e' : '#1a1a1a',
            color: 'white', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
        >
          {saved ? '✓ Saved' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}