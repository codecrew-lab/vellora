"use client";

import { useState } from "react";

const collections = [
  { number: "01", name: "Fantasy", note: "Worlds beyond imagination" },
  { number: "02", name: "Mystery", note: "Secrets waiting to unfold" },
  { number: "03", name: "Adventure", note: "Journeys worth taking" },
  { number: "04", name: "Romance", note: "Stories of the heart" },
];

export default function HomePage() {
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <main>
      <section className="library" aria-label="VELLORA library">
        <header className="site-header">
          <a className="nav-brand" href="#home" aria-label="VELLORA home">
            VELLORA<span className="brand-mark">.</span>
          </a>

          <nav className="desktop-nav" aria-label="Main navigation">
            <a className="active" href="#library">Library</a>
            <a href="#collections">Genres</a>
            <a href="#about">About</a>
          </nav>

          <a className="header-action" href="#collections">
            Explore stories <span aria-hidden="true">↗</span>
          </a>
        </header>

        <div className="library-content" id="home">
          <p className="eyebrow"><span /> THE VELLORA COLLECTION</p>
          <h1>A world of stories<br /><em>awaits.</em></h1>
          <p className="library-intro">
            Discover beautiful stories, explore imaginative worlds, and
            experience timeless storytelling through a carefully curated
            digital library.
          </p>

          <a className="text-link" href="#collections">
            Explore the library <span aria-hidden="true">⟶</span>
          </a>

          <div className="collection-heading" id="library">
            <div>
              <p className="eyebrow">A PLACE FOR EVERY STORY</p>
              <h2>Explore the collections</h2>
            </div>
            <span className="collection-count">04 COLLECTIONS</span>
          </div>

          <div className="collection-grid" id="collections">
            {collections.map((collection) => (
              <a className="collection-card" href="#about" key={collection.number}>
                <span className="collection-number">{collection.number}</span>
                <span className="collection-name">{collection.name}</span>
                <span className="collection-note">{collection.note}</span>
                <span className="collection-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>

        <footer className="site-footer" id="about">
          <span>VELLORA — A beautiful world where stories come to life.</span>
          <span>EST. 2026</span>
        </footer>
      </section>

      <section
        className={`manuscript-cover ${hasOpened ? "is-opening" : ""}`}
        aria-label="VELLORA manuscript introduction"
        aria-hidden={hasOpened}
      >
        <div className="manuscript-half manuscript-left">
          <div className="manuscript-ornament">
            <span className="ornament-line" />
            <span className="ornament-diamond">✦</span>
            <span className="ornament-line" />
          </div>
          <div className="cover-copy">
            <p className="cover-kicker">A LIBRARY OF WORLDS</p>
            <h1 className="brand-title">VELLORA</h1>
            <p className="cover-tagline">A beautiful world where stories come to life.</p>
            <button
              className="open-button"
              onClick={() => setHasOpened(true)}
              type="button"
              tabIndex={hasOpened ? -1 : 0}
            >
              <span>Open the world</span><span aria-hidden="true">⟶</span>
            </button>
          </div>
          <span className="cover-corner corner-top-left" />
          <span className="cover-corner corner-bottom-left" />
        </div>

        <div className="manuscript-half manuscript-right" aria-hidden="true">
          <div className="right-inscription">
            <span className="inscription-symbol">❧</span>
            <span>LET EVERY PAGE<br />LEAD SOMEWHERE</span>
            <span className="inscription-symbol">❧</span>
          </div>
          <span className="cover-corner corner-top-right" />
          <span className="cover-corner corner-bottom-right" />
        </div>

        <div className="cover-seam" />
        <p className="cover-footnote">A WORLD OF STORIES · EST. 2026</p>
      </section>
    </main>
  );
}
