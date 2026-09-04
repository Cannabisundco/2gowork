import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase, supabaseConfigured } from './lib/supabaseClient'
import './App.css'

type AuthMode = 'login' | 'signup'

function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null))
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? null))
    return () => authListener.subscription.unsubscribe()
  }, [])

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('')
    if (!supabase) { setMessage('Backend noch nicht verbunden. Trage zuerst die Supabase-Werte in .env ein.'); setBusy(false); return }
    const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    setMessage(result.error?.message ?? (mode === 'signup' ? 'Account erstellt. Prüfe deine E-Mail zur Bestätigung.' : 'Du bist erfolgreich eingeloggt.')); setBusy(false)
  }

  async function logout() { await supabase?.auth.signOut(); setMessage('Du bist abgemeldet.') }

  return <main className="page-shell">
    <header className="site-header"><a className="logo-lockup" href="/" aria-label="free2be Startseite"><img src="/free2be-logo.svg" alt="free2be" /></a><div className="header-status"><span className="status-dot" /> <span>{userEmail ? 'Account aktiv' : 'Private beta'}</span></div></header>
    <section className="hero-grid"><div className="hero-copy"><p className="kicker">EIN ORT FÜR DICH</p><h1>Du darfst<br /><span>du selbst</span> sein.</h1><p className="hero-text">Ein ruhiger, sicherer Raum für deine nächsten Schritte. Einfach anmelden und loslegen.</p><div className="accent-line" /></div><div className="auth-card">{userEmail ? <div className="logged-in"><p className="kicker">WILLKOMMEN ZURÜCK</p><div className="avatar">{userEmail.slice(0, 1).toUpperCase()}</div><h2>Schön, dass du da bist.</h2><p>Du bist als <strong>{userEmail}</strong> eingeloggt.</p><button className="primary-button" type="button" onClick={logout}>Abmelden <span>↗</span></button></div> : <><div className="auth-heading"><div className="mode-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage('') }} type="button">Einloggen</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setMessage('') }} type="button">Registrieren</button></div><h2>{mode === 'login' ? 'Willkommen zurück.' : 'Schön, dass du da bist.'}</h2><p>{mode === 'login' ? 'Logge dich ein, um weiterzumachen.' : 'Erstelle deinen kostenlosen Account.'}</p></div><form onSubmit={submitAuth}>{mode === 'signup' && <label>Dein Name<input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Wie dürfen wir dich nennen?" /></label>}<label>E-Mail-Adresse<input autoComplete="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="du@beispiel.de" /></label><label>Passwort<input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mindestens 8 Zeichen" /></label>{mode === 'login' && <button className="forgot-button" type="button">Passwort vergessen?</button>}{message && <p className="form-message" role="status">{message}</p>}<button className="primary-button" disabled={busy} type="submit">{busy ? 'Einen Moment ...' : mode === 'login' ? 'Einloggen' : 'Account erstellen'} <span>↗</span></button></form><p className="security-note"><span>◈</span> Deine Daten bleiben privat und sicher.</p></>}</div></section>
    <footer className="site-footer"><span>free2be / 2026</span><span className="footer-note">{supabaseConfigured ? 'Sicher verbunden' : 'Lokaler Vorschaumodus'} <i /></span></footer>
  </main>
}

export default App
