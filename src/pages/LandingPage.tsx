import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/layout/SiteFooter'

const TAGLINE =
  "Rich people who don't know what to do with their money, please click here. Nobody has ever clicked here."

export function LandingPage() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-12 text-center">
      <motion.p
        initial={{ opacity: 0, letterSpacing: '0.6em' }}
        animate={{ opacity: 1, letterSpacing: '0.35em' }}
        transition={{ duration: 1.4 }}
        className="text-[0.65rem] uppercase text-gold-400 sm:text-xs"
      >
        ✦ Est. Today · By Appointment Only ✦
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="mt-6 animate-float text-6xl sm:text-7xl"
        aria-hidden
      >
        👑
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.9 }}
        className="gold-text mt-4 font-title text-4xl font-black leading-tight sm:text-6xl"
      >
        The Wishing Well
      </motion.h1>

      <div className="my-6 flex w-full max-w-xs items-center gap-3 text-gold-500" aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500" />
        <span>♦</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500" />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1.2 }}
        className="text-lg font-semibold italic leading-relaxed text-gold-200 sm:text-2xl"
      >
        {TAGLINE}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mt-10 w-full sm:w-auto"
      >
        <Link to="/wall" className="btn-gold w-full px-10 py-4 text-lg uppercase tracking-widest sm:w-auto">
          Click Here
        </Link>
      </motion.div>

      <p className="mt-10 text-[0.65rem] uppercase tracking-[0.3em] text-gold-500/70">
        Nothing here is real · Obviously
      </p>
    </main>
    <SiteFooter />
    </div>
  )
}
