import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

async function fetchSearch(term, banner, storeId) {
  const params = new URLSearchParams({ term, banner, storeId })
  const res = await fetch(`${API_BASE}/api/loblaw/search?${params}`)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  const data = await res.json()
  return data.results || []
}

function toGrams(qty, unit) {
  const n = parseFloat(qty)
  if (isNaN(n)) return null
  switch (unit) {
    case 'grams': return n
    case 'kg':    return n * 1000
    case 'lbs':   return n * 453.592
    case 'oz':    return n * 28.3495
    default:      return null
  }
}

function formatPrice(val) {
  if (val == null) return '—'
  return `$${val.toFixed(2)}`
}

const ODD_BUNCH_PRICES = {
  'small-mixed':  20.00,
  'medium-mixed': 32.00,
  'large-mixed':  46.00,
   'all-veggie':  32.00,
  'all-fruit':  32.00,
'small-organic':  32.00,
  'medium-organic': 46.00
}

const BOX_SIZE_LABELS = {
  'small-mixed':  'Small (Mixed)',
  'medium-mixed': 'Medium (Mixed)',
  'large-mixed':  'Large (Mixed)',
  'all-veggie':  'All Veggie',
  'all-fruit':  'All Fruit',
'small-organic':  'Small Organic',
  'medium-organic': 'Medium Organic'
}

const STORE_COLORS = {
  nofrills:   '#c49a00',
  loblaws:    '#c8102e',
  superstore: '#1a6eb5',
}

const STORE_LABELS = {
  nofrills:   'No Frills',
  loblaws:    'Loblaws',
  superstore: 'Superstore',
}

