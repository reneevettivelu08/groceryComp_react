import { useState } from 'react'
import OddBunchEntry from './components/OddBunchEntry.jsx'
import PriceComparison from './components/PriceComparison.jsx'
import StoreSelector from './components/StoreSelector.jsx'

// Default store config — matches .env defaults for Hamilton, ON
const DEFAULT_STORES = {
  nofrills: { enabled: true, storeId: '3643', label: "No Frills" },
  loblaws:  { enabled: false, storeId: '1038', label: "Loblaws" },
  superstore: { enabled: false, storeId: '1057', label: "Real Canadian Superstore" },
}

export default function App() {
  const [view, setView] = useState('entry')        // 'entry' | 'compare'
  const [activeMenu, setActiveMenu] = useState(null)
  const [stores, setStores] = useState(DEFAULT_STORES)

  function handleCompare(menu) {
    setActiveMenu(menu)
    setView('compare')
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px' }}>
          🥦 groceryComp
        </h1>
        <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
          Odd Bunch vs Ontario grocery stores
        </p>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {[
          { id: 'entry', label: 'Weekly menu' },
          { id: 'compare', label: 'Price comparison' },
          { id: 'stores', label: 'Store settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: view === tab.id ? '#1a1a1a' : '#ddd',
              background: view === tab.id ? '#1a1a1a' : 'white',
              color: view === tab.id ? 'white' : '#444',
              fontSize: 13,
              fontWeight: view === tab.id ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {view === 'entry' && (
        <OddBunchEntry onCompare={handleCompare} />
      )}
      {view === 'compare' && (
        <PriceComparison menu={activeMenu} stores={stores} />
      )}
      {view === 'stores' && (
        <StoreSelector stores={stores} onChange={setStores} />
      )}
    </div>
  )
}