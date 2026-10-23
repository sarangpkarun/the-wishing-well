import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pick } from '../lib/random'

const JOKES = [
  { title: '404: Wish not found', body: 'We looked everywhere. Even under the pigeon.' },
  { title: '404: Page denied', body: 'This page was not granted. Have you tried manifesting it?' },
  { title: '404: Page lost', body: 'Kevin was supposed to deliver this page. Kevin is lost.' },
  { title: '404: Fell down the well', body: 'We are not sending a rope. Nothing here is real, including the rope.' },
  { title: '404: Out for delivery', body: 'Your page is out for delivery. It is lost. It was always going to be lost.' },
  { title: '404: Billionaire unavailable', body: 'Definitely Not Ambani has taken this page offshore.' },
]

export function NotFoundPage() {
  const [joke] = useState(() => pick(JOKES))

  // Tell browsers and crawlers this isn't a real page (the host serves index.html with a 200).
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Page not found · The Wishing Well'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => {
      document.title = previousTitle
      meta.remove()
    }
  }, [])

  return (
    <div className="card space-y-3 py-10 text-center">
      <p className="text-6xl" aria-hidden>
        🕳️
      </p>
      <h1 className="gold-text font-title text-3xl font-black">{joke.title}</h1>
      <p className="text-gold-200/80">{joke.body}</p>
      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
        <Link to="/wall" className="btn-gold">
          Back to the Wall
        </Link>
        <Link to="/" className="btn-ghost">
          Home
        </Link>
      </div>
    </div>
  )
}
