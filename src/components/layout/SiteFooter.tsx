export const DISCLAIMER = 'This is a joke site. No real money or gifts are exchanged.'

/** Shown on every page (landing included). Deliberately legible, not fine print. */
export function SiteFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`px-4 py-6 text-center ${className}`}>
      <p className="text-xs font-semibold text-gold-200/85 sm:text-sm">{DISCLAIMER}</p>
      <p className="mt-1 text-[11px] text-gold-200/50">
        Any resemblance to real billionaires is, legally, a coincidence.
      </p>
    </footer>
  )
}
