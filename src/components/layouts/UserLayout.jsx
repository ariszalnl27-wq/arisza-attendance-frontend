import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { resolvePhotoUrl } from '../../lib/utils'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',  label: 'Beranda',    icon: HomeIcon },
  { to: '/attendance', label: 'Kehadiran',  icon: CalendarIcon },
  { to: '/points',     label: 'Poin Saya',  icon: StarIcon },
  { to: '/profile',    label: 'Profil',     icon: UserIcon },
]

export default function UserLayout({ children }) {
  const { user, refreshToken, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    try { await api.post('/auth/logout', { refresh_token: refreshToken }) } catch {}
    logout()
    navigate('/login')
    toast.success('Berhasil keluar.')
  }

  const photoUrl = resolvePhotoUrl(user?.photo_url)

  return (
    <div className="min-h-dvh flex">
      {open && (
        <div className="fixed inset-0 bg-ink/30 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-ink flex flex-col z-30
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
      `}>
        <div className="px-6 py-6 border-b border-white/10 flex-shrink-0">
          <p className="font-display text-parchment text-lg leading-tight">Arisza Library</p>
          <p className="text-stone-500 text-xs mt-0.5 font-mono">Attendance</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-100
                 ${isActive
                   ? 'bg-white/10 text-parchment font-medium'
                   : 'text-stone-400 hover:text-parchment hover:bg-white/5'}`
              }
              onClick={() => setOpen(false)}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-stone-700 flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/10">
              {photoUrl
                ? <img src={photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : <span className="text-parchment text-xs font-medium">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-parchment text-xs font-medium truncate">{user?.name}</p>
              <p className="text-stone-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            className="flex items-center gap-3 px-3 py-2 w-full rounded text-stone-400
                       hover:text-parchment hover:bg-white/5 text-sm transition-all"
            onClick={handleLogout}
          >
            <LogoutIcon className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-10">
          <button className="p-1.5 rounded hover:bg-stone-100" onClick={() => setOpen(true)}>
            <MenuIcon className="w-5 h-5 text-stone-600" />
          </button>
          <p className="font-display text-ink text-base">Perpustakaan</p>
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function HomeIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> }
function CalendarIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> }
function StarIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> }
function UserIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
function LogoutIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> }
function MenuIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> }
