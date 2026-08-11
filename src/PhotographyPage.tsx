import { useState } from 'react'
import { Link } from 'react-router-dom'

import { photography } from './data/content'
import { person } from './data/content'
import { FadeIn } from './components/Reveal'
import DarkroomDevelop from './components/DarkroomDevelop'

function PhotoCard({ photo, index, onSelect }: {
  photo: typeof photography.photos[number]
  index: number
  onSelect: () => void
}) {
  return (
    <article
      className="photo-card panel"
      style={{ '--hue': photo.hue } as React.CSSProperties}
      onClick={onSelect}
      data-cursor="Open"
    >
      <div className="photo-card__frame">
        {photo.src ? (
          <img src={photo.src} alt={photo.caption} loading="lazy" />
        ) : (
          <div className="photo-card__placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Add your photo</span>
          </div>
        )}
      </div>
      <div className="photo-card__meta">
        <span className="photo-card__caption">{photo.caption}</span>
        <div className="photo-card__sub">
          {photo.location && <span>{photo.location}</span>}
          {photo.location && photo.date && <span>·</span>}
          <span>{photo.date}</span>
        </div>
      </div>
    </article>
  )
}

export default function PhotographyPage() {
  const [viewer, setViewer] = useState<{ src: string; caption: string } | null>(null)

  return (
    <main className="content">
      <section className="section shell" id="photography-page">
        <header className="section__head">
          <div>
            <span className="eyebrow">{photography.eyebrow}</span>
            <h2 className="section__title">{photography.title}</h2>
          </div>
        </header>

        <FadeIn>
          <p className="photography__body">{photography.body}</p>
        </FadeIn>

        <FadeIn className="photography__grid" stagger={0.1} y={48}>
          {photography.photos.map((photo, i) => (
            <PhotoCard
              key={i}
              photo={photo}
              index={i}
              onSelect={() => photo.src && setViewer({ src: photo.src, caption: photo.caption })}
            />
          ))}
        </FadeIn>
      </section>

      <footer className="footer">
        <Link to="/" data-cursor="Back to portfolio" className="footer__back">
          <span>← Back to portfolio</span>
        </Link>
        <span>© {new Date().getFullYear()} {person.name}</span>
      </footer>

      {viewer && (
        <DarkroomDevelop
          src={viewer.src}
          caption={viewer.caption}
          onClose={() => setViewer(null)}
        />
      )}
    </main>
  )
}