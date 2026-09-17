'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Konfirmasi password baru tidak cocok.', type: 'error' });
      return;
    }

    if (newPassword.length < 5) {
      setMessage({ text: 'Password baru harus minimal 5 karakter.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/pintu/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage({ text: 'Password berhasil diubah!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ text: data.message || 'Gagal mengubah password', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Terjadi kesalahan jaringan', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="topbar">
        <h1 className="page-title">
          <label htmlFor="sidebar-toggle" className="hamburger">☰</label>
          👥 Profil Administrator
        </h1>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <button onClick={() => {
            fetch('/pintu/api/auth/logout', {method:'POST'}).then(() => window.location.href = '/pintu/');
          }} className="btn-primary" style={{padding: '6px 16px', fontSize: 14, borderRadius: 6, background: 'var(--error-color)', cursor: 'pointer'}}>Logout</button>
        </div>
      </header>

      <div className="content-wrapper">
        <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--text-color)' }}>Ubah Password</h2>
          
          {message.text && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: message.type === 'error' ? '#b91c1c' : '#15803d',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-color)' }}>Password Saat Ini</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-color)' }}>Password Baru</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-color)' }}>Konfirmasi Password Baru</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              {loading ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
