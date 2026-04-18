import Script from "next/script";

export default function PodcastPage() {
  return (
    <>
      <canvas className="stars" id="starsCanvas"></canvas>

      <header className="header" id="header">
        <a href="/" className="header__brand" aria-label="Home">
          <span className="header__dot"></span>
          <span className="header__title" id="brandTitle">
            Dashboard
          </span>
        </a>

        <div className="header__episode" id="headerEpisode">
          <span className="header__ep-badge" id="epBadge">
            EP 01
          </span>
          <span className="header__ep-title" id="epTitle">
            Loading...
          </span>
          <span className="header__ep-date" id="epDate"></span>
        </div>

        <div className="header__right">
          <nav className="page-nav" id="pageNav" aria-label="Dashboard pages"></nav>
          <div className="social-bar" id="socialBar"></div>
        </div>
      </header>

      <div className="ticker-bar" id="tickerBar"></div>

      <main className="dashboard" id="dashboard"></main>

      <footer className="footer-bar">
        <span className="footer-bar__left" id="footerStatus">
          LIVE
        </span>
        <span className="footer-bar__right">
          <span>
            <kbd>1</kbd>
            <kbd>2</kbd>
            <kbd>3</kbd> pages
          </span>
          <span>
            <kbd>←</kbd>
            <kbd>→</kbd> nav
          </span>
        </span>
      </footer>

      <Script src="/podcast/bundle.min.js" strategy="beforeInteractive" />
    </>
  );
}