function ItemRow({ item, stores, onResolved }) {
  const [results, setResults]   = useState({})
  const [loading, setLoading]   = useState({})
  const [errors, setErrors]     = useState({})
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState({})

  const enabledStores = Object.entries(stores).filter(([, cfg]) => cfg.enabled)
  const oddBunchGrams = toGrams(item.qty, item.unit)

  useEffect(() => {
    enabledStores.forEach(([banner, cfg]) => {
      setLoading(prev => ({ ...prev, [banner]: true }))
      fetchSearch(item.name, banner, cfg.storeId)
        .then(res => {
          setResults(prev => ({ ...prev, [banner]: res }))
          setSelected(prev => ({ ...prev, [banner]: 0 }))
          const product = res[0]
          if (product) {
            if (oddBunchGrams && product.pricePerKg) {
              onResolved(banner, (oddBunchGrams / 1000) * product.pricePerKg)
            } else if (product.price) {
              onResolved(banner, product.price)
            }
          }
        })
        .catch(err => setErrors(prev => ({ ...prev, [banner]: err.message })))
        .finally(() => setLoading(prev => ({ ...prev, [banner]: false })))
    })
  }, [item.name]) // eslint-disable-line

  return (
    <div style={{ background: 'white', border: '1px solid #e8e8e8', borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
      >
        <div>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</span>
          {item.country && (
            <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>{item.country}</span>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#bbb' }}>{expanded ? '▲ less' : '▼ alternatives'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${enabledStores.length}, 1fr)` }}>
        {enabledStores.map(([banner], i) => {
          const storeResults = results[banner] || []
          const idx          = selected[banner] ?? 0
          const product      = storeResults[idx]
          const isLoading    = loading[banner]
          const error        = errors[banner]

          // Calculate the best comparable cost we can for this item:
          // - If item has weight AND product has per-kg price → most accurate
          // - If item has weight but product only has flat price → note it's approximate
          // - If no weight conversion possible → just show the flat price
          let comparableNote = null
          let comparableCost = null
          if (product) {
            if (oddBunchGrams && product.pricePerKg) {
              comparableCost = (oddBunchGrams / 1000) * product.pricePerKg
              comparableNote = `≈ ${formatPrice(comparableCost)} for ${item.qty} ${item.unit}`
            } else if (product.price) {
              comparableCost = product.price
            }
          }

          return (
            <div key={banner} style={{ padding: '10px 14px', borderRight: i < enabledStores.length - 1 ? '1px solid #f5f5f5' : 'none', minHeight: 76 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: STORE_COLORS[banner], marginBottom: 5 }}>
                {STORE_LABELS[banner]}
              </div>

              {isLoading && <div style={{ fontSize: 12, color: '#bbb' }}>Searching…</div>}
              {error     && <div style={{ fontSize: 11, color: '#c00' }}>Error: {error}</div>}
              {!isLoading && !error && !product && <div style={{ fontSize: 12, color: '#bbb' }}>No match found</div>}

              {!isLoading && !error && product && (
                <>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {formatPrice(product.price)}
                    <span style={{ fontSize: 11, color: '#999', fontWeight: 400, marginLeft: 3 }}>/{product.priceUnit}</span>
                  </div>
                  {product.pricePerKg && (
                    <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>
                      {formatPrice(product.pricePerKg)}/kg · {formatPrice(product.pricePerLb)}/lb
                    </div>
                  )}
                  {comparableNote && (
                    <div style={{ fontSize: 11, color: '#2d7d4a', fontWeight: 600, marginTop: 3 }}>{comparableNote}</div>
                  )}
                  {product.onSale && (
                    <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, background: '#fff8e1', color: '#7d5a00', padding: '1px 6px', borderRadius: 4 }}>
                      On sale
                    </span>
                  )}
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>
                    {product.name}{product.packageSize ? ` · ${product.packageSize}` : ''}
                  </div>
                </>
              )}

              {expanded && storeResults.length > 1 && (
                <select
                  value={idx}
                  onChange={e => {
                    const newIdx = +e.target.value
                    setSelected(prev => ({ ...prev, [banner]: newIdx }))
                    const p = storeResults[newIdx]
                    if (p) {
                      if (oddBunchGrams && p.pricePerKg) {
                        onResolved(banner, (oddBunchGrams / 1000) * p.pricePerKg)
                      } else if (p.price) {
                        onResolved(banner, p.price)
                      }
                    }
                  }}
                  style={{ marginTop: 8, width: '100%', height: 28, border: '1px solid #ddd', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: 'white', cursor: 'pointer' }}
                >
                  {storeResults.map((r, i) => (
                    <option key={r.code} value={i}>
                      {r.name}{r.packageSize ? ` (${r.packageSize})` : ''} — {formatPrice(r.price)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SummaryRow({ storeTotals, stores, oddBunchPrice }) {
  const enabledStores = Object.entries(stores).filter(([, cfg]) => cfg.enabled)

  return (
    <div style={{ background: '#f7f7f5', border: '1px solid #e0e0dc', borderRadius: 12, overflow: 'hidden', marginTop: 16 }}>
      <div style={{ padding: '9px 16px', borderBottom: '1px solid #e8e8e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Estimated totals
        </span>
        <span style={{ fontSize: 11, color: '#bbb' }}>
          Weight items use per-kg price · others use flat price
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${enabledStores.length}, 1fr)` }}>
        <div style={{ padding: '14px 16px', borderRight: '1px solid #eee' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#2d7d4a', marginBottom: 6 }}>
            Odd Bunch
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
            {oddBunchPrice != null ? `$${oddBunchPrice.toFixed(2)}` : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>weekly subscription</div>
        </div>

        {enabledStores.map(([banner], i) => {
          const total   = storeTotals[banner]
          const diff    = (total != null && oddBunchPrice != null) ? total - oddBunchPrice : null
          const oddWins = diff != null && diff > 0

          return (
            <div key={banner} style={{ padding: '14px 14px', borderRight: i < enabledStores.length - 1 ? '1px solid #eee' : 'none' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: STORE_COLORS[banner], marginBottom: 6 }}>
                {STORE_LABELS[banner]}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
                {total != null ? `$${total.toFixed(2)}` : '…'}
              </div>
              {diff != null && (
                <div style={{ marginTop: 5, fontSize: 12, fontWeight: 600, color: oddWins ? '#2d7d4a' : '#a00', background: oddWins ? '#edf7f0' : '#fdf0f0', display: 'inline-block', padding: '2px 8px', borderRadius: 6 }}>
                  {oddWins ? `✓ Odd Bunch saves $${Math.abs(diff).toFixed(2)}` : `Store saves $${Math.abs(diff).toFixed(2)}`}
                </div>
              )}
              {total == null && <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>awaiting results…</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PriceComparison({ menu, stores }) {
  const [storeTotals, setStoreTotals] = useState({})

  function handleItemResolved(banner, equivCost) {
    if (equivCost == null) return
    setStoreTotals(prev => ({
      ...prev,
      [banner]: parseFloat(((prev[banner] || 0) + equivCost).toFixed(2)),
    }))
  }

  useEffect(() => { setStoreTotals({}) }, [menu?.id])

  if (!menu) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        <p style={{ fontSize: 15 }}>No menu selected.</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>
          Go to <strong>Weekly menu</strong>, save a delivery, then hit <strong>Compare prices →</strong>
        </p>
      </div>
    )
  }

  const enabledStores = Object.entries(stores).filter(([, cfg]) => cfg.enabled)
  if (enabledStores.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        <p>No stores enabled. Go to <strong>Store settings</strong> and turn on at least one store.</p>
      </div>
    )
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const [y, m, d] = menu.date.split('-')
  const dateLabel     = `${months[+m - 1]} ${+d}, ${y}`
  const oddBunchPrice = ODD_BUNCH_PRICES[menu.boxSize] ?? null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Odd Bunch — {dateLabel}</h2>
          <p style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
            {menu.items.length} items · {BOX_SIZE_LABELS[menu.boxSize] || menu.boxSize} · vs {enabledStores.map(([b]) => STORE_LABELS[b]).join(', ')}
          </p>
        </div>
        {oddBunchPrice && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#999' }}>Box price</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2d7d4a' }}>${oddBunchPrice.toFixed(2)}</div>
          </div>
        )}
      </div>

      {menu.items.map(item => (
        <ItemRow key={item.id} item={item} stores={stores} onResolved={handleItemResolved} />
      ))}

      <SummaryRow storeTotals={storeTotals} stores={stores} oddBunchPrice={oddBunchPrice} />
    </div>
  )
}