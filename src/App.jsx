import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [subscriptions, setSubscriptions] = useState([])
  const [apiKeys, setApiKeys] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedNotes, setExpandedNotes] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tech',
    paymentDate: '',
    duration: '1',
    price: '',
    notes: ''
  })
  const [apiFormData, setApiFormData] = useState({
    name: '',
    credit: ''
  })

  const categories = [
    { id: 'Tech', label: '💻 Tech', color: '#3b82f6' },
    { id: 'Streaming', label: '🎬 Streaming', color: '#f97316' },
    { id: 'Productivité', label: '📚 Productivité', color: '#8b5cf6' },
    { id: 'Finance', label: '💰 Finance', color: '#10b981' },
    { id: 'Santé', label: '🏥 Santé', color: '#ec4899' },
    { id: 'Autre', label: '📎 Autre', color: '#6b7280' }
  ]

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('subscriptions')
    const savedDarkMode = localStorage.getItem('darkMode')
    const savedApiKeys = localStorage.getItem('apiKeys')

    if (saved) setSubscriptions(JSON.parse(saved))
    if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys))
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode))
    else setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }, [])

  // Apply dark mode to document
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.remove('light')
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [darkMode])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions))
  }, [subscriptions])

  useEffect(() => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys))
  }, [apiKeys])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const getStatus = (endDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Parse date as YYYY-MM-DD format
    const [year, month, day] = endDate.split('-')
    const end = new Date(year, month - 1, day)
    end.setHours(0, 0, 0, 0)

    const diff = Math.floor((end - today) / (1000 * 60 * 60 * 24))

    if (diff < 0) return { status: 'expired', label: 'Expiré', days: diff }
    if (diff === 0) return { status: 'today', label: 'Aujourd\'hui', days: 0 }
    if (diff < 7) return { status: 'soon', label: 'Bientôt', days: diff }
    return { status: 'active', label: 'Actif', days: diff }
  }

  const calculateEndDate = (paymentDate, duration) => {
    if (!paymentDate || !duration) return ''
    const [year, month, day] = paymentDate.split('-')
    const start = new Date(year, month - 1, day)

    // Handle special duration values
    if (duration === '0.25') { // 1 week = 7 days
      start.setDate(start.getDate() + 7)
      return start.toISOString().split('T')[0]
    }

    const months = parseInt(duration)
    const end = new Date(start.getFullYear(), start.getMonth() + months, start.getDate())
    return end.toISOString().split('T')[0]
  }

  const getDaysInfo = (startDate, endDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Parse dates properly
    const [startYear, startMonth, startDay] = startDate.split('-')
    const start = new Date(startYear, startMonth - 1, startDay)
    start.setHours(0, 0, 0, 0)

    const [endYear, endMonth, endDay] = endDate.split('-')
    const end = new Date(endYear, endMonth - 1, endDay)
    end.setHours(0, 0, 0, 0)

    const daysElapsed = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.floor((end - today) / (1000 * 60 * 60 * 24))
    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24))

    return { daysElapsed, daysRemaining, totalDays }
  }

  const addSubscription = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.paymentDate || !formData.duration || !formData.price) return

    const endDate = calculateEndDate(formData.paymentDate, formData.duration)

    if (editingId) {
      setSubscriptions(subscriptions.map(s =>
        s.id === editingId
          ? { ...s, name: formData.name, category: formData.category, endDate, price: parseFloat(formData.price), notes: formData.notes, paymentDate: formData.paymentDate, duration: formData.duration }
          : s
      ))
      setEditingId(null)
    } else {
      const newSub = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        paymentDate: formData.paymentDate,
        duration: formData.duration,
        endDate: endDate,
        price: parseFloat(formData.price),
        notes: formData.notes,
        createdAt: formData.paymentDate + 'T00:00:00.000Z'
      }
      setSubscriptions([...subscriptions, newSub])
    }

    setFormData({ name: '', category: 'Tech', paymentDate: '', duration: '1', price: '', notes: '' })
    setShowEditModal(false)
  }

  const editSubscription = (sub) => {
    setFormData({
      name: sub.name,
      category: sub.category || 'Tech',
      paymentDate: sub.paymentDate || '',
      duration: sub.duration || '1',
      price: sub.price.toString(),
      notes: sub.notes || ''
    })
    setEditingId(sub.id)
    setShowEditModal(true)
  }

  const deleteSubscription = (id) => {
    if (window.confirm('Supprimer cet abonnement? Cette action ne peut pas être annulée.')) {
      setSubscriptions(subscriptions.filter(s => s.id !== id))
    }
  }

  const addApiKey = (e) => {
    e.preventDefault()
    if (!apiFormData.name || !apiFormData.credit) return

    const newKey = {
      id: Date.now(),
      name: apiFormData.name,
      credit: parseFloat(apiFormData.credit),
      createdAt: new Date().toISOString()
    }
    setApiKeys([...apiKeys, newKey])
    setApiFormData({ name: '', credit: '' })
  }

  const deleteApiKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id))
  }

  const updateApiCredit = (id, newCredit) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, credit: parseFloat(newCredit) } : k))
  }

  const statusOrder = { expired: 0, today: 1, soon: 2, active: 3 }
  const sorted = [...subscriptions].sort((a, b) => {
    const aStatus = getStatus(a.endDate)
    const bStatus = getStatus(b.endDate)

    // Tri par ordre de priorité (expirés d'abord)
    if (statusOrder[aStatus.status] !== statusOrder[bStatus.status]) {
      return statusOrder[aStatus.status] - statusOrder[bStatus.status]
    }

    // Tri secondaire par jours (ascendant pour urgence)
    return aStatus.days - bStatus.days
  })

  const totalPrice = subscriptions.reduce((sum, s) => sum + s.price, 0)
  const totalApiCredit = apiKeys.reduce((sum, k) => sum + k.credit, 0)
  const expiredCount = subscriptions.filter(s => getStatus(s.endDate).status === 'expired').length

  const exportCSV = () => {
    const headers = ['Abonnement', 'Catégorie', 'Date expiration', 'Jours restants', 'Prix', 'Notes']
    const rows = sorted.map(s => {
      const st = getStatus(s.endDate)
      return [
        s.name,
        s.category || 'Autre',
        s.endDate,
        st.days,
        `$${s.price.toFixed(2)}`,
        s.notes || ''
      ]
    })

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getFilteredSubscriptions = () => {
    if (selectedCategory === 'all') return sorted
    return sorted.filter(s => (s.category || 'Autre') === selectedCategory)
  }

  const getCategoryStats = () => {
    const stats = {}
    categories.forEach(cat => {
      const subs = subscriptions.filter(s => (s.category || 'Autre') === cat.id)
      stats[cat.id] = {
        count: subs.length,
        total: subs.reduce((sum, s) => sum + s.price, 0),
        percentage: subscriptions.length > 0 ? Math.round((subs.reduce((sum, s) => sum + s.price, 0) / totalPrice) * 100) : 0,
        color: cat.color
      }
    })
    return stats
  }

  const toggleNotes = (id) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className={darkMode ? 'dark' : 'light'}>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <h1>📋 Subscription Tracker</h1>
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <main className="main">
          {/* Stats */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-value">${totalPrice.toFixed(2)}</div>
              <div className="stat-label">Dépense totale</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${totalApiCredit.toFixed(2)}</div>
              <div className="stat-label">Crédits API</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{subscriptions.length}</div>
              <div className="stat-label">Abonnements</div>
            </div>
            {expiredCount > 0 && (
              <div className="stat-card stat-expired">
                <div className="stat-value expired">{expiredCount}</div>
                <div className="stat-label">Expirés</div>
              </div>
            )}
            <button className="export-btn" onClick={exportCSV}>
              📥 Exporter CSV
            </button>
          </div>

          {/* Pie Chart & Category Stats */}
          {subscriptions.length > 0 && (
            <div className="chart-section">
              <h2>📊 Dépenses par Catégorie</h2>
              <div className="chart-container">
                <svg className="pie-chart" viewBox="0 0 200 200">
                  {(() => {
                    const stats = getCategoryStats()
                    let currentAngle = -90
                    return Object.entries(stats).map(([catId, data]) => {
                      if (data.total === 0) return null
                      const sliceAngle = (data.total / totalPrice) * 360
                      const endAngle = currentAngle + sliceAngle
                      const startRad = (currentAngle * Math.PI) / 180
                      const endRad = (endAngle * Math.PI) / 180
                      const x1 = 100 + 80 * Math.cos(startRad)
                      const y1 = 100 + 80 * Math.sin(startRad)
                      const x2 = 100 + 80 * Math.cos(endRad)
                      const y2 = 100 + 80 * Math.sin(endRad)
                      const largeArc = sliceAngle > 180 ? 1 : 0
                      const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`
                      currentAngle = endAngle
                      const cat = categories.find(c => c.id === catId)
                      return <path key={catId} d={path} fill={data.color} stroke="var(--bg)" strokeWidth="2" />
                    })
                  })()}
                </svg>
                <div className="category-stats">
                  {(() => {
                    const stats = getCategoryStats()
                    return Object.entries(stats)
                      .filter(([_, data]) => data.total > 0)
                      .map(([catId, data]) => {
                        const cat = categories.find(c => c.id === catId)
                        return (
                          <div key={catId} className="stat-row">
                            <span className="stat-dot" style={{ backgroundColor: data.color }}></span>
                            <span className="stat-name">{cat.label}</span>
                            <span className="stat-amount">${data.total.toFixed(2)}</span>
                            <span className="stat-percent">{data.percentage}%</span>
                          </div>
                        )
                      })
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          {subscriptions.length > 0 && (
            <div className="filter-section">
              <h3>Filtrer par catégorie:</h3>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  Tous ({subscriptions.length})
                </button>
                {categories.map(cat => {
                  const count = subscriptions.filter(s => (s.category || 'Autre') === cat.id).length
                  if (count === 0) return null
                  return (
                    <button
                      key={cat.id}
                      className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{ borderColor: selectedCategory === cat.id ? cat.color : 'transparent' }}
                    >
                      {cat.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* API Keys Section */}
          <section className="section">
            <h2>🔑 Clés API & Crédits</h2>
            <form className="api-form" onSubmit={addApiKey}>
              <input
                type="text"
                placeholder="Nom (ex: DeepSeek, OpenAI)"
                value={apiFormData.name}
                onChange={(e) => setApiFormData({...apiFormData, name: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Crédit ($)"
                step="0.01"
                value={apiFormData.credit}
                onChange={(e) => setApiFormData({...apiFormData, credit: e.target.value})}
                required
              />
              <button type="submit" className="btn-submit">Ajouter</button>
            </form>

            <div className="api-keys-grid">
              {apiKeys.length === 0 ? (
                <p className="empty">Aucune clé API. Ajoutes-en une! 👆</p>
              ) : (
                apiKeys.map(key => (
                  <div key={key.id} className="api-key-card">
                    <div className="api-header">
                      <h3>{key.name}</h3>
                      <button
                        className="delete-btn"
                        onClick={() => deleteApiKey(key.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="credit-display">${key.credit.toFixed(2)}</div>
                    <input
                      type="number"
                      step="0.01"
                      value={key.credit}
                      onChange={(e) => updateApiCredit(key.id, e.target.value)}
                      className="credit-input"
                    />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Subscriptions Section */}
          <section className="section">
            <h2>📦 Abonnements</h2>

            {showEditModal && (
              <form className="form-card" onSubmit={addSubscription}>
                <h3>{editingId ? 'Modifier' : 'Ajouter'} un abonnement</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Nom (ex: Claude Pro)"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <div>
                    <label className="form-label">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Date de paiement</label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Durée</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      required
                    >
                      <option value="0.25">1 semaine</option>
                      <option value="1">1 mois</option>
                      <option value="3">3 mois</option>
                      <option value="6">6 mois</option>
                      <option value="12">1 an</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="Prix ($)"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Notes personnelles (optionnel - ex: Pourquoi tu paies ça? Rappels...)"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="notes-textarea"
                  />
                  {formData.paymentDate && formData.duration && (
                    <div className="expiration-preview">
                      Expire: {calculateEndDate(formData.paymentDate, formData.duration)}
                    </div>
                  )}
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="btn-submit">
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingId(null)
                      setFormData({ name: '', paymentDate: '', duration: '1', price: '', notes: '' })
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {!showEditModal && (
              <button className="btn-add-sub" onClick={() => setShowEditModal(true)}>
                ➕ Ajouter un abonnement
              </button>
            )}

            <div className="subscriptions-grid">
              {getFilteredSubscriptions().length === 0 ? (
                <div className="empty-state">
                  <p>{subscriptions.length === 0 ? 'Aucun abonnement. Ajoutes-en un! 👆' : 'Aucun abonnement dans cette catégorie.'}</p>
                </div>
              ) : (
                getFilteredSubscriptions().map(sub => {
                  const st = getStatus(sub.endDate)
                  const cat = categories.find(c => c.id === (sub.category || 'Autre'))
                  const isNotesExpanded = expandedNotes[sub.id]
                  return (
                    <div key={sub.id} className={`sub-card status-${st.status}`}>
                      <div className="card-header">
                        <div className="card-title-section">
                          <h3>{sub.name}</h3>
                          {cat && <span className="category-badge" style={{ backgroundColor: cat.color + '30', color: cat.color }}>{cat.label}</span>}
                        </div>
                        <span className={`badge badge-${st.status}`}>{st.label}</span>
                      </div>

                      <div className="card-body">
                        {sub.paymentDate && (
                          <div className="card-row">
                            <span className="label">Paiement:</span>
                            <span className="value">{sub.paymentDate}</span>
                          </div>
                        )}
                        <div className="card-row">
                          <span className="label">Renouvellement:</span>
                          <span className="value">{sub.endDate}</span>
                        </div>

                        <div className={`days-display ${st.status}`}>
                          <div className="days-count">
                            {st.days === 0
                              ? '⚠️ EXPIRE AUJOURD\'HUI'
                              : st.days < 0
                              ? `🔴 EXPIRÉ depuis ${Math.abs(st.days)}j`
                              : `${st.days}j restant${st.days > 1 ? 's' : ''}`
                            }
                          </div>
                        </div>

                        {sub.createdAt && st.days >= 0 && (
                          <div className="days-breakdown">
                            {(() => {
                              const createdDate = new Date(sub.createdAt).toISOString().split('T')[0]
                              const info = getDaysInfo(createdDate, sub.endDate)
                              return (
                                <div className="days-info">
                                  <div className="day-item">
                                    <span className="day-value">{info.daysElapsed}j</span>
                                    <span className="day-label">écoulés</span>
                                  </div>
                                  <span className="days-separator">•</span>
                                  <div className="day-item">
                                    <span className="day-value">{Math.max(0, info.daysRemaining)}j</span>
                                    <span className="day-label">restants</span>
                                  </div>
                                </div>
                              )
                            })()}
                          </div>
                        )}

                        <div className="card-row">
                          <span className="label">Prix:</span>
                          <span className="price">${sub.price.toFixed(2)}</span>
                        </div>

                        {sub.notes && (
                          <div className="notes-section">
                            <button
                              className="notes-toggle"
                              onClick={() => toggleNotes(sub.id)}
                              title={isNotesExpanded ? 'Masquer les notes' : 'Afficher les notes'}
                            >
                              📌 {isNotesExpanded ? '▼' : '▶'} Notes
                            </button>
                            {isNotesExpanded && (
                              <div className="notes-content">
                                {sub.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="card-footer">
                        <button
                          className="btn-icon edit-btn"
                          onClick={() => editSubscription(sub)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon delete-btn"
                          onClick={() => deleteSubscription(sub.id)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
