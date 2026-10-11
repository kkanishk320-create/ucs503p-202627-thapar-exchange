import './App.css'

function App() {
  const appName = import.meta.env.VITE_APP_TITLE || 'ThaparRent'

  return (
    <main className="page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="ThaparRent home">
          <span className="brand-mark">T</span>
          <span>{appName}</span>
        </a>
        <span className="campus-label">Made for TIET students</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">Your campus. Shared smarter.</p>
        <h1>Find what you need, right here on campus.</h1>
        <p className="intro">
          ThaparRent is a student-to-student marketplace for renting useful
          things around TIET.
        </p>
        <p className="coming-soon">The marketplace is getting ready.</p>
      </section>

      <footer className="site-footer">
        <span>{appName}</span>
        <span>Built for the TIET community</span>
      </footer>
    </main>
  )
}

export default App
