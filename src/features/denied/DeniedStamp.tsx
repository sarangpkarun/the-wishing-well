import { motion } from 'framer-motion'

interface Props {
  /** "card" is a small corner stamp for the wall; "page" is the big slam on a wish page. */
  size?: 'card' | 'page'
}

/** Red rubber stamp that slams down once. Purely visual, never intercepts clicks. */
export function DeniedStamp({ size = 'card' }: Props) {
  const page = size === 'page'
  return (
    <motion.div
      role="img"
      aria-label="Wish denied. Try manifesting."
      initial={{ opacity: 0, scale: 2.6, rotate: -28 }}
      animate={{ opacity: 0.92, scale: 1, rotate: -9 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 }}
      className={`pointer-events-none inline-flex select-none flex-col items-center rounded-md border-red-500 text-red-500 ${
        page ? 'border-[5px] border-double px-5 py-2' : 'border-[3px] border-double px-2 py-0.5'
      }`}
      style={{ textShadow: '0 0 1px currentColor', boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.5)' }}
    >
      <span className={`font-title font-black uppercase leading-none tracking-widest ${page ? 'text-4xl' : 'text-sm'}`}>
        Denied,
      </span>
      <span className={`font-title font-bold uppercase leading-tight tracking-[0.15em] ${page ? 'text-lg' : 'text-[9px]'}`}>
        Try manifesting
      </span>
    </motion.div>
  )
}
