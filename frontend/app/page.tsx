'use client'

import { useState } from 'react'

const API = 'http://localhost:8000'

interface SearchResult {
  id: number
  title: string
  content: string
  similarity: number
}

export default function Home() {

  // ── Add Document state ────────────────────────────────────────────────
  const [title,      setTitle]      = useState('')
  const [content,    setContent]    = useState('')
  const [adding,     setAdding]     = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)

  // ── Search state ──────────────────────────────────────────────────────
  const [query,     setQuery]     = useState('')
  const [searching, setSearching] = useState(false)
  const [results,   setResults]   = useState<SearchResult[] | null>(null)

  // ── Shared ────────────────────────────────────────────────────────────
  const [error, setError] = useState('')

  // ── Add Document ──────────────────────────────────────────────────────
  async function handleAddDocument() {
    if (!title.trim() || !content.trim()) return
    setAdding(true)
    setError('')
    setAddSuccess(false)
    try {
      const res = await fetch(`${API}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setAddSuccess(true)
      setTitle('')
      setContent('')
    } catch {
      setError('Failed to add document. Is the backend running at localhost:8000?')
    } finally {
      setAdding(false)
    }
  }

  // ── Search ────────────────────────────────────────────────────────────
  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch(`${API}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const sorted = [...data.results].sort((a: SearchResult, b: SearchResult) => b.similarity - a.similarity)
      setResults(sorted)
    } catch {
      setError('Search failed. Is the backend running at localhost:8000?')
    } finally {
      setSearching(false)
    }
  }

  // ── Button style ──────────────────────────────────────────────────────
  function btn(disabled: boolean): React.CSSProperties {
    return {
      padding: '0.75rem 1.25rem',
      background: 'transparent',
      color: disabled ? 'var(--blue)' : 'var(--cyan)',
      border: `2px solid ${disabled ? 'var(--blue)' : 'var(--cyan)'}`,
      borderRadius: '0px',
      fontFamily: 'var(--font-pixel)',
      fontSize: '0.55rem',
      letterSpacing: '0.05em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.1s ease',
      whiteSpace: 'nowrap' as const,
      opacity: disabled ? 0.5 : 1,
      boxShadow: disabled ? 'none' : '3px 3px 0 #00e5ff',
    }
  }

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-terminal)',
    color: 'var(--sky)',
    fontSize: '1rem',
    letterSpacing: '0.08em',
    marginBottom: '1rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 1rem',
    background: 'var(--mid)',
    border: '1px solid var(--blue)',
    borderRadius: '4px',
    color: 'var(--white)',
    fontFamily: 'var(--font-terminal)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      {/* scanlines — defined in globals.css */}
      <div id="scanlines" />

      <main style={{ minHeight: '100vh', padding: '2rem 1rem' }}>

        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            SEMANTIC SEARCH
          </h1>
          <p style={{
            fontFamily: 'var(--font-terminal)',
            fontSize: '1.3rem',
            color: 'var(--sky)',
          }}>
            index documents · query semantically · discover meaning
          </p>
        </header>

        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>

          {/* 01 — Add Document */}
          <section className="widget">
            <p style={sectionLabel}>01 / ADD DOCUMENT</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                suppressHydrationWarning
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setAddSuccess(false) }}
                placeholder="document title . . ."
                style={inputStyle}
                onFocus={(e)  => (e.target.style.borderColor = 'var(--cyan)')}
                onBlur={(e)   => (e.target.style.borderColor = 'var(--blue)')}
              />
              <textarea
                suppressHydrationWarning
                value={content}
                onChange={(e) => { setContent(e.target.value); setAddSuccess(false) }}
                placeholder="document content . . ."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e)  => (e.target.style.borderColor = 'var(--cyan)')}
                onBlur={(e)   => (e.target.style.borderColor = 'var(--blue)')}
              />
            </div>

            <button
              onClick={handleAddDocument}
              disabled={adding || !title.trim() || !content.trim()}
              style={{
                ...btn(adding || !title.trim() || !content.trim()),
                marginTop: '1rem',
                minWidth: '12rem',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                if (adding || !title.trim() || !content.trim()) return
                e.currentTarget.style.transform = 'translate(-3px, -3px)'
                e.currentTarget.style.boxShadow = '5px 5px 0 #00e5ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '3px 3px 0 #00e5ff'
              }}
            >
              {adding ? 'ADDING...' : 'ADD DOCUMENT →'}
            </button>

            {addSuccess && (
              <p style={{
                marginTop: '1rem',
                color: 'var(--mint)',
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}>
                <span className="status-dot" />
                document uploaded successfully.
              </p>
            )}
          </section>

          {/* 02 — Search */}
          <section className="widget">
            <p style={sectionLabel}>02 / SEARCH</p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                suppressHydrationWarning
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="enter your search query . . ."
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e)  => (e.target.style.borderColor = 'var(--cyan)')}
                onBlur={(e)   => (e.target.style.borderColor = 'var(--blue)')}
              />
              <button
                onClick={handleSearch}
                disabled={searching || !query.trim()}
                style={{ ...btn(searching || !query.trim()), minWidth: '7rem', textAlign: 'center' }}
                onMouseEnter={(e) => {
                  if (searching || !query.trim()) return
                  e.currentTarget.style.transform = 'translate(-3px, -3px)'
                  e.currentTarget.style.boxShadow = '5px 5px 0 #00e5ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)'
                  e.currentTarget.style.boxShadow = '3px 3px 0 #00e5ff'
                }}
              >
                {searching ? 'SEARCHING...' : 'SEARCH →'}
              </button>
            </div>

            {/* Results */}
            {results !== null && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.length === 0 ? (
                  <p style={{
                    fontFamily: 'var(--font-terminal)',
                    color: 'var(--pink)',
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    padding: '1.5rem 0',
                    letterSpacing: '0.05em',
                  }}>
                    NO RESULTS FOUND
                  </p>
                ) : (
                  results.map((r) => {
                    const pct = Math.round(r.similarity * 100)
                    const barColor = pct >= 80 ? 'var(--mint)' : pct >= 50 ? 'var(--cyan)' : 'var(--sky)'
                    return (
                      <div key={r.id} style={{
                        background: 'var(--mid)',
                        border: '1px solid var(--blue)',
                        borderRadius: '6px',
                        padding: '1rem',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem',
                        }}>
                          <p style={{
                            fontFamily: 'var(--font-pixel)',
                            color: 'var(--cyan)',
                            fontSize: '0.6rem',
                            lineHeight: '1.6',
                          }}>
                            {r.title}
                          </p>
                          <span style={{
                            fontFamily: 'var(--font-terminal)',
                            color: barColor,
                            fontSize: '1.2rem',
                            marginLeft: '1rem',
                            whiteSpace: 'nowrap',
                          }}>
                            {pct}%
                          </span>
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          color: 'var(--white)',
                          fontSize: '0.9rem',
                          lineHeight: '1.6',
                          marginBottom: '0.75rem',
                          opacity: 0.8,
                        }}>
                          {r.content.slice(0, 150)}{r.content.length > 150 ? '...' : ''}
                        </p>
                        {/* Similarity bar */}
                        <div style={{
                          height: '4px',
                          background: 'var(--blue)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: barColor,
                            borderRadius: '2px',
                            transition: 'width 0.4s ease',
                            boxShadow: `0 0 6px ${barColor}`,
                          }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </section>

          {/* Error */}
          {error && (
            <div style={{
              padding: '1rem',
              border: '1px solid var(--pink)',
              borderRadius: '4px',
              background: 'rgba(255, 110, 180, 0.05)',
            }}>
              <p style={{
                color: 'var(--pink)',
                fontFamily: 'var(--font-terminal)',
                fontSize: '1rem',
              }}>
                {error}
              </p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
