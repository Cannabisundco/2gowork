import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'

type Place = { name: string; type: string; area: string; distance: string; accent: string; initials: string; features: string[]; rating: string }

const places: Place[] = [
  { name: 'The Social Hub', type: 'Hotel Lobby', area: 'Alexanderplatz, Berlin', distance: '0,8 km', accent: 'coral', initials: 'TS', features: ['Steckdosen', 'Sitzplätze', 'Bistro'], rating: '4,8' },
  { name: 'Café Neun', type: 'Café', area: 'Kreuzberg, Berlin', distance: '1,4 km', accent: 'mint', initials: 'C9', features: ['Steckdosen', 'WLAN-Passwort', 'Sitzplätze'], rating: '4,6' },
  { name: 'Bibliothek am Luisenbad', type: 'Bibliothek', area: 'Wedding, Berlin', distance: '2,1 km', accent: 'blue', initials: 'BL', features: ['Steckdosen', 'Offenes WLAN', 'Sitzplätze'], rating: '4,7' },
  { name: 'Hotel am Park', type: 'Hotel Lobby', area: 'Tiergarten, Berlin', distance: '2,7 km', accent: 'yellow', initials: 'HP', features: ['Steckdosen', 'Sitzplätze'], rating: '4,4' },
]

function App() {
  const [view, setView] = useState<'map' | 'list'>('map')
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Alle Orte')
  const [showForm, setShowForm] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authMessage, setAuthMessage] = useState('')
  const [placesData, setPlacesData] = useState(places)
  const [selectedPlace, setSelectedPlace] = useState<Place>(places[0])
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? null))
    supabase.from('places').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data?.length) setPlacesData(data.map((place) => ({ name: place.name, type: place.type, area: place.area, distance: 'Neu', accent: 'mint', initials: place.name.slice(0, 2).toUpperCase(), features: [place.outlets !== 'Nein' ? 'Steckdosen' : '', place.wifi !== 'Kein WLAN' ? place.wifi : '', place.seating ? 'Sitzplätze' : '', place.food ? 'Bistro' : ''].filter(Boolean), rating: String(place.rating || 'Neu') })))
    })
    return () => listener.subscription.unsubscribe()
  }, [])
  const filteredPlaces = useMemo(() => placesData.filter((place) => `${place.name} ${place.type} ${place.area}`.toLowerCase().includes(query.toLowerCase()) && (activeFilter === 'Alle Orte' || place.features.includes(activeFilter))), [activeFilter, placesData, query])

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) { setAuthMessage('Bitte zuerst die Supabase-Variablen in .env eintragen.'); return }
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    const result = authMode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password })
    setAuthMessage(result.error?.message ?? (authMode === 'signup' ? 'Registrierung erfolgreich. Bitte E-Mail bestätigen.' : 'Angemeldet.'))
    if (!result.error && authMode === 'login') setTimeout(() => setShowAuth(false), 700)
  }

  async function handleReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !userEmail) return
    const form = new FormData(event.currentTarget)
    const { data: sessionData } = await supabase.auth.getSession()
    const { error } = await supabase.from('places').insert({ name: form.get('name'), area: form.get('area'), type: form.get('type'), wifi: form.get('wifi'), wifi_password: form.get('wifi_password') || null, outlets: form.get('outlets'), seating: form.get('seating') === 'on', food: form.get('food') === 'on', created_by: sessionData.session?.user.id })
    if (!error) { setShowForm(false); setAuthMessage('Ort erfolgreich eingereicht.') }
  }

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span>2go</span>work</a><nav><a className="nav-active" href="#explore">Orte entdecken</a><a href="#how-it-works">So funktioniert's</a></nav><div className="account-actions">{userEmail ? <button className="text-button" type="button" onClick={() => supabase?.auth.signOut()}>Abmelden</button> : <button className="text-button" type="button" onClick={() => { setAuthMode('login'); setShowAuth(true) }}>Anmelden</button>}<button className="dark-button" type="button" onClick={() => userEmail ? setShowForm(true) : (setAuthMode('login'), setShowAuth(true))}>Ort melden <span>+</span></button></div></header>
    <section className="intro" id="top"><div><p className="eyebrow">DEIN ARBEITSPLATZ, ÜBERALL</p><h1>Arbeite, wo du<br /><em>willkommen</em> bist.</h1></div><p className="intro-copy">Finde Orte mit kostenlosem WLAN,<br />Steckdosen und Raum zum Bleiben.</p></section>
    <section className="explorer" id="explore"><div className="search-row"><div className="search-box"><span className="search-icon">⌕</span><input aria-label="Ort suchen" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Stadt, Stadtteil oder Ort suchen ..." /><kbd>⌘ K</kbd></div><button className="location-button" type="button">⌖ <span>Meinen Standort</span></button></div><div className="filter-row"><div className="filters">{['Alle Orte', 'Steckdosen', 'WLAN', 'Sitzplätze', 'Bistro'].map((filter) => <button className={activeFilter === filter ? 'filter active' : 'filter'} key={filter} type="button" onClick={() => setActiveFilter(filter)}>{filter === 'Alle Orte' ? '✦' : filter === 'Steckdosen' ? '▣' : filter === 'WLAN' ? '⌁' : filter === 'Sitzplätze' ? '◫' : '♧'} {filter}</button>)}</div><div className="view-switch"><button className={view === 'map' ? 'view-button active' : 'view-button'} onClick={() => setView('map')} type="button">⊙ Karte</button><button className={view === 'list' ? 'view-button active' : 'view-button'} onClick={() => setView('list')} type="button">☷ Liste</button></div></div>
      <div className={view === 'map' ? 'results map-layout' : 'results list-layout'}><div className="place-list"><div className="results-heading"><div><p className="eyebrow">BERLIN · JETZT</p><h2>{filteredPlaces.length} Orte in deiner Nähe</h2></div><span className="sort">Sortiert nach Entfernung <b>⌄</b></span></div>{filteredPlaces.map((place) => <button className={selectedPlace.name === place.name ? 'place-card selected' : 'place-card'} key={place.name} onClick={() => setSelectedPlace(place)} type="button"><span className={`place-avatar ${place.accent}`}>{place.initials}</span><span className="place-info"><strong>{place.name}</strong><small>{place.type} · {place.area}</small><span className="chips">{place.features.map((feature) => <i key={feature}>{feature}</i>)}</span></span><span className="place-meta"><b>★ {place.rating}</b><small>{place.distance}</small></span></button>)}</div><div className="map-panel"><div className="map-toolbar"><span>Berlin, Deutschland</span><button type="button">＋</button><button type="button">−</button></div><div className="map-art"><div className="map-label label-one">Prenzlauer Berg</div><div className="map-label label-two">Mitte</div><div className="map-label label-three">Kreuzberg</div><div className="river"></div>{filteredPlaces.map((place, index) => <button aria-label={place.name} className={`map-pin pin-${index} ${selectedPlace.name === place.name ? 'pin-selected' : ''}`} key={place.name} onClick={() => setSelectedPlace(place)} type="button"><span>⌂</span></button>)}<div className="you-are-here"><span></span>Du bist hier</div></div><div className="map-caption"><span className={`mini-avatar ${selectedPlace.accent}`}>{selectedPlace.initials}</span><div><strong>{selectedPlace.name}</strong><small>{selectedPlace.type} · {selectedPlace.distance}</small></div><button type="button" aria-label="Ort öffnen">→</button></div></div></div>
    </section>
    <section className="callout" id="how-it-works"><div className="callout-mark">✦</div><div><p className="eyebrow">KENNST DU EINEN GUTEN ORT?</p><h2>Mach ihn für andere<br /><em>auffindbar.</em></h2></div><p>Teile deinen Lieblingsort mit der Community.<br />Ein paar Details genügen.</p><button className="outline-button" type="button" onClick={() => userEmail ? setShowForm(true) : (setAuthMode('login'), setShowAuth(true))}>Ort melden <span>↗</span></button></section>
    {showAuth && <div className="modal-backdrop" role="presentation" onClick={() => setShowAuth(false)}><form className="report-form" onSubmit={handleAuth} onClick={(event) => event.stopPropagation()}><button className="close-button" type="button" onClick={() => setShowAuth(false)} aria-label="Dialog schließen">×</button><p className="eyebrow">2GOWORK ACCOUNT</p><h2>{authMode === 'login' ? 'Willkommen zurück' : 'Account erstellen'}</h2><p className="form-lead">{isSupabaseConfigured ? 'Melde dich an, um Orte mit der Community zu teilen.' : 'Die Verbindung zu Supabase ist noch nicht konfiguriert.'}</p><label>E-Mail<input name="email" required type="email" placeholder="du@beispiel.de" /></label><label>Passwort<input name="password" required minLength={6} type="password" placeholder="Mindestens 6 Zeichen" /></label>{authMessage && <p className="login-note">{authMessage}</p>}<button className="dark-button form-submit" type="submit">{authMode === 'login' ? 'Anmelden' : 'Registrieren'} <span>→</span></button><button className="switch-auth" type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthMessage('') }}>{authMode === 'login' ? 'Noch keinen Account? Registrieren' : 'Bereits registriert? Anmelden'}</button></form></div>}
    {showForm && <div className="modal-backdrop" role="presentation" onClick={() => setShowForm(false)}><form className="report-form" onSubmit={handleReport} onClick={(event) => event.stopPropagation()}><button className="close-button" type="button" onClick={() => setShowForm(false)} aria-label="Dialog schließen">×</button><p className="eyebrow">FÜR DIE COMMUNITY</p><h2>Ort melden</h2><p className="form-lead">Teile einen Ort, an dem andere gut arbeiten können.</p><label>Ort<input name="name" required placeholder="z. B. Hotel am Park" /></label><label>Adresse oder Stadtteil<input name="area" required placeholder="z. B. Tiergarten, Berlin" /></label><div className="form-grid"><label>Ortstyp<select name="type"><option>Hotel Lobby</option><option>Café</option><option>Bibliothek</option><option>Co-Working</option></select></label><label>WLAN<select name="wifi"><option>Offenes WLAN</option><option>Passwort erforderlich</option><option>Kein WLAN</option></select></label></div><label>WLAN-Passwort (optional)<input name="wifi_password" type="text" placeholder="Nur falls erforderlich" /></label><label>Steckdosen<select name="outlets"><option>Ja, mehrere</option><option>Ja, wenige</option><option>Nein</option></select></label><label>Was gibt es vor Ort?<div className="check-grid"><span><input name="seating" type="checkbox" defaultChecked /> Sitzgelegenheiten</span><span><input name="food" type="checkbox" /> Bistro / Café</span></div></label><button className="dark-button form-submit" type="submit">Ort einreichen <span>→</span></button><p className="login-note">Eingereicht als {userEmail}</p></form></div>}
  </main>
}

export default App
