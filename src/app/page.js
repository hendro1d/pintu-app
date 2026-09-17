'use client'

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchApps = async () => {
    try {
      const res = await fetch('/pintu/api/apps', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setApps(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pingApps = async () => {
    try {
      await fetch('/pintu/api/ping');
      fetchApps();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchApps();
    pingApps(); // Trigger background ping
    
    // Check auth status
    fetch('/pintu/api/auth/status')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(data.loggedIn);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
    
    // Setup interval to ping every 30 seconds
    const interval = setInterval(pingApps, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = [...new Set(apps.flatMap(a => (a.category || '').split(',').map(c => c.trim()).filter(Boolean)))];

  const filteredApps = apps.filter(app => {
    const matchSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                        app.description?.toLowerCase().includes(search.toLowerCase());
    const appCategories = (app.category || '').split(',').map(c => c.trim()).filter(Boolean);
    const matchCategory = category ? appCategories.includes(category) : true;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <header className="topbar">
        <h1 className="page-title">
          {isLoggedIn && <label htmlFor="sidebar-toggle" className="hamburger">☰</label>}
          <img src="/pintu/logo.jpg" alt="Logo PINTU" style={{width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover'}} /> 
          <span><span style={{ color: 'var(--primary-color)' }}>PINTU</span> (<span style={{ color: 'var(--primary-color)' }}>P</span>usat <span style={{ color: 'var(--primary-color)' }}>IN</span>tegrasi <span style={{ color: 'var(--primary-color)' }}>T</span>autan <span style={{ color: 'var(--primary-color)' }}>U</span>tama)</span>
        </h1>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{color: 'var(--text-muted)'}} className="hide-on-mobile">
            {new Date().toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
          </div>
          {authChecked && !isLoggedIn && (
            <a href="/pintu/login" className="btn-primary" style={{padding: '6px 16px', fontSize: 14, borderRadius: 6, display: 'inline-block', textDecoration: 'none'}}>Login</a>
          )}
          {authChecked && isLoggedIn && (
            <button onClick={() => {
              fetch('/pintu/api/auth/logout', {method:'POST'}).then(() => window.location.href = '/pintu/');
            }} className="btn-primary" style={{padding: '6px 16px', fontSize: 14, borderRadius: 6, background: 'var(--error-color)', cursor: 'pointer'}}>Logout</button>
          )}
        </div>
      </header>

      <div className="content-wrapper">
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="Cari Aplikasi..." 
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select 
            className="category-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Semua Aplikasi</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div>Memuat data aplikasi...</div>
        ) : (
          <div className="app-grid">
            {filteredApps.map(app => (
              <div className="app-card" key={app.id}>
                <div className="app-card-header">
                  <div className="app-logo">
                    {app.logo_url ? <img src={`/pintu${app.logo_url}`} alt="Logo" style={{width:'100%', height:'100%', objectFit:'contain'}}/> : app.name.charAt(0)}
                  </div>
                  <div className="app-title-group">
                    <h3>{app.name}</h3>
                    <p>{app.description}</p>
                  </div>
                </div>
                
                <a href={app.url} target="_blank" rel="noopener noreferrer" className="app-url">
                  {app.url}
                </a>

                <div className={`status-indicator ${app.status === 'ONLINE' ? 'status-online' : 'status-offline'}`}>
                  <div className="status-text">
                    <div>
                      <span className="status-dot"></span>
                      <strong style={{color: app.status === 'ONLINE' ? 'var(--success-color)' : 'var(--error-color)'}}>
                        {app.status}
                      </strong>
                    </div>
                    <span>{app.status === 'ONLINE' ? 'Aktif' : 'Tidak Aktif'}</span>
                  </div>
                  <div className="latency">{app.latency > 0 ? `${app.latency}ms` : '-'}</div>
                </div>

                <div className="card-actions">
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{display: 'inline-block'}}>
                    BUKA
                  </a>
                  <button className="btn-secondary" onClick={() => setSelectedApp(app)}>
                    DETAIL
                  </button>
                </div>
              </div>
            ))}
            
            {filteredApps.length === 0 && (
              <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)'}}>
                Aplikasi tidak ditemukan.
              </div>
            )}
          </div>
        )}

        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 600}}>
              <div className="modal-header">
                <h3>Detail Aplikasi: {selectedApp.name}</h3>
                <button className="close-btn" onClick={() => setSelectedApp(null)}>×</button>
              </div>
              <div className="modal-body">
                {selectedApp.screenshot_url ? (
                  <img src={`/pintu${selectedApp.screenshot_url}`} alt="Screenshot" style={{width: '100%', maxHeight: '250px', objectFit: 'cover', objectPosition: 'top', borderRadius: 8, marginBottom: 15, backgroundColor: '#f9fafb'}} />
                ) : (
                  <div style={{padding: 40, textAlign: 'center', background: '#f9fafb', borderRadius: 8, marginBottom: 15, color: '#6b7280'}}>
                    Belum ada screenshot yang diunggah.
                  </div>
                )}
                <p><strong>Deskripsi:</strong> {selectedApp.description || '-'}</p>
                <p><strong>URL:</strong> <a href={selectedApp.url} target="_blank" rel="noopener noreferrer">{selectedApp.url}</a></p>
                <p><strong>Kategori:</strong> {selectedApp.category || '-'}</p>
              </div>
              <div className="modal-footer">
                <a href={selectedApp.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{display: 'inline-block'}}>
                  BUKA APLIKASI
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
