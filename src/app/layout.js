import './globals.css'
import Link from 'next/link'

import { cookies } from 'next/headers';

export const metadata = {
  title: 'PINTU - Pusat Integrasi Tautan Utama',
  description: 'Pusat Integrasi Tautan Utama',
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('auth_session');

  return (
    <html lang="id">
      <body>
        <input type="checkbox" id="sidebar-toggle" className="sidebar-toggle-checkbox" style={{display: 'none'}} />
        <div className="app-container">
          {isLoggedIn && (
            <>
              <label htmlFor="sidebar-toggle" className="sidebar-overlay"></label>
              <aside className="sidebar">
                <div className="sidebar-header">
                  <div className="avatar">
                    <img src="/pintu/logo.jpg" alt="PINTU" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                  <div>
                    <div style={{fontWeight: 600, color: 'var(--text-color)'}}>Administrator</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--success-color)'}}>online</div>
                  </div>
                </div>
                
                <nav className="sidebar-nav">
                  <Link href="/" className="nav-item">
                    <span>🏠</span> Dashboard
                  </Link>
                  <Link href="/admin" className="nav-item">
                    <span>⚙️</span> Pengaturan
                  </Link>
                  <Link href="/admin/profile" className="nav-item">
                    <span>👥</span> Profil
                  </Link>
                  <div className="nav-item">
                    <span>🔔</span> Notifikasi
                  </div>
                </nav>
              </aside>
            </>
          )}
          
          <main className={`main-content ${!isLoggedIn ? 'full-width' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
