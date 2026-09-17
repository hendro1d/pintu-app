'use client'

import { useState, useEffect, useRef } from 'react';

export default function AdminPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [debugMsg, setDebugMsg] = useState('Init (Not hydrated if this stays)');
  
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [modalCategories, setModalCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const formRef = useRef(null);

  const fetchApps = async () => {
    setDebugMsg('fetchApps started');
    try {
      const res = await fetch('/pintu/api/apps', { cache: 'no-store' });
      setDebugMsg('fetch returned ' + res.status);
      if (!res.ok) throw new Error('Status ' + res.status);
      const data = await res.json();
      if (data.success) {
        setApps(data.data);
      } else {
        setErrorMsg('Data not success');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e.toString());
    } finally {
      setLoading(false);
      setDebugMsg(prev => prev + ' | finally reached');
    }
  };

  useEffect(() => {
    setDebugMsg('Mounted! Calling fetchApps...');
    fetchApps().then(() => {
      // Background ping
      fetch('/pintu/api/ping').then(res => {
        if(res.ok) fetchApps(); // refresh status
      }).catch(() => {});
    });
  }, []);

  const handleDragStart = (appId) => {
    setDraggedIdx(apps.findIndex(a => a.id === appId));
  };

  const handleDragEnter = (appId) => {
    const index = apps.findIndex(a => a.id === appId);
    if (draggedIdx === null || draggedIdx === index || index === -1) return;
    const newApps = [...apps];
    const draggedItem = newApps[draggedIdx];
    newApps.splice(draggedIdx, 1);
    newApps.splice(index, 0, draggedItem);
    setDraggedIdx(index);
    setApps(newApps);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    const reorderData = apps.map((app, index) => ({ id: app.id, order_index: index }));
    try {
      await fetch('/pintu/api/apps/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderData)
      });
    } catch (e) {
      console.error('Failed to save new order:', e);
    }
  };

  const handleOpenModal = (app = null) => {
    setEditingId(app ? app.id : null);
    setModalCategories(app && app.category ? app.category.split(',').map(c => c.trim()).filter(Boolean) : []);
    setCategoryInput('');
    setShowModal(true);
    
    // Fill form if editing
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.reset();
        if (app) {
          formRef.current.name.value = app.name || '';
          formRef.current.description.value = app.description || '';
          formRef.current.url.value = app.url || '';
        }
      }
    }, 0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const endpoint = editingId ? `/pintu/api/apps/${editingId}` : '/pintu/api/apps';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        body: formData,
      });
      
      if (res.ok) {
        handleCloseModal();
        fetchApps();
      } else {
        alert('Gagal menyimpan data.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aplikasi ini?')) return;
    try {
      const res = await fetch(`/pintu/api/apps/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchApps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [...new Set(apps.flatMap(a => (a.category || '').split(',').map(c => c.trim()).filter(Boolean)))];

  const filteredApps = apps.filter(app => {
    if (!filterCategory) return true;
    const appCategories = (app.category || '').split(',').map(c => c.trim()).filter(Boolean);
    return appCategories.includes(filterCategory);
  });

  const paginatedApps = pageSize === 'all' ? filteredApps : filteredApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredApps.length / pageSize);

  return (
    <>
      <header className="topbar">
        <h1 className="page-title">
          <label htmlFor="sidebar-toggle" className="hamburger">☰</label>
          ⚙️ Pengaturan Aplikasi
        </h1>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <button onClick={() => {
            fetch('/pintu/api/auth/logout', {method:'POST'}).then(() => window.location.href = '/pintu/');
          }} className="btn-primary" style={{padding: '6px 16px', fontSize: 14, borderRadius: 6, background: 'var(--error-color)', cursor: 'pointer'}}>Logout</button>
        </div>
      </header>

      <div className="content-wrapper">
        <div className="admin-header">
          <h2>Daftar Aplikasi</h2>
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{flex: 'none', padding: '10px 20px'}}>
            + Tambah Aplikasi
          </button>
        </div>
        
        <div style={{background: '#fff3cd', padding: 10, marginBottom: 20}}>
          <strong>Debug State:</strong> {debugMsg}
          {errorMsg && <div style={{color: 'red'}}><strong>Error:</strong> {errorMsg}</div>}
        </div>

        {loading ? (
          <div>Memuat data...</div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <select 
                  value={filterCategory} 
                  onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <select 
                  value={pageSize} 
                  onChange={e => { setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); }}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                >
                  <option value={10}>10 Baris</option>
                  <option value={25}>25 Baris</option>
                  <option value={100}>100 Baris</option>
                  <option value="all">Semua Data</option>
                </select>
              </div>

              {pageSize !== 'all' && totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: currentPage === 1 ? '#f3f4f6' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Sebelumnya
                  </button>
                  <span style={{ padding: '0 8px', fontSize: '14px' }}>Halaman {currentPage} dari {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', background: currentPage === totalPages ? '#f3f4f6' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>URL</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map((app) => (
                  <tr 
                    key={app.id}
                    draggable
                    onDragStart={() => handleDragStart(app.id)}
                    onDragEnter={() => handleDragEnter(app.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ 
                      cursor: 'grab', 
                      opacity: draggedIdx === apps.findIndex(a => a.id === app.id) ? 0.5 : 1,
                      backgroundColor: draggedIdx === apps.findIndex(a => a.id === app.id) ? '#f3f4f6' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td>
                      <span style={{marginRight: 8, color: '#9ca3af', cursor: 'grab'}}>↕</span>
                      {app.id}
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        {app.logo_url && <img src={`/pintu${app.logo_url}`} width={24} height={24} style={{objectFit:'contain', borderRadius: 4}} />}
                        {app.name}
                      </div>
                    </td>
                    <td>{app.url}</td>
                    <td>{app.category}</td>
                    <td>
                      <span style={{color: app.status === 'ONLINE' ? 'var(--success-color)' : 'var(--error-color)', fontWeight: 'bold'}}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: 8}}>
                        <button className="btn-secondary" onClick={() => handleOpenModal(app)}>Edit</button>
                        <button className="btn-danger" onClick={() => handleDelete(app.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedApps.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: 20}}>Belum ada data aplikasi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onMouseDown={handleCloseModal}>
            <div className="modal-content" style={{ position: 'relative', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }} onMouseDown={(e) => e.stopPropagation()}>
              <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>{editingId ? 'Edit Aplikasi' : 'Tambah Aplikasi Baru'}</h2>
                <button 
                  onClick={handleCloseModal} 
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}
                  title="Tutup"
                >
                  ✖
                </button>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                  <div className="form-group">
                    <label>Nama Aplikasi</label>
                    <input type="text" name="name" required />
                  </div>
                  <div className="form-group">
                    <label>URL / Tautan</label>
                    <input type="url" name="url" placeholder="https://..." required />
                  </div>
                  <div className="form-group">
                    <label>Kategori</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: modalCategories.length > 0 ? '8px' : '0' }}>
                      {modalCategories.map((cat, idx) => (
                        <span key={idx} style={{ background: 'var(--primary-color)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {cat}
                          <button type="button" onClick={() => setModalCategories(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
                            ✖
                          </button>
                        </span>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ketik kategori lalu tekan Enter atau Koma" 
                      value={categoryInput}
                      onChange={e => setCategoryInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = categoryInput.trim().replace(/,/g, '');
                          if (val && !modalCategories.includes(val)) {
                            setModalCategories(prev => [...prev, val]);
                          }
                          setCategoryInput('');
                        }
                      }}
                    />
                    <input type="hidden" name="category" value={modalCategories.join(', ')} />
                  </div>
                  <div className="form-group">
                    <label>Deskripsi Singkat</label>
                    <textarea name="description" rows="3"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Logo Aplikasi (Gambar)</label>
                    {editingId && apps.find(a => a.id === editingId)?.logo_url && (
                      <div style={{marginBottom: 8, fontSize: '0.85rem'}}>
                        File saat ini: <span onClick={() => setPreviewImage(`/pintu${apps.find(a => a.id === editingId).logo_url}`)} style={{color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline'}}>{apps.find(a => a.id === editingId).logo_url.split('-').pop()}</span>
                      </div>
                    )}
                    <input type="file" name="logo" accept="image/*" />
                  </div>
                  <div className="form-group">
                    <label>Screenshot Aplikasi (Gambar)</label>
                    {editingId && apps.find(a => a.id === editingId)?.screenshot_url && (
                      <div style={{marginBottom: 8, fontSize: '0.85rem'}}>
                        File saat ini: <span onClick={() => setPreviewImage(`/pintu${apps.find(a => a.id === editingId).screenshot_url}`)} style={{color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline'}}>{apps.find(a => a.id === editingId).screenshot_url.split('-').pop()}</span>
                      </div>
                    )}
                    <input type="file" name="screenshot" accept="image/*" />
                  </div>
                </div>
                
                <div className="form-actions" style={{ padding: '16px 24px', margin: 0, borderTop: '1px solid var(--border-color)', backgroundColor: '#f9fafb', borderRadius: '0 0 12px 12px' }}>
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>Batal</button>
                  <button type="submit" className="btn-primary">Simpan Data</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {previewImage && (
          <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setPreviewImage(null)}>
            <div className="modal-content" style={{ maxWidth: '80%', padding: '10px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button onClick={() => setPreviewImage(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
              </div>
              <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
