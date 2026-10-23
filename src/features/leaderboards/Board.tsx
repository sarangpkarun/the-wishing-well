import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from '../../components/ui/Skeleton'

export interface BoardRow {
  key: string
  title: string
  subtitle: string
  score: number
  scoreLabel: string
  href?: string
}

const MEDALS = ['🥇', '🥈', '🥉']

interface Props {
  title: string
  blurb: string
  rows: BoardRow[] | null
  error: string | null
  emptyText: string
}

/** One ranked list. Knows nothing about where its rows come from. */
export function Board({ title, blurb, rows, error, emptyText }: Props) {
  return (
    <section className="card space-y-3" aria-label={title}>
      <header>
        <h2 className="gold-text font-title text-xl font-black">{title}</h2>
        <p className="text-xs text-gold-200/60">{blurb}</p>
      </header>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      {!error && rows === null && (
        <div className="space-y-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      )}
      {rows?.length === 0 && <p className="py-4 text-center text-sm text-gold-200/60">{emptyText}</p>}

      <ol className="space-y-2">
        {rows?.map((r, i) => {
          const body: ReactNode = (
            <>
              <span className="w-8 shrink-0 text-center text-xl" aria-label={`Rank ${i + 1}`}>
                {MEDALS[i] ?? <span className="text-sm text-gold-200/50">{i + 1}</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-words font-semibold leading-snug">{r.title}</span>
                <span className="block text-xs text-gold-200/60">{r.subtitle}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xl font-black leading-none text-gold-300">{r.score}</span>
                <span className="text-[10px] uppercase tracking-wide text-gold-200/50">{r.scoreLabel}</span>
              </span>
            </>
          )
          const cls = 'flex items-center gap-3 rounded-xl border border-gold-500/20 bg-well-900/60 px-3 py-2'
          return (
            <motion.li key={r.key} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              {r.href ? (
                <Link to={r.href} className={`${cls} transition hover:border-gold-300/60`}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}
